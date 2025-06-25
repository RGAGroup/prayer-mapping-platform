// =====================================================
// SOUTH AMERICA BATCH SERVICE - VERSÃO SIMPLIFICADA
// =====================================================
// Serviço especializado para gerar dados dos 12 países da América do Sul

import { supabase } from '../integrations/supabase/client';
import { aiService, type AIGenerationRequest, type SpiritualData } from './aiService';
import { googleGeoDataService } from './googleGeoDataService';

// =====================================================
// PAÍSES DA AMÉRICA DO SUL
// =====================================================

interface SouthAmericaCountry {
  name: string;
  code: string;
  priority: number; // 1 = alta prioridade, 2 = média, 3 = baixa
}

// Países da América do Sul por prioridade ministerial
const southAmericaCountries: SouthAmericaCountry[] = [
  // Alta prioridade - Países com maior movimento cristão
  { name: 'Argentina', code: 'AR', priority: 1 },
  { name: 'Colombia', code: 'CO', priority: 1 },
  { name: 'Chile', code: 'CL', priority: 1 },
  { name: 'Peru', code: 'PE', priority: 1 },
  
  // Média prioridade
  { name: 'Venezuela', code: 'VE', priority: 2 },
  { name: 'Ecuador', code: 'EC', priority: 2 },
  { name: 'Uruguay', code: 'UY', priority: 2 },
  { name: 'Paraguay', code: 'PY', priority: 2 },
  { name: 'Bolivia', code: 'BO', priority: 2 },
  
  // Baixa prioridade (menor população cristã)
  { name: 'Guyana', code: 'GY', priority: 3 },
  { name: 'Suriname', code: 'SR', priority: 3 },
  { name: 'French Guiana', code: 'GF', priority: 3 }
];

// =====================================================
// INTERFACES
// =====================================================

interface ProcessingProgress {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  percentage: number;
  currentCountry?: string;
  errors: Array<{ country: string; error: string }>;
}

interface CountryResult {
  country: string;
  success: boolean;
  data?: SpiritualData;
  error?: string;
  duration?: number;
}

// =====================================================
// CLASSE PRINCIPAL
// =====================================================

export class SouthAmericaBatchService {
  private processingStatus = {
    isRunning: false,
    currentStep: 0,
    totalSteps: 0,
    currentCountry: '',
    progress: 0,
    logs: [] as string[]
  };

  // =====================================================
  // CONFIGURAÇÃO E STATUS
  // =====================================================

  public onProgress(callback: (progress: ProcessingProgress) => void): void {
    // Implementation needed
  }

  public isRunning(): boolean {
    return this.processingStatus.isRunning;
  }

  public getCountries() {
    return southAmericaCountries;
  }

  // =====================================================
  // VERIFICAÇÃO DE STATUS
  // =====================================================

  public async getExistingData(): Promise<Array<{ name: string; hasData: boolean; status: string }>> {
    const { data, error } = await supabase
      .from('spiritual_regions')
      .select('name, spiritual_data, status')
      .eq('region_type', 'country')
      .in('country_code', southAmericaCountries.map(c => c.code));

    if (error) {
      console.error('❌ Erro ao verificar dados existentes:', error);
      return [];
    }

    return southAmericaCountries.map(country => {
      const existing = data?.find(d => d.name === country.name);
      return {
        name: country.name,
        hasData: !!existing?.spiritual_data,
        status: existing?.status || 'not_found'
      };
    });
  }

  public async getStats(): Promise<{ total: number; withData: number; approved: number; pending: number }> {
    const existing = await this.getExistingData();
    
    return {
      total: southAmericaCountries.length,
      withData: existing.filter(e => e.hasData).length,
      approved: existing.filter(e => e.status === 'approved').length,
      pending: existing.filter(e => e.status === 'pending').length
    };
  }

  // =====================================================
  // PROCESSAMENTO PRINCIPAL
  // =====================================================

  public async processAllCountries(): Promise<CountryResult[]> {
    if (this.processingStatus.isRunning) {
      throw new Error('❌ Processamento já está em andamento');
    }

    console.log('🌎 Iniciando processamento da América do Sul...');
    this.processingStatus.isRunning = true;
    this.processingStatus.currentStep = 0;
    this.processingStatus.logs = [];

    const results: CountryResult[] = [];
    const startTime = Date.now();

    try {
      // Verificar quais países ainda precisam ser processados
      const existing = await this.getExistingData();
      const countriesToProcess = southAmericaCountries.filter(country => {
        const existingData = existing.find(e => e.name === country.name);
        return !existingData?.hasData; // Processar apenas países sem dados
      });

      if (countriesToProcess.length === 0) {
        console.log('✅ Todos os países já possuem dados!');
        this.notifyProgress({
          total: southAmericaCountries.length,
          completed: southAmericaCountries.length,
          failed: 0,
          processing: 0,
          percentage: 100,
          errors: []
        });
        return [];
      }

      console.log(`📋 Processando ${countriesToProcess.length} países...`);

      // Processar cada país
      for (let i = 0; i < countriesToProcess.length; i++) {
        const country = countriesToProcess[i];
        const countryStartTime = Date.now();

        console.log(`🎯 Processando ${country.name} (${i + 1}/${countriesToProcess.length})`);

        // Atualizar progresso
        this.notifyProgress({
          total: countriesToProcess.length,
          completed: i,
          failed: results.filter(r => !r.success).length,
          processing: 1,
          percentage: Math.round((i / countriesToProcess.length) * 100),
          currentCountry: country.name,
          errors: results.filter(r => !r.success).map(r => ({ country: r.country, error: r.error || 'Erro desconhecido' }))
        });

        try {
          // Gerar dados espirituais
          const aiRequest: AIGenerationRequest = {
            regionName: country.name,
            regionType: 'country',
            countryCode: country.code,
            coordinates: { lat: 0, lng: 0 }, // Placeholder coordinates
            context: `País da América do Sul - Processamento em lote para mapeamento espiritual global`
          };

          const spiritualData = await aiService.generateSpiritualData(aiRequest);

          // Salvar no banco
          await this.saveCountryData(country, spiritualData);

          const duration = Date.now() - countryStartTime;
          results.push({
            country: country.name,
            success: true,
            data: spiritualData,
            duration
          });

          console.log(`✅ ${country.name} processado com sucesso em ${duration}ms`);

          // Delay para evitar rate limiting
          if (i < countriesToProcess.length - 1) {
            console.log('⏳ Aguardando 3 segundos...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (error) {
          const duration = Date.now() - countryStartTime;
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          
          results.push({
            country: country.name,
            success: false,
            error: errorMessage,
            duration
          });

          console.error(`❌ Erro ao processar ${country.name}:`, error);
        }
      }

      const totalDuration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`🏁 Processamento concluído em ${Math.round(totalDuration / 1000)}s`);
      console.log(`✅ Sucessos: ${successful}`);
      console.log(`❌ Falhas: ${failed}`);

      // Progresso final
      this.notifyProgress({
        total: countriesToProcess.length,
        completed: successful,
        failed: failed,
        processing: 0,
        percentage: 100,
        errors: results.filter(r => !r.success).map(r => ({ country: r.country, error: r.error || 'Erro desconhecido' }))
      });

      return results;

    } finally {
      this.processingStatus.isRunning = false;
    }
  }

  // =====================================================
  // PROCESSAMENTO INDIVIDUAL
  // =====================================================

  public async processCountry(country: SouthAmericaCountry): Promise<CountryResult> {
    this.processingStatus.currentCountry = country.name;
    console.log(`🎯 Processando ${country.name} individualmente...`);
    const startTime = Date.now();

    try {
      // PASSO 1: Inserir o país
      this.processingStatus.currentStep++;
      await this.insertCountry(country);
      
      // PASSO 2: Buscar e inserir estados
      this.processingStatus.currentStep++;
      const states = await this.processStates(country);
      
      // PASSO 3: Buscar e inserir cidades (apenas para capitais por agora)
      this.processingStatus.currentStep++;
      await this.processCities(country, states);
      
      const duration = Date.now() - startTime;
      
      return {
        country: country.name,
        success: true,
        data: this.createDefaultSpiritualData(country.name, 'country'),
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      return {
        country: country.name,
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  // Inserir país no banco
  private async insertCountry(country: SouthAmericaCountry): Promise<void> {
    try {
      // Verificar se país já existe
      const { data: existingCountry } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', country.name)
        .eq('region_type', 'country')
        .maybeSingle();

      if (existingCountry) {
        this.addLog(`⚠️ [${country.name}] País já existe no banco`);
        return;
      }

      // Inserir país com coordenadas padrão
      const { error } = await supabase
        .from('spiritual_regions')
        .insert({
          name: country.name,
          region_type: 'country',
          country_code: country.code,
          parent_id: null,
          coordinates: { lat: 0, lng: 0 }, // Coordenadas padrão por agora
          status: 'pending',
          data_source: 'imported',
          spiritual_data: this.createDefaultSpiritualData(country.name, 'country')
        });

      if (error) throw error;
      
      this.addLog(`✅ País inserido: ${country.name}`);
      
    } catch (error) {
      throw new Error(`Erro ao inserir país ${country.name}: ${error}`);
    }
  }

  // =====================================================
  // SALVAMENTO NO BANCO
  // =====================================================

  private async saveCountryData(country: SouthAmericaCountry, spiritualData: SpiritualData): Promise<void> {
    const user = await supabase.auth.getUser();

    // Primeiro, verificar se o país já existe
    const { data: existingData } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('name', country.name)
      .eq('region_type', 'country')
      .single();

    const recordData = {
      name: country.name,
      region_type: 'country',
      country_code: country.code,
      coordinates: { lat: 0, lng: 0 }, // Placeholder coordinates
      spiritual_data: spiritualData as any,
      data_source: 'ai_generated',
      status: 'pending', // Requer aprovação
      created_by: user.data.user?.id,
      updated_at: new Date().toISOString()
    };

    let error;

    if (existingData) {
      // Atualizar registro existente
      const { error: updateError } = await supabase
        .from('spiritual_regions')
        .update(recordData)
        .eq('id', existingData.id);
      error = updateError;
    } else {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('spiritual_regions')
        .insert({
          ...recordData,
          created_at: new Date().toISOString()
        });
      error = insertError;
    }

    if (error) {
      console.error('❌ Erro ao salvar no banco:', error);
      throw new Error(`Falha ao salvar ${country.name}: ${error.message}`);
    }

    console.log(`💾 ${country.name} salvo no banco com sucesso`);
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  private notifyProgress(progress: ProcessingProgress): void {
    // Implementation needed
  }

  public async exportResults(): Promise<string> {
    const { data, error } = await supabase
      .from('spiritual_regions')
      .select('*')
      .eq('region_type', 'country')
      .in('country_code', southAmericaCountries.map(c => c.code))
      .order('name');

    if (error) {
      throw new Error(`Erro ao exportar: ${error.message}`);
    }

    return JSON.stringify(data, null, 2);
  }

  // Iniciar população completa da América do Sul
  async populateSouthAmerica(priorityLevel: number = 1): Promise<void> {
    if (this.processingStatus.isRunning) {
      throw new Error('População já está em andamento');
    }

    this.processingStatus.isRunning = true;
    this.processingStatus.currentStep = 0;
    this.processingStatus.logs = [];

    try {
      // Filtrar países por prioridade
      const countriesToProcess = southAmericaCountries.filter(c => c.priority <= priorityLevel);
      this.processingStatus.totalSteps = countriesToProcess.length * 3; // País, Estados, Cidades
      
      this.addLog(`🌎 [AMÉRICA DO SUL] Iniciando população de ${countriesToProcess.length} países (prioridade: ${priorityLevel})`);
      
      for (const country of countriesToProcess) {
        await this.processCountry(country);
        await this.delay(1000); // Pausa entre países
      }
      
      this.addLog(`🎉 [AMÉRICA DO SUL COMPLETA] População finalizada com sucesso!`);
      
    } catch (error) {
      this.addLog(`❌ [ERRO CRÍTICO] ${error}`);
      console.error('Erro na população da América do Sul:', error);
      throw error;
    } finally {
      this.processingStatus.isRunning = false;
    }
  }

  // Processar estados de um país
  private async processStates(country: SouthAmericaCountry): Promise<any[]> {
    try {
      this.addLog(`🏛️ [${country.name}] Buscando estados...`);
      
      const states = await googleGeoDataService.getStatesByCountry(country.code);
      
      if (!states || states.length === 0) {
        this.addLog(`⚠️ [${country.name}] Nenhum estado encontrado`);
        return [];
      }

      // Buscar país no banco para pegar parent_id
      const { data: parentCountry } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', country.name)
        .eq('region_type', 'country')
        .single();

      if (!parentCountry) {
        throw new Error(`País ${country.name} não encontrado no banco`);
      }

      const insertedStates = [];

      for (const state of states.slice(0, 5)) { // Limitar a 5 estados principais
        try {
          // Extrair nome do estado usando address_components
          const stateName = this.extractStateName(state);
          if (!stateName) continue;

          // Verificar se estado já existe
          const { data: existingState } = await supabase
            .from('spiritual_regions')
            .select('id')
            .eq('name', stateName)
            .eq('region_type', 'state')
            .eq('parent_id', parentCountry.id)
            .maybeSingle();

          if (existingState) {
            this.addLog(`⚠️ Estado já existe: ${stateName}`);
            insertedStates.push({ name: stateName, place: state });
            continue;
          }

          // Inserir estado
          const { error } = await supabase
            .from('spiritual_regions')
            .insert({
              name: stateName,
              region_type: 'state',
              country_code: country.code,
              parent_id: parentCountry.id,
              coordinates: {
                lat: state.geometry.location.lat,
                lng: state.geometry.location.lng
              },
              status: 'pending',
              data_source: 'imported',
              spiritual_data: this.createDefaultSpiritualData(stateName, 'state')
            });

          if (error) throw error;
          
          this.addLog(`✅ Estado inserido: ${stateName}`);
          insertedStates.push({ name: stateName, place: state });
          
          await this.delay(200); // Rate limiting
          
        } catch (error) {
          this.addLog(`❌ Erro ao inserir estado: ${error}`);
        }
      }
      
      return insertedStates;
      
    } catch (error) {
      throw new Error(`Erro ao processar estados de ${country.name}: ${error}`);
    }
  }

  // Processar cidades principais (apenas capitais por agora)
  private async processCities(country: SouthAmericaCountry, states: any[]): Promise<void> {
    try {
      this.addLog(`🏙️ [${country.name}] Buscando cidades principais...`);
      
      // Processar apenas os 2 primeiros estados para evitar sobrecarga
      const mainStates = states.slice(0, 2);
      
      for (const state of mainStates) {
        try {
          const cities = await googleGeoDataService.getCitiesByState(country.code, state.name);
          
          if (!cities || cities.length === 0) {
            this.addLog(`⚠️ [${state.name}] Nenhuma cidade encontrada`);
            continue;
          }

          // Buscar estado no banco para pegar parent_id
          const { data: parentState } = await supabase
            .from('spiritual_regions')
            .select('id')
            .eq('name', state.name)
            .eq('region_type', 'state')
            .maybeSingle();

          if (!parentState) {
            this.addLog(`⚠️ Estado ${state.name} não encontrado no banco`);
            continue;
          }

          // Inserir apenas a primeira cidade (principal)
          for (const city of cities.slice(0, 1)) {
            try {
              // Extrair nome da cidade
              const cityName = this.extractCityName(city);
              if (!cityName) continue;

              // Verificar se cidade já existe
              const { data: existingCity } = await supabase
                .from('spiritual_regions')
                .select('id')
                .eq('name', cityName)
                .eq('region_type', 'city')
                .eq('parent_id', parentState.id)
                .maybeSingle();

              if (existingCity) {
                this.addLog(`⚠️ Cidade já existe: ${cityName}`);
                continue;
              }

              // Inserir cidade
              const { error } = await supabase
                .from('spiritual_regions')
                .insert({
                  name: cityName,
                  region_type: 'city',
                  country_code: country.code,
                  parent_id: parentState.id,
                  coordinates: {
                    lat: city.geometry.location.lat,
                    lng: city.geometry.location.lng
                  },
                  status: 'pending',
                  data_source: 'imported',
                  spiritual_data: this.createDefaultSpiritualData(cityName, 'city')
                });

              if (error) throw error;
              
              this.addLog(`✅ Cidade inserida: ${cityName}`);
              
              await this.delay(300); // Rate limiting
              
            } catch (error) {
              this.addLog(`❌ Erro ao inserir cidade: ${error}`);
            }
          }
          
        } catch (error) {
          this.addLog(`❌ Erro ao processar cidades de ${state.name}: ${error}`);
        }
      }
      
    } catch (error) {
      throw new Error(`Erro ao processar cidades de ${country.name}: ${error}`);
    }
  }

  // Extrair nome do estado do objeto GoogleGeoPlace
  private extractStateName(place: any): string | null {
    try {
      // Procurar por administrative_area_level_1 nos address_components
      const stateComponent = place.address_components?.find((component: any) => 
        component.types.includes('administrative_area_level_1')
      );
      return stateComponent?.long_name || null;
    } catch (error) {
      console.error('Erro ao extrair nome do estado:', error);
      return null;
    }
  }

  // Extrair nome da cidade do objeto GoogleGeoPlace
  private extractCityName(place: any): string | null {
    try {
      // Procurar por locality nos address_components
      const cityComponent = place.address_components?.find((component: any) => 
        component.types.includes('locality') || component.types.includes('administrative_area_level_2')
      );
      return cityComponent?.long_name || null;
    } catch (error) {
      console.error('Erro ao extrair nome da cidade:', error);
      return null;
    }
  }

  // Criar dados espirituais padrão baseados na região
  private createDefaultSpiritualData(regionName: string, type: string): any {
    const baseData = {
      prophetic_words: [],
      prayer_targets: [
        {
          id: Date.now().toString(),
          title: `Avivamento em ${regionName}`,
          description: `Orar por um mover do Espírito Santo que transforme ${regionName}`,
          urgency: 'high',
          category: 'spiritual'
        }
      ],
      spiritual_alerts: [],
      testimonies: [],
      mission_bases: [],
      stats: {
        total_intercessors: 0,
        active_prayers: 1,
        revival_level: 'baixo',
        alert_level: 'verde'
      }
    };

    // Adicionar alvos específicos baseados no tipo
    if (type === 'country') {
      baseData.prayer_targets.push({
        id: (Date.now() + 1).toString(),
        title: `Transformação Nacional`,
        description: `Orar pela transformação política, social e espiritual de ${regionName}`,
        urgency: 'high',
        category: 'spiritual'
      });
    } else if (type === 'city') {
      baseData.prayer_targets.push({
        id: (Date.now() + 1).toString(),
        title: `Evangelização Urbana`,
        description: `Orar pela evangelização efetiva e plantação de igrejas em ${regionName}`,
        urgency: 'high',
        category: 'spiritual'
      });
    }

    return baseData;
  }

  // Utilitários
  private addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logMessage = `[${timestamp}] ${message}`;
    this.processingStatus.logs.push(logMessage);
    console.log(logMessage);
    
    // Atualizar progresso
    this.processingStatus.progress = Math.round(
      (this.processingStatus.currentStep / this.processingStatus.totalSteps) * 100
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters para status
  getStatus() {
    return { ...this.processingStatus };
  }

  getLogs() {
    return this.processingStatus.logs;
  }
}

// =====================================================
// EXPORTAR INSTÂNCIA SINGLETON
// =====================================================

export const southAmericaBatchService = new SouthAmericaBatchService();

export type { ProcessingProgress, CountryResult }; 