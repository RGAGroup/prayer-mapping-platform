import { supabase } from '../integrations/supabase/client';
import { googleGeoDataService } from './googleGeoDataService';

// =====================================================
// BRASIL GEO TEST SERVICE 🇧🇷
// =====================================================

export interface BrazilTestProgress {
  currentStep: 'countries' | 'states' | 'cities' | 'completed';
  stepDescription: string;
  totalSteps: number;
  currentStepNumber: number;
  percentage: number;
  details: {
    countries: number;
    states: number;
    cities: number;
  };
  errors: string[];
  logs: string[];
}

export interface BrazilTestResult {
  success: boolean;
  summary: {
    countries_inserted: number;
    states_inserted: number;
    cities_inserted: number;
    total_regions: number;
    duration_ms: number;
  };
  errors: string[];
  data?: any[];
}

export class BrazilGeoTestService {
  private isProcessing = false;
  private progressCallbacks: Array<(progress: BrazilTestProgress) => void> = [];

  // =====================================================
  // PROGRESS CALLBACK SYSTEM
  // =====================================================

  public onProgress(callback: (progress: BrazilTestProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  private notifyProgress(progress: BrazilTestProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  // =====================================================
  // TESTE PRINCIPAL: POPULAR BRASIL COMPLETO
  // =====================================================

  public async testBrazilComplete(): Promise<BrazilTestResult> {
    if (this.isProcessing) {
      throw new Error('❌ Teste já está em andamento');
    }

    console.log('🇧🇷 [TESTE BRASIL] Iniciando teste completo do Brasil...');
    const startTime = Date.now();
    this.isProcessing = true;

    const result: BrazilTestResult = {
      success: false,
      summary: {
        countries_inserted: 0,
        states_inserted: 0,
        cities_inserted: 0,
        total_regions: 0,
        duration_ms: 0
      },
      errors: [],
      data: []
    };

    try {
      // ============================================
      // PASSO 1: BUSCAR E INSERIR BRASIL (PAÍS)
      // ============================================
      this.notifyProgress({
        currentStep: 'countries',
        stepDescription: 'Buscando e inserindo Brasil como país...',
        totalSteps: 4,
        currentStepNumber: 1,
        percentage: 0,
        details: { countries: 0, states: 0, cities: 0 },
        errors: [],
        logs: ['🇧🇷 Iniciando busca do Brasil via Google Maps API...']
      });

      const countryResult = await this.insertBrazilCountry();
      result.summary.countries_inserted = countryResult.success ? 1 : 0;
      
      if (!countryResult.success) {
        result.errors.push(`Erro ao inserir país: ${countryResult.error}`);
        throw new Error('Falha ao processar país Brasil');
      }

      const brazilCountryId = countryResult.countryId;
      console.log(`✅ País Brasil inserido com ID: ${brazilCountryId}`);

      // ============================================
      // PASSO 2: BUSCAR E INSERIR ESTADOS
      // ============================================
      this.notifyProgress({
        currentStep: 'states',
        stepDescription: 'Buscando e inserindo estados do Brasil...',
        totalSteps: 4,
        currentStepNumber: 2,
        percentage: 25,
        details: { countries: 1, states: 0, cities: 0 },
        errors: result.errors,
        logs: ['✅ Brasil inserido', '🏛️ Iniciando busca dos estados...']
      });

      const statesResult = await this.insertBrazilStates(brazilCountryId);
      result.summary.states_inserted = statesResult.totalInserted;
      result.errors.push(...statesResult.errors);

      console.log(`✅ Estados inseridos: ${statesResult.totalInserted}`);

      // ============================================
      // PASSO 3: BUSCAR E INSERIR CIDADES (AMOSTRA)
      // ============================================
      this.notifyProgress({
        currentStep: 'cities',
        stepDescription: 'Buscando e inserindo principais cidades...',
        totalSteps: 4,
        currentStepNumber: 3,
        percentage: 75,
        details: { countries: 1, states: statesResult.totalInserted, cities: 0 },
        errors: result.errors,
        logs: ['✅ Brasil inserido', `✅ ${statesResult.totalInserted} estados inseridos`, '🏙️ Iniciando busca das cidades...']
      });

      const citiesResult = await this.insertBrazilCitiesSample();
      result.summary.cities_inserted = citiesResult.totalInserted;
      result.errors.push(...citiesResult.errors);

      console.log(`✅ Cidades inseridas: ${citiesResult.totalInserted}`);

      // ============================================
      // PASSO 4: FINALIZAÇÃO
      // ============================================
      const totalRegions = result.summary.countries_inserted + 
                           result.summary.states_inserted + 
                           result.summary.cities_inserted;

      result.summary.total_regions = totalRegions;
      result.summary.duration_ms = Date.now() - startTime;
      result.success = result.errors.length === 0;

      this.notifyProgress({
        currentStep: 'completed',
        stepDescription: 'Teste completo! Brasil populado com sucesso.',
        totalSteps: 4,
        currentStepNumber: 4,
        percentage: 100,
        details: { 
          countries: result.summary.countries_inserted, 
          states: result.summary.states_inserted, 
          cities: result.summary.cities_inserted 
        },
        errors: result.errors,
        logs: [
          '✅ Brasil inserido',
          `✅ ${result.summary.states_inserted} estados inseridos`,
          `✅ ${result.summary.cities_inserted} cidades inseridas`,
          `🎉 Total: ${totalRegions} regiões populadas!`
        ]
      });

      console.log('🎉 [TESTE BRASIL COMPLETO] Brasil populado com sucesso!');
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      result.errors.push(errorMessage);
      result.summary.duration_ms = Date.now() - startTime;
      
      console.error('❌ [TESTE BRASIL FALHOU]:', errorMessage);
      throw error;
      
    } finally {
      this.isProcessing = false;
    }
  }

  // =====================================================
  // MÉTODO AUXILIAR: INSERIR BRASIL (PAÍS)
  // =====================================================

  private async insertBrazilCountry(): Promise<{ success: boolean; countryId?: string; error?: string }> {
    try {
      console.log('🇧🇷 Buscando Brasil via Google Maps...');
      
      // Buscar Brasil usando o serviço
      const countries = await googleGeoDataService.getAllCountries();
      const brazil = countries.find(country => {
        const name = googleGeoDataService.convertToLocationData(country, 'country').name;
        return name.toLowerCase().includes('brasil') || name.toLowerCase().includes('brazil');
      });

      if (!brazil) {
        return { success: false, error: 'Brasil não encontrado na busca do Google Maps' };
      }

      // Converter para formato do banco
      const locationData = googleGeoDataService.convertToLocationData(brazil, 'country');

      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('region_type', 'country')
        .eq('name', locationData.name)
        .single();

      if (existing) {
        console.log('ℹ️ Brasil já existe no banco de dados');
        return { success: true, countryId: existing.id };
      }

      // Inserir no banco
      const { data, error } = await supabase
        .from('spiritual_regions')
        .insert([locationData])
        .select('id')
        .single();

      if (error) {
        return { success: false, error: `Erro ao inserir no banco: ${error.message}` };
      }

      return { success: true, countryId: data.id };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }

  // =====================================================
  // MÉTODO AUXILIAR: INSERIR ESTADOS DO BRASIL
  // =====================================================

  private async insertBrazilStates(countryId: string): Promise<{ totalInserted: number; errors: string[] }> {
    try {
      console.log('🏛️ Buscando estados do Brasil...');
      
      const states = await googleGeoDataService.getStatesByCountry('BR');
      const errors: string[] = [];
      let totalInserted = 0;

      for (const state of states) {
        try {
          const locationData = googleGeoDataService.convertToLocationData(state, 'state', countryId);

          // Verificar se já existe
          const { data: existing } = await supabase
            .from('spiritual_regions')
            .select('id')
            .eq('region_type', 'state')
            .eq('name', locationData.name)
            .eq('parent_id', countryId)
            .maybeSingle();

          if (existing) {
            console.log(`ℹ️ Estado ${locationData.name} já existe`);
            continue;
          }

          // Inserir estado
          const { data: insertedData, error } = await supabase
            .from('spiritual_regions')
            .insert([locationData])
            .select()
            .single();

          if (error) {
            console.error(`❌ Erro detalhado ao inserir estado ${locationData.name}:`, error);
            errors.push(`Erro ao inserir estado ${locationData.name}: ${error.message} (Código: ${error.code || 'N/A'})`);
          } else {
            totalInserted++;
            console.log(`✅ Estado inserido: ${locationData.name}`, insertedData);
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          errors.push(`Erro ao processar estado: ${errorMessage}`);
        }
      }

      return { totalInserted, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return { totalInserted: 0, errors: [errorMessage] };
    }
  }

  // =====================================================
  // MÉTODO AUXILIAR: INSERIR AMOSTRA DE CIDADES
  // =====================================================

  private async insertBrazilCitiesSample(): Promise<{ totalInserted: number; errors: string[] }> {
    try {
      console.log('🏙️ Buscando principais cidades do Brasil...');
      
      // Buscar apenas cidades dos principais estados para teste
      const mainStates = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais'];
      const errors: string[] = [];
      let totalInserted = 0;

      for (const stateName of mainStates) {
        try {
          // Buscar o estado no banco
          const { data: stateData } = await supabase
            .from('spiritual_regions')
            .select('id')
            .eq('region_type', 'state')
            .eq('name', stateName)
            .maybeSingle();

          if (!stateData) {
            errors.push(`Estado ${stateName} não encontrado no banco`);
            continue;
          }

          // Buscar cidades do estado
          const cities = await googleGeoDataService.getCitiesByState('BR', stateName);
          
          // Limitar a 3 cidades por estado para teste
          const limitedCities = cities.slice(0, 3);

          for (const city of limitedCities) {
            try {
              const locationData = googleGeoDataService.convertToLocationData(city, 'city', stateData.id);

              // Verificar se já existe
              const { data: existing } = await supabase
                .from('spiritual_regions')
                .select('id')
                .eq('region_type', 'city')
                .eq('name', locationData.name)
                .eq('parent_id', stateData.id)
                .maybeSingle();

              if (existing) {
                console.log(`ℹ️ Cidade ${locationData.name} já existe`);
                continue;
              }

              // Inserir cidade
              const { data: insertedData, error } = await supabase
                .from('spiritual_regions')
                .insert([locationData])
                .select()
                .single();

              if (error) {
                console.error(`❌ Erro detalhado ao inserir cidade ${locationData.name}:`, error);
                errors.push(`Erro ao inserir cidade ${locationData.name}: ${error.message} (Código: ${error.code || 'N/A'})`);
              } else {
                totalInserted++;
                console.log(`✅ Cidade inserida: ${locationData.name}, ${stateName}`, insertedData);
              }

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
              errors.push(`Erro ao processar cidade: ${errorMessage}`);
            }
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          errors.push(`Erro ao processar estado ${stateName}: ${errorMessage}`);
        }
      }

      return { totalInserted, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return { totalInserted: 0, errors: [errorMessage] };
    }
  }

  // =====================================================
  // MÉTODO AUXILIAR: LIMPAR DADOS DE TESTE
  // =====================================================

  public async clearBrazilTestData(): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      console.log('🧹 Limpando dados de teste do Brasil...');

      // Deletar Brasil e todos os filhos (cascade)
      const { data, error } = await supabase
        .from('spiritual_regions')
        .delete()
        .eq('region_type', 'country')
        .or('name.eq.Brasil,name.eq.Brazil')
        .select('id');

      if (error) {
        return { success: false, deleted: 0, error: error.message };
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ ${deletedCount} registros deletados`);

      return { success: true, deleted: deletedCount };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return { success: false, deleted: 0, error: errorMessage };
    }
  }

  // =====================================================
  // MÉTODO AUXILIAR: VERIFICAR DADOS EXISTENTES
  // =====================================================

  public async checkExistingBrazilData(): Promise<{
    countries: number;
    states: number;
    cities: number;
    total: number;
  }> {
    try {
      // Buscar Brasil
      const { data: countryData } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('region_type', 'country')
        .or('name.eq.Brasil,name.eq.Brazil');

      const countries = countryData?.length || 0;

      if (countries === 0) {
        return { countries: 0, states: 0, cities: 0, total: 0 };
      }

      const brazilId = countryData[0].id;

      // Buscar estados
      const { data: statesData } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('region_type', 'state')
        .eq('parent_id', brazilId);

      const states = statesData?.length || 0;

      // Buscar cidades
      const stateIds = statesData?.map(s => s.id) || [];
      let cities = 0;

      if (stateIds.length > 0) {
        const { data: citiesData } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('region_type', 'city')
          .in('parent_id', stateIds);

        cities = citiesData?.length || 0;
      }

      const total = countries + states + cities;

      return { countries, states, cities, total };

    } catch (error) {
      console.error('Erro ao verificar dados existentes:', error);
      return { countries: 0, states: 0, cities: 0, total: 0 };
    }
  }
}

// Instância singleton
export const brazilGeoTestService = new BrazilGeoTestService(); 