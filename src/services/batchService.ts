// =====================================================
// BATCH SERVICE - PROCESSAMENTO EM LOTE DE DADOS ESPIRITUAIS
// =====================================================
// Responsável por gerar dados espirituais para múltiplas regiões
// usando AI Service + Queue System + Database Integration

import { supabase } from '../integrations/supabase/client';
import { aiService, type AIGenerationRequest, type SpiritualData } from './aiService';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

interface QueueItem {
  id?: string;
  region_name: string;
  region_type: 'country' | 'state' | 'city' | 'neighborhood';
  country_code?: string;
  parent_region?: string;
  coordinates?: { lat: number; lng: number };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  priority: number;
  result_data?: SpiritualData;
  error_message?: string;
  processing_attempts: number;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
  percentage: number;
  estimatedTimeRemaining: string;
  currentRegion?: string;
  errors: Array<{ region: string; error: string }>;
}

interface BatchConfig {
  batchSize: number;
  delayBetweenRequests: number; // milliseconds
  maxRetries: number;
  timeoutPerRequest: number; // milliseconds
  continueOnError: boolean;
}

// =====================================================
// DADOS: PAÍSES DA AMÉRICA DO SUL
// =====================================================

const SOUTH_AMERICA_COUNTRIES: Array<Omit<QueueItem, 'id' | 'status' | 'processing_attempts'>> = [
  {
    region_name: 'Brasil',
    region_type: 'country',
    country_code: 'BRA',
    coordinates: { lat: -14.2350, lng: -51.9253 },
    priority: 100 // Prioridade máxima
  },
  {
    region_name: 'Argentina',
    region_type: 'country',
    country_code: 'ARG',
    coordinates: { lat: -38.4161, lng: -63.6167 },
    priority: 90
  },
  {
    region_name: 'Chile',
    region_type: 'country',
    country_code: 'CHL',
    coordinates: { lat: -35.6751, lng: -71.5430 },
    priority: 90
  },
  {
    region_name: 'Peru',
    region_type: 'country',
    country_code: 'PER',
    coordinates: { lat: -9.1900, lng: -75.0152 },
    priority: 85
  },
  {
    region_name: 'Colômbia',
    region_type: 'country',
    country_code: 'COL',
    coordinates: { lat: 4.5709, lng: -74.2973 },
    priority: 85
  },
  {
    region_name: 'Venezuela',
    region_type: 'country',
    country_code: 'VEN',
    coordinates: { lat: 6.4238, lng: -66.5897 },
    priority: 80
  },
  {
    region_name: 'Equador',
    region_type: 'country',
    country_code: 'ECU',
    coordinates: { lat: -1.8312, lng: -78.1834 },
    priority: 75
  },
  {
    region_name: 'Bolívia',
    region_type: 'country',
    country_code: 'BOL',
    coordinates: { lat: -16.2902, lng: -63.5887 },
    priority: 75
  },
  {
    region_name: 'Paraguai',
    region_type: 'country',
    country_code: 'PRY',
    coordinates: { lat: -23.4425, lng: -58.4438 },
    priority: 70
  },
  {
    region_name: 'Uruguai',
    region_type: 'country',
    country_code: 'URY',
    coordinates: { lat: -32.5228, lng: -55.7658 },
    priority: 70
  },
  {
    region_name: 'Guiana',
    region_type: 'country',
    country_code: 'GUY',
    coordinates: { lat: 4.8604, lng: -58.9302 },
    priority: 60
  },
  {
    region_name: 'Suriname',
    region_type: 'country',
    country_code: 'SUR',
    coordinates: { lat: 3.9193, lng: -56.0278 },
    priority: 60
  }
];

// =====================================================
// CLASSE PRINCIPAL: BatchService
// =====================================================

class BatchService {
  private isProcessing = false;
  private currentBatch: QueueItem[] = [];
  private progressCallbacks: Array<(progress: BatchProgress) => void> = [];
  private config: BatchConfig = {
    batchSize: 3, // Processar 3 por vez para evitar rate limits
    delayBetweenRequests: 2000, // 2 segundos entre requests
    maxRetries: 3,
    timeoutPerRequest: 120000, // 2 minutos por request
    continueOnError: true
  };

  // =====================================================
  // CONFIGURAÇÃO E STATUS
  // =====================================================

  public setConfig(newConfig: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuração do batch atualizada:', this.config);
  }

  public onProgress(callback: (progress: BatchProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  public isRunning(): boolean {
    return this.isProcessing;
  }

  // =====================================================
  // QUEUE MANAGEMENT
  // =====================================================

  public async addToQueue(items: Array<Omit<QueueItem, 'id' | 'status' | 'processing_attempts'>>): Promise<void> {
    console.log(`📥 Adicionando ${items.length} itens à queue...`);

    const { data, error } = await supabase
      .from('ai_generation_queue')
      .insert(
        items.map(item => ({
          region_identifier: item.region_name,
          region_type: item.region_type,
          status: 'pending' as const,
          priority: item.priority || 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      );

    if (error) {
      console.error('❌ Erro ao adicionar à queue:', error);
      throw new Error(`Falha ao adicionar à queue: ${error.message}`);
    }

    console.log(`✅ ${items.length} itens adicionados à queue com sucesso`);
  }

  public async getQueueStatus(): Promise<{ total: number; pending: number; processing: number; completed: number; failed: number }> {
    const { data, error } = await supabase
      .from('ai_generation_queue')
      .select('status')
      .eq('region_type', 'country');

    if (error) {
      console.error('❌ Erro ao buscar status da queue:', error);
      return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    }

    const stats = data.reduce((acc, item) => {
      acc[item.status]++;
      acc.total++;
      return acc;
    }, { total: 0, pending: 0, processing: 0, completed: 0, failed: 0, retry: 0 });

    return stats;
  }

  public async clearQueue(): Promise<void> {
    console.log('🗑️ Limpando queue...');
    
    const { error } = await supabase
      .from('ai_generation_queue')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('❌ Erro ao limpar queue:', error);
      throw new Error(`Falha ao limpar queue: ${error.message}`);
    }

    console.log('✅ Queue limpa com sucesso');
  }

  // =====================================================
  // PROCESSAMENTO PRINCIPAL
  // =====================================================

  public async setupSouthAmericaBatch(): Promise<void> {
    console.log('🌎 Configurando batch da América do Sul...');
    
    // Verificar se já existem itens na queue
    const { data: existingItems } = await supabase
      .from('ai_generation_queue')
      .select('region_name')
      .eq('region_type', 'country')
      .in('country_code', SOUTH_AMERICA_COUNTRIES.map(c => c.country_code));

    const existingRegions = existingItems?.map(item => item.region_name) || [];
    
    // Filtrar apenas países que ainda não estão na queue
    const newCountries = SOUTH_AMERICA_COUNTRIES.filter(
      country => !existingRegions.includes(country.region_name)
    );

    if (newCountries.length === 0) {
      console.log('ℹ️ Todos os países da América do Sul já estão na queue');
      return;
    }

    console.log(`📋 Adicionando ${newCountries.length} novos países à queue...`);
    await this.addToQueue(newCountries);
  }

  public async processBatch(): Promise<BatchProgress> {
    if (this.isProcessing) {
      throw new Error('❌ Batch já está sendo processado');
    }

    console.log('🚀 Iniciando processamento em lote...');
    this.isProcessing = true;

    try {
      // Buscar itens pendentes da queue
      const { data: queueItems, error } = await supabase
        .from('ai_generation_queue')
        .select('*')
        .eq('status', 'pending')
        .eq('region_type', 'country')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Falha ao buscar queue: ${error.message}`);
      }

      if (!queueItems || queueItems.length === 0) {
        console.log('ℹ️ Nenhum item pendente na queue');
        return this.calculateProgress([]);
      }

      console.log(`📋 Encontrados ${queueItems.length} itens para processar`);
      this.currentBatch = queueItems;

      const startTime = Date.now();
      let completed = 0;
      let failed = 0;
      const errors: Array<{ region: string; error: string }> = [];

      // Processar em lotes menores
      for (let i = 0; i < queueItems.length; i += this.config.batchSize) {
        const chunk = queueItems.slice(i, i + this.config.batchSize);
        
        console.log(`🔄 Processando lote ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(queueItems.length / this.config.batchSize)}`);
        
        // Processar chunk em paralelo
        const chunkPromises = chunk.map(item => this.processQueueItem(item));
        const chunkResults = await Promise.allSettled(chunkPromises);

        // Contar resultados
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            completed++;
          } else {
            failed++;
            errors.push({
              region: chunk[index].region_name,
              error: result.reason?.message || 'Erro desconhecido'
            });
          }
        });

        // Atualizar progresso
        const progress = this.calculateProgress(queueItems, completed, failed, errors, startTime);
        this.notifyProgress(progress);

        // Delay entre chunks para evitar rate limiting
        if (i + this.config.batchSize < queueItems.length) {
          console.log(`⏳ Aguardando ${this.config.delayBetweenRequests}ms antes do próximo lote...`);
          await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenRequests));
        }
      }

      const finalProgress = this.calculateProgress(queueItems, completed, failed, errors, startTime);
      console.log(`🏁 Processamento concluído! ${completed} sucessos, ${failed} falhas`);
      
      return finalProgress;

    } finally {
      this.isProcessing = false;
    }
  }

  // =====================================================
  // PROCESSAMENTO INDIVIDUAL
  // =====================================================

  private async processQueueItem(item: QueueItem): Promise<void> {
    const itemId = item.id!;
    console.log(`🎯 Processando: ${item.region_name} (${item.country_code})`);

    try {
      // Marcar como processando
      await supabase
        .from('ai_generation_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          processing_attempts: item.processing_attempts + 1
        })
        .eq('id', itemId);

      // Preparar request para AI
      const aiRequest: AIGenerationRequest = {
        regionName: item.region_name,
        regionType: item.region_type,
        countryCode: item.country_code,
        parentRegion: item.parent_region,
        coordinates: item.coordinates,
        context: `País da América do Sul - Geração em lote para mapeamento espiritual global`
      };

      // Gerar dados espirituais
      const spiritualData = await aiService.generateSpiritualData(aiRequest);

      // Salvar resultado na queue
      await supabase
        .from('ai_generation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result_data: spiritualData
        })
        .eq('id', itemId);

      // Salvar na tabela principal
      await this.saveToSpiritualRegions(item, spiritualData);

      console.log(`✅ ${item.region_name} processado com sucesso`);

    } catch (error) {
      console.error(`❌ Erro ao processar ${item.region_name}:`, error);

      const shouldRetry = item.processing_attempts < this.config.maxRetries;
      const newStatus = shouldRetry ? 'retry' : 'failed';

      await supabase
        .from('ai_generation_queue')
        .update({
          status: newStatus,
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          completed_at: new Date().toISOString()
        })
        .eq('id', itemId);

      throw error;
    }
  }

  private async saveToSpiritualRegions(queueItem: QueueItem, spiritualData: SpiritualData): Promise<void> {
    const { error } = await supabase
      .from('spiritual_regions')
      .upsert({
        name: queueItem.region_name,
        region_type: queueItem.region_type,
        country_code: queueItem.country_code,
        latitude: queueItem.coordinates?.lat,
        longitude: queueItem.coordinates?.lng,
        spiritual_data: spiritualData,
        source: 'ai_generated',
        status: 'pending', // Requer aprovação
        confidence_score: 85, // Score padrão para dados AI
        created_by: (await supabase.auth.getUser()).data.user?.id
      }, {
        onConflict: 'name,region_type,parent_id'
      });

    if (error) {
      console.error('❌ Erro ao salvar spiritual_regions:', error);
      throw new Error(`Falha ao salvar região: ${error.message}`);
    }
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  private calculateProgress(
    total: QueueItem[],
    completed = 0,
    failed = 0,
    errors: Array<{ region: string; error: string }> = [],
    startTime?: number
  ): BatchProgress {
    const totalCount = total.length;
    const processing = this.isProcessing ? 1 : 0;
    const pending = Math.max(0, totalCount - completed - failed - processing);
    const percentage = totalCount > 0 ? Math.round(((completed + failed) / totalCount) * 100) : 0;

    let estimatedTimeRemaining = 'Calculando...';
    if (startTime && completed > 0) {
      const elapsed = Date.now() - startTime;
      const avgTimePerItem = elapsed / (completed + failed);
      const remaining = pending * avgTimePerItem;
      estimatedTimeRemaining = this.formatDuration(remaining);
    }

    return {
      total: totalCount,
      completed,
      failed,
      processing,
      pending,
      percentage,
      estimatedTimeRemaining,
      currentRegion: this.isProcessing ? 'Processando...' : undefined,
      errors
    };
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  private notifyProgress(progress: BatchProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('❌ Erro no callback de progresso:', error);
      }
    });
  }

  // =====================================================
  // MÉTODOS PÚBLICOS UTILITÁRIOS
  // =====================================================

  public async getGeneratedData(): Promise<any[]> {
    const { data, error } = await supabase
      .from('spiritual_regions')
      .select('*')
      .eq('region_type', 'country')
      .eq('source', 'ai_generated')
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar dados gerados:', error);
      return [];
    }

    return data || [];
  }

  public async exportResults(): Promise<string> {
    const data = await this.getGeneratedData();
    return JSON.stringify(data, null, 2);
  }

  public getSouthAmericaCountries(): typeof SOUTH_AMERICA_COUNTRIES {
    return SOUTH_AMERICA_COUNTRIES;
  }
}

// =====================================================
// EXPORTAR INSTÂNCIA SINGLETON
// =====================================================

export const batchService = new BatchService();

export type { BatchProgress, BatchConfig, QueueItem }; 