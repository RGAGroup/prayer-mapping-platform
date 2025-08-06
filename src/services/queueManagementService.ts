import { supabase } from '@/integrations/supabase/client';
import { aiService } from './aiService';
import type { Database } from '@/integrations/supabase/types';

// Types para fila de processamento
type QueueItem = Database['public']['Tables']['ai_processing_queue']['Row'];
type QueueInsert = Database['public']['Tables']['ai_processing_queue']['Insert'];
type QueueUpdate = Database['public']['Tables']['ai_processing_queue']['Update'];
type Batch = Database['public']['Tables']['ai_processing_batches']['Row'];
type BatchInsert = Database['public']['Tables']['ai_processing_batches']['Insert'];

export interface QueueBuilderConfig {
  continent: string;
  regionTypes: string[]; // ['country', 'state', 'city']
  filters: {
    onlyChristianMajority?: boolean;
    populationMin?: number;
    crisisRegions?: boolean;
    strategicImportance?: boolean;
  };
  estimatedCostPerRegion?: number;
  customPrompt?: string;
}

export interface QueuePreview {
  regions: Array<{
    name: string;
    type: string;
    continent: string;
    countryCode?: string;
    parentRegion?: string;
    priority: number;
    estimatedCost: number;
    culturalContext?: string;
  }>;
  totalCost: number;
  totalTime: number; // em minutos
  summary: {
    countries: number;
    states: number;
    cities: number;
    totalRegions: number;
  };
}

export interface ProcessingProgress {
  batchId: string;
  status: string;
  totalRegions: number;
  completedRegions: number;
  failedRegions: number;
  skippedRegions: number;
  currentRegion?: string;
  progressPercent: number;
  estimatedTimeRemaining?: number; // em minutos
  actualCost: number;
}

class QueueManagementService {
  private readonly DEFAULT_COST_PER_REGION = 0.03; // USD
  private readonly DEFAULT_TIME_PER_REGION = 45; // segundos

  /**
   * Constrói uma preview da fila baseada na configuração
   */
  async buildQueuePreview(config: QueueBuilderConfig): Promise<QueuePreview> {
    console.log('🔄 Construindo preview da fila:', config);

    try {
      // 1. Buscar regiões baseadas nos critérios
      const regions = await this.findRegionsByCriteria(config);
      
      // 2. Calcular prioridades e custos
      const prioritizedRegions = this.calculateRegionPriorities(regions, config);
      
      // 3. Calcular totais
      const totalCost = prioritizedRegions.reduce((sum, r) => sum + r.estimatedCost, 0);
      const totalTime = Math.round((prioritizedRegions.length * this.DEFAULT_TIME_PER_REGION) / 60);
      
      // 4. Gerar resumo
      const summary = this.generateSummary(prioritizedRegions);

      return {
        regions: prioritizedRegions,
        totalCost,
        totalTime,
        summary
      };

    } catch (error) {
      console.error('❌ Erro ao construir preview da fila:', error);
      throw error;
    }
  }

  /**
   * Cria um batch de processamento no banco de dados
   */
  async createProcessingBatch(
    name: string, 
    description: string,
    config: QueueBuilderConfig,
    preview: QueuePreview
  ): Promise<string> {
    console.log('📝 Criando batch de processamento:', name);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Criar batch
      const batchData: BatchInsert = {
        name,
        description,
        continent: config.continent,
        region_types: config.regionTypes,
        filters: config.filters,
        total_regions: preview.totalRegions,
        estimated_total_cost_usd: preview.totalCost,
        estimated_duration_hours: Math.round(preview.totalTime / 60 * 100) / 100,
        created_by: user.id,
        processing_settings: {
          customPrompt: config.customPrompt,
          costPerRegion: config.estimatedCostPerRegion || this.DEFAULT_COST_PER_REGION
        }
      };

      const { data: batch, error: batchError } = await supabase
        .from('ai_processing_batches')
        .insert(batchData)
        .select()
        .single();

      if (batchError) throw batchError;

      console.log('✅ Batch criado:', batch.id);

      // 2. Criar itens da fila
      const queueItems: QueueInsert[] = preview.regions.map((region, index) => ({
        region_name: region.name,
        region_type: region.type as 'country' | 'state' | 'city' | 'neighborhood',
        continent: region.continent,
        country_code: region.countryCode,
        parent_region_name: region.parentRegion,
        priority_level: region.priority,
        queue_order: index + 1,
        estimated_cost_usd: region.estimatedCost,
        batch_id: batch.id,
        custom_prompt: config.customPrompt,
        created_by: user.id
      }));

      const { error: queueError } = await supabase
        .from('ai_processing_queue')
        .insert(queueItems);

      if (queueError) throw queueError;

      console.log(`✅ ${queueItems.length} itens adicionados à fila`);

      return batch.id;

    } catch (error) {
      console.error('❌ Erro ao criar batch de processamento:', error);
      throw error;
    }
  }

  /**
   * Inicia o processamento de um batch
   */
  async startBatchProcessing(batchId: string): Promise<void> {
    console.log('🚀 Iniciando processamento do batch:', batchId);

    try {
      // Atualizar status do batch
      await supabase
        .from('ai_processing_batches')
        .update({ 
          status: 'running', 
          started_at: new Date().toISOString() 
        })
        .eq('id', batchId);

      // Iniciar processamento em background
      this.processBatchInBackground(batchId);

    } catch (error) {
      console.error('❌ Erro ao iniciar processamento:', error);
      throw error;
    }
  }

  /**
   * Pausa o processamento de um batch
   */
  async pauseBatchProcessing(batchId: string): Promise<void> {
    console.log('⏸️ Pausando processamento do batch:', batchId);

    await supabase
      .from('ai_processing_batches')
      .update({ status: 'paused' })
      .eq('id', batchId);
  }

  /**
   * Para completamente o processamento de um batch
   */
  async stopBatchProcessing(batchId: string): Promise<void> {
    console.log('🛑 Parando processamento do batch:', batchId);

    await supabase
      .from('ai_processing_batches')
      .update({ status: 'cancelled' })
      .eq('id', batchId);
  }

  /**
   * Obtém o progresso de um batch
   */
  async getBatchProgress(batchId: string): Promise<ProcessingProgress> {
    try {
      const { data: progressData, error } = await supabase
        .rpc('get_batch_progress', { batch_uuid: batchId });

      if (error) throw error;

      const { data: batch } = await supabase
        .from('ai_processing_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      const { data: currentItem } = await supabase
        .from('ai_processing_queue')
        .select('region_name')
        .eq('batch_id', batchId)
        .eq('status', 'processing')
        .single();

      return {
        batchId,
        status: batch?.status || 'unknown',
        totalRegions: progressData.total || 0,
        completedRegions: progressData.completed || 0,
        failedRegions: progressData.failed || 0,
        skippedRegions: progressData.skipped || 0,
        currentRegion: currentItem?.region_name,
        progressPercent: progressData.progress_percent || 0,
        actualCost: batch?.actual_total_cost_usd || 0
      };

    } catch (error) {
      console.error('❌ Erro ao obter progresso do batch:', error);
      throw error;
    }
  }

  /**
   * Lista batches do usuário
   */
  async getUserBatches(): Promise<Batch[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: batches, error } = await supabase
        .from('ai_processing_batches')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return batches || [];

    } catch (error) {
      console.error('❌ Erro ao listar batches:', error);
      throw error;
    }
  }

  /**
   * Busca regiões baseadas nos critérios
   */
  private async findRegionsByCriteria(config: QueueBuilderConfig): Promise<any[]> {
    // Dados das Américas (expandível para outros continentes)
    const americasRegions = this.getAmericasRegionsData();
    
    let filteredRegions = americasRegions;

    // Filtrar por continente
    if (config.continent) {
      filteredRegions = filteredRegions.filter(r => 
        r.continent.toLowerCase() === config.continent.toLowerCase()
      );
    }

    // Filtrar por tipos de região
    if (config.regionTypes.length > 0) {
      filteredRegions = filteredRegions.filter(r => 
        config.regionTypes.includes(r.type)
      );
    }

    // Aplicar filtros específicos
    if (config.filters.onlyChristianMajority) {
      filteredRegions = filteredRegions.filter(r => r.christianMajority);
    }

    if (config.filters.populationMin) {
      filteredRegions = filteredRegions.filter(r => 
        r.population >= config.filters.populationMin!
      );
    }

    if (config.filters.crisisRegions) {
      filteredRegions = filteredRegions.filter(r => r.inCrisis);
    }

    if (config.filters.strategicImportance) {
      filteredRegions = filteredRegions.filter(r => r.strategic);
    }

    return filteredRegions;
  }

  /**
   * Calcula prioridades das regiões
   */
  private calculateRegionPriorities(regions: any[], config: QueueBuilderConfig): QueuePreview['regions'] {
    return regions.map(region => {
      let priority = 3; // Padrão: média

      // Países cristãos = alta prioridade
      if (region.christianMajority) priority = Math.min(priority, 1);
      
      // Regiões em crise = alta prioridade
      if (region.inCrisis) priority = Math.min(priority, 1);
      
      // Estratégicas = média-alta prioridade
      if (region.strategic) priority = Math.min(priority, 2);
      
      // Populações grandes = média prioridade
      if (region.population > 10000000) priority = Math.min(priority, 2);

      return {
        name: region.name,
        type: region.type,
        continent: region.continent,
        countryCode: region.countryCode,
        parentRegion: region.parentRegion,
        priority,
        estimatedCost: config.estimatedCostPerRegion || this.DEFAULT_COST_PER_REGION,
        culturalContext: region.culturalContext
      };
    }).sort((a, b) => a.priority - b.priority); // Ordenar por prioridade
  }

  /**
   * Gera resumo da fila
   */
  private generateSummary(regions: QueuePreview['regions']): QueuePreview['summary'] {
    return {
      countries: regions.filter(r => r.type === 'country').length,
      states: regions.filter(r => r.type === 'state').length,
      cities: regions.filter(r => r.type === 'city').length,
      totalRegions: regions.length
    };
  }

  /**
   * Processa batch em background
   */
  private async processBatchInBackground(batchId: string): Promise<void> {
    console.log(`🔄 Iniciando processamento background do batch ${batchId}`);

    try {
      while (true) {
        // Verificar se deve continuar processando
        const { data: batch } = await supabase
          .from('ai_processing_batches')
          .select('status')
          .eq('id', batchId)
          .single();

        if (!batch || batch.status !== 'running') {
          console.log(`⏸️ Processamento pausado/parado para batch ${batchId}`);
          break;
        }

        // Buscar próximo item da fila
        const { data: nextItem } = await supabase
          .from('ai_processing_queue')
          .select('*')
          .eq('batch_id', batchId)
          .eq('status', 'queued')
          .order('priority_level')
          .order('queue_order')
          .limit(1)
          .single();

        if (!nextItem) {
          // Não há mais itens para processar
          await this.completeBatch(batchId);
          break;
        }

        // Processar item
        await this.processQueueItem(nextItem);

        // Delay entre processamentos
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`❌ Erro no processamento background do batch ${batchId}:`, error);
      
      await supabase
        .from('ai_processing_batches')
        .update({ status: 'failed' })
        .eq('id', batchId);
    }
  }

  /**
   * Processa um item individual da fila
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`🤖 Processando: ${item.region_name} (${item.region_type})`);

      // Atualizar status para 'processing'
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'processing', 
          started_at: new Date().toISOString(),
          current_attempts: item.current_attempts + 1
        })
        .eq('id', item.id);

      // Processar diretamente via Edge Function para evitar problemas de payload
      const { supabase: authSupabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await authSupabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('❌ Usuário não autenticado');
      }

      const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
      
      const requestData = {
        regionName: item.region_name,
        regionType: item.region_type,
        queueId: item.id,
        countryCode: item.country_code || 'US',
        parentRegion: item.parent_region_name || '',
        context: `Continente: ${item.continent || 'Americas'}`
      };
      
      // Validar dados obrigatórios
      if (!requestData.regionName || !requestData.regionType) {
        throw new Error(`❌ Dados obrigatórios faltando: regionName=${requestData.regionName}, regionType=${requestData.regionType}`);
      }
      
      console.log('📤 Enviando dados para Edge Function:', requestData);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/spiritual-ai-generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Status da resposta:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da Edge Function:', errorText);
        throw new Error(`Edge Function Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`AI Error: ${result.error}`);
      }

      const aiResult = result.data;

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      // Salvar resultado na fila
      await supabase
        .from('ai_processing_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          ai_response: aiResult as any,
          actual_duration_seconds: duration,
          actual_cost_usd: item.estimated_cost_usd // Por enquanto usa a estimativa
        })
        .eq('id', item.id);

      // Salvar dados espirituais na tabela principal
      await this.saveToSpiritualRegions(item, aiResult);

      console.log(`✅ ${item.region_name} processado com sucesso (${duration}s)`);

    } catch (error) {
      console.error(`❌ Erro ao processar ${item.region_name}:`, error);

      // Marcar como falha
      await supabase
        .from('ai_processing_queue')
        .update({
          status: 'failed',
          last_error: error instanceof Error ? error.message : 'Erro desconhecido',
          error_count: item.error_count + 1
        })
        .eq('id', item.id);
    }
  }

  /**
   * Salva os dados espirituais na tabela principal
   */
  private async saveToSpiritualRegions(item: QueueItem, aiResult: any): Promise<void> {
    try {
      console.log(`💾 Salvando dados espirituais para ${item.region_name}...`);

      // Verificar se já existe registro
      const { data: existingRegion } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', item.region_name)
        .eq('region_type', item.region_type)
        .single();

      const spiritualData = {
        name: item.region_name,
        region_type: item.region_type,
        country_code: item.country_code,
        continent: item.continent,
        parent_region_id: null, // Pode ser ajustado se necessário
        hierarchy_level: item.region_type === 'country' ? 1 : item.region_type === 'state' ? 2 : 3,
        
        // Dados espirituais da IA
        strongholds: aiResult.strongholds || [],
        prophetic_word: aiResult.propheticWord || '',
        prayer_targets: aiResult.prayerTargets || [],
        spiritual_alerts: aiResult.spiritualAlerts || [],
        geopolitical_system: aiResult.geopoliticalSystem || {},
        spiritual_influences: aiResult.spiritualInfluences || [],
        mission_bases: aiResult.missionBases || [],
        revival_testimonies: aiResult.revivalTestimonies || [],
        intercessor_actions: aiResult.intercessorActions || [],
        spiritual_climate: aiResult.spiritualClimate || {},
        churches: aiResult.churches || {},
        cultural_context: aiResult.culturalContext || '',
        languages_spoken: aiResult.languagesSpoken || [],
        religious_composition: aiResult.religiousComposition || {},
        
        // Metadados
        ai_generated: true,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingRegion) {
        // Atualizar registro existente
        await supabase
          .from('spiritual_regions')
          .update(spiritualData)
          .eq('id', existingRegion.id);
        
        console.log(`🔄 Dados atualizados para ${item.region_name}`);
      } else {
        // Criar novo registro
        await supabase
          .from('spiritual_regions')
          .insert(spiritualData);
        
        console.log(`✨ Novo registro criado para ${item.region_name}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao salvar dados espirituais para ${item.region_name}:`, error);
      // Não falhar o processamento por erro de salvamento
    }
  }

  /**
   * Marca um batch como concluído
   */
  private async completeBatch(batchId: string): Promise<void> {
    console.log(`🎉 Concluindo batch ${batchId}`);

    await supabase
      .from('ai_processing_batches')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId);
  }

  /**
   * Dados das regiões das Américas (expandível)
   */
  private getAmericasRegionsData(): any[] {
    return [
      // América do Norte - Países
      {
        name: 'United States',
        type: 'country',
        continent: 'Americas',
        countryCode: 'US',
        population: 331000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Diversidade religiosa, secularização urbana, polarização política'
      },
      {
        name: 'Canada',
        type: 'country',
        continent: 'Americas',
        countryCode: 'CA',
        population: 38000000,
        christianMajority: false,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Sociedade secular pós-cristã, multiculturalismo'
      },
      {
        name: 'Mexico',
        type: 'country',
        continent: 'Americas',
        countryCode: 'MX',
        population: 128000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Católico tradicional com crescimento evangélico'
      },

      // América Central - Países
      {
        name: 'Guatemala',
        type: 'country',
        continent: 'Americas',
        countryCode: 'GT',
        population: 17000000,
        christianMajority: true,
        strategic: false,
        inCrisis: true,
        culturalContext: 'Maioria evangélica, pobreza, violência'
      },
      {
        name: 'Honduras',
        type: 'country',
        continent: 'Americas',
        countryCode: 'HN',
        population: 10000000,
        christianMajority: true,
        strategic: false,
        inCrisis: true,
        culturalContext: 'Católico e evangélico, crise migratória'
      },
      {
        name: 'El Salvador',
        type: 'country',
        continent: 'Americas',
        countryCode: 'SV',
        population: 6500000,
        christianMajority: true,
        strategic: false,
        inCrisis: true,
        culturalContext: 'Evangélico crescente, violência de gangues'
      },
      {
        name: 'Nicaragua',
        type: 'country',
        continent: 'Americas',
        countryCode: 'NI',
        population: 6700000,
        christianMajority: true,
        strategic: false,
        inCrisis: true,
        culturalContext: 'Católico tradicional, crise política'
      },
      {
        name: 'Costa Rica',
        type: 'country',
        continent: 'Americas',
        countryCode: 'CR',
        population: 5100000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Católico estável, democracia consolidada'
      },
      {
        name: 'Panama',
        type: 'country',
        continent: 'Americas',
        countryCode: 'PA',
        population: 4300000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Católico, centro logístico internacional'
      },

      // América do Sul - Países
      {
        name: 'Brazil',
        type: 'country',
        continent: 'Americas',
        countryCode: 'BR',
        population: 215000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Católico e evangélico, centro missionário'
      },
      {
        name: 'Argentina',
        type: 'country',
        continent: 'Americas',
        countryCode: 'AR',
        population: 45000000,
        christianMajority: true,
        strategic: true,
        inCrisis: true,
        culturalContext: 'Católico tradicional, crise econômica'
      },
      {
        name: 'Chile',
        type: 'country',
        continent: 'Americas',
        countryCode: 'CL',
        population: 19000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Católico em declínio, secularização'
      },
      {
        name: 'Colombia',
        type: 'country',
        continent: 'Americas',
        countryCode: 'CO',
        population: 51000000,
        christianMajority: true,
        strategic: true,
        inCrisis: true,
        culturalContext: 'Católico tradicional, conflito armado'
      },
      {
        name: 'Peru',
        type: 'country',
        continent: 'Americas',
        countryCode: 'PE',
        population: 33000000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Católico com sincretismo indígena'
      },
      {
        name: 'Venezuela',
        type: 'country',
        continent: 'Americas',
        countryCode: 'VE',
        population: 28000000,
        christianMajority: true,
        strategic: false,
        inCrisis: true,
        culturalContext: 'Católico, crise humanitária severa'
      },
      {
        name: 'Ecuador',
        type: 'country',
        continent: 'Americas',
        countryCode: 'EC',
        population: 18000000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Católico com influências indígenas'
      },
      {
        name: 'Bolivia',
        type: 'country',
        continent: 'Americas',
        countryCode: 'BO',
        population: 12000000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Católico e indígena, oportunidades missionárias'
      },
      {
        name: 'Paraguay',
        type: 'country',
        continent: 'Americas',
        countryCode: 'PY',
        population: 7100000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Católico conservador'
      },
      {
        name: 'Uruguay',
        type: 'country',
        continent: 'Americas',
        countryCode: 'UY',
        population: 3500000,
        christianMajority: false,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Mais secular da América do Sul'
      },
      {
        name: 'Guyana',
        type: 'country',
        continent: 'Americas',
        countryCode: 'GY',
        population: 790000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Diversidade religiosa, influência hindu'
      },
      {
        name: 'Suriname',
        type: 'country',
        continent: 'Americas',
        countryCode: 'SR',
        population: 590000,
        christianMajority: true,
        strategic: false,
        inCrisis: false,
        culturalContext: 'Diversidade étnica e religiosa'
      },

      // Estados/Províncias principais (exemplos)
      {
        name: 'California',
        type: 'state',
        continent: 'Americas',
        countryCode: 'US',
        parentRegion: 'United States',
        population: 39000000,
        christianMajority: false,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Tecnologia, entretenimento, diversidade'
      },
      {
        name: 'Texas',
        type: 'state',
        continent: 'Americas',
        countryCode: 'US',
        parentRegion: 'United States',
        population: 30000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Evangélico forte, conservador'
      },
      {
        name: 'Buenos Aires',
        type: 'state',
        continent: 'Americas',
        countryCode: 'AR',
        parentRegion: 'Argentina',
        population: 17000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Centro urbano, católico secularizado'
      },
      {
        name: 'São Paulo',
        type: 'state',
        continent: 'Americas',
        countryCode: 'BR',
        parentRegion: 'Brazil',
        population: 46000000,
        christianMajority: true,
        strategic: true,
        inCrisis: false,
        culturalContext: 'Centro econômico, diversidade religiosa'
      }
    ];
  }
}

// Instância singleton
export const queueManagementService = new QueueManagementService();

export type { QueueItem, Batch, QueueBuilderConfig, QueuePreview, ProcessingProgress }; 