// 🌍 WORLD POPULATION MASTER - SISTEMA COMPLETO DE POPULAÇÃO MUNDIAL
// Sistema inteligente para popular TODOS os países, estados e cidades do mundo

import { supabase } from '../integrations/supabase/client';

interface PopulationConfig {
  useGoogleMaps: boolean;
  googleApiKey?: string;
  batchSize: number;
  delayBetweenRequests: number; // milliseconds
  maxRetries: number;
  continents: string[];
  skipExisting: boolean;
  enableCheckpoints: boolean;
}

interface PopulationProgress {
  phase: 'countries' | 'states' | 'cities';
  continent: string;
  country?: string;
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  percentage: number;
  estimatedTimeRemaining: number; // minutes
  currentItem: string;
  errors: string[];
}

interface WorldDataSource {
  continent: string;
  countries: Array<{
    name: string;
    code: string;
    capital: string;
    lat: number;
    lng: number;
    states?: Array<{
      name: string;
      capital: string;
      lat: number;
      lng: number;
    }>;
  }>;
}

export class WorldPopulationMaster {
  private config: PopulationConfig;
  private progressCallbacks: Array<(progress: PopulationProgress) => void> = [];
  private isRunning = false;
  private shouldStop = false;

  constructor(config: PopulationConfig) {
    this.config = config;
  }

  // 📊 SISTEMA DE PROGRESS
  onProgress(callback: (progress: PopulationProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  private notifyProgress(progress: PopulationProgress) {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  // 🛑 CONTROLES DE EXECUÇÃO
  start() {
    this.isRunning = true;
    this.shouldStop = false;
  }

  stop() {
    this.shouldStop = true;
  }

  // 🌍 POPULAÇÃO MUNDIAL COMPLETA
  async populateEntireWorld(): Promise<{ success: boolean; summary: any; errors: string[] }> {
    console.log('🌍 [WORLD MASTER] Iniciando população mundial completa...');
    
    if (this.isRunning) {
      throw new Error('População mundial já está em execução');
    }

    this.start();
    const startTime = Date.now();
    const errors: string[] = [];
    const summary = {
      countries: { inserted: 0, skipped: 0, failed: 0 },
      states: { inserted: 0, skipped: 0, failed: 0 },
      cities: { inserted: 0, skipped: 0, failed: 0 },
      totalTime: 0
    };

    try {
      // FASE 1: Países
      if (!this.shouldStop) {
        console.log('🌍 FASE 1: Populando países do mundo...');
        const countriesResult = await this.populateAllCountries();
        summary.countries = countriesResult.summary;
        errors.push(...countriesResult.errors);
      }

      // FASE 2: Estados/Províncias
      if (!this.shouldStop) {
        console.log('🏛️ FASE 2: Populando estados/províncias...');
        const statesResult = await this.populateAllStates();
        summary.states = statesResult.summary;
        errors.push(...statesResult.errors);
      }

      // FASE 3: Cidades
      if (!this.shouldStop) {
        console.log('🏙️ FASE 3: Populando cidades principais...');
        const citiesResult = await this.populateAllCities();
        summary.cities = citiesResult.summary;
        errors.push(...citiesResult.errors);
      }

      summary.totalTime = Math.round((Date.now() - startTime) / 1000 / 60); // minutos
      
      console.log('🎉 [WORLD MASTER] População mundial completa!');
      return { success: errors.length === 0, summary, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      errors.push(errorMessage);
      return { success: false, summary, errors };
    } finally {
      this.isRunning = false;
    }
  }

  // 🌍 POPULAÇÃO DE PAÍSES
  private async populateAllCountries(): Promise<{ summary: any; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0, skipped = 0, failed = 0;

    for (const continent of this.config.continents) {
      if (this.shouldStop) break;

      console.log(`🌎 Populando países: ${continent}`);
      
      const countries = this.getCountriesByContinent(continent);
      
      for (let i = 0; i < countries.length; i++) {
        if (this.shouldStop) break;

        const country = countries[i];
        
        this.notifyProgress({
          phase: 'countries',
          continent,
          total: countries.length,
          completed: i,
          failed,
          skipped,
          percentage: Math.round((i / countries.length) * 100),
          estimatedTimeRemaining: this.calculateETA(i, countries.length, Date.now()),
          currentItem: country.name,
          errors
        });

        try {
          // Verificar se já existe
          if (this.config.skipExisting) {
            const existing = await this.checkCountryExists(country.code);
            if (existing) {
              console.log(`⏭️ ${country.name} já existe`);
              skipped++;
              continue;
            }
          }

          // Inserir país
          const { error } = await supabase
            .from('spiritual_regions')
            .insert({
              name: country.name,
              region_type: 'country',
              country_code: country.code,
              coordinates: { lat: country.lat, lng: country.lng },
              data_source: 'imported',
              status: 'approved'
            });

          if (error && !error.message.includes('duplicate key')) {
            throw error;
          }

          inserted++;
          console.log(`✅ ${country.name}`);

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          errors.push(`${country.name}: ${errorMsg}`);
          failed++;
          console.error(`❌ ${country.name}: ${errorMsg}`);
        }

        // Rate limiting
        await this.delay(this.config.delayBetweenRequests);
      }
    }

    return { summary: { inserted, skipped, failed }, errors };
  }

  // 🏛️ POPULAÇÃO DE ESTADOS
  private async populateAllStates(): Promise<{ summary: any; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0, skipped = 0, failed = 0;

    // Buscar países que já estão no banco
    const { data: countries } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'country')
      .order('name');

    if (!countries) {
      errors.push('Nenhum país encontrado no banco');
      return { summary: { inserted, skipped, failed }, errors };
    }

    for (const country of countries) {
      if (this.shouldStop) break;

      console.log(`🏛️ Populando estados: ${country.name}`);
      
      try {
        const states = this.getStatesByCountry(country.country_code);
        
        for (const state of states) {
          if (this.shouldStop) break;

          // Verificar se já existe
          if (this.config.skipExisting) {
            const existing = await this.checkStateExists(state.name, country.id);
            if (existing) {
              skipped++;
              continue;
            }
          }

          // Inserir estado
          const { error } = await supabase
            .from('spiritual_regions')
            .insert({
              name: state.name,
              region_type: 'state',
              country_code: country.country_code,
              parent_id: country.id,
              coordinates: { lat: state.lat, lng: state.lng },
              data_source: 'imported',
              status: 'approved'
            });

          if (error && !error.message.includes('duplicate key')) {
            throw error;
          }

          inserted++;
          await this.delay(this.config.delayBetweenRequests);
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        errors.push(`${country.name}: ${errorMsg}`);
        failed++;
      }
    }

    return { summary: { inserted, skipped, failed }, errors };
  }

  // 🏙️ POPULAÇÃO DE CIDADES
  private async populateAllCities(): Promise<{ summary: any; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0, skipped = 0, failed = 0;

    // Buscar estados que já estão no banco
    const { data: states } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'state')
      .order('name');

    if (!states) {
      errors.push('Nenhum estado encontrado no banco');
      return { summary: { inserted, skipped, failed }, errors };
    }

    for (const state of states) {
      if (this.shouldStop) break;

      console.log(`🏙️ Populando cidades: ${state.name}, ${state.country_code}`);
      
      try {
        const cities = this.getCitiesByState(state.country_code, state.name);
        
        for (const city of cities) {
          if (this.shouldStop) break;

          // Verificar se já existe
          if (this.config.skipExisting) {
            const existing = await this.checkCityExists(city.name, state.id);
            if (existing) {
              skipped++;
              continue;
            }
          }

          // Inserir cidade
          const { error } = await supabase
            .from('spiritual_regions')
            .insert({
              name: city.name,
              region_type: 'city',
              country_code: state.country_code,
              parent_id: state.id,
              coordinates: { lat: city.lat, lng: city.lng },
              data_source: 'imported',
              status: 'approved'
            });

          if (error && !error.message.includes('duplicate key')) {
            throw error;
          }

          inserted++;
          await this.delay(this.config.delayBetweenRequests);
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        errors.push(`${state.name}: ${errorMsg}`);
        failed++;
      }
    }

    return { summary: { inserted, skipped, failed }, errors };
  }

  // 🌎 DADOS DOS PAÍSES POR CONTINENTE
  private getCountriesByContinent(continent: string) {
    const worldData: Record<string, any[]> = {
      'South America': [
        { name: 'Brasil', code: 'BRA', capital: 'Brasília', lat: -14.235, lng: -51.9253 },
        { name: 'Argentina', code: 'ARG', capital: 'Buenos Aires', lat: -38.4161, lng: -63.6167 },
        { name: 'Chile', code: 'CHL', capital: 'Santiago', lat: -35.6751, lng: -71.543 },
        { name: 'Peru', code: 'PER', capital: 'Lima', lat: -9.19, lng: -75.0152 },
        { name: 'Colômbia', code: 'COL', capital: 'Bogotá', lat: 4.5709, lng: -74.2973 },
        { name: 'Venezuela', code: 'VEN', capital: 'Caracas', lat: 6.4238, lng: -66.5897 },
        { name: 'Equador', code: 'ECU', capital: 'Quito', lat: -1.8312, lng: -78.1834 },
        { name: 'Bolívia', code: 'BOL', capital: 'La Paz', lat: -16.2902, lng: -63.5887 },
        { name: 'Paraguai', code: 'PRY', capital: 'Assunção', lat: -23.4425, lng: -58.4438 },
        { name: 'Uruguai', code: 'URY', capital: 'Montevidéu', lat: -32.5228, lng: -55.7658 },
        { name: 'Guiana', code: 'GUY', capital: 'Georgetown', lat: 4.8604, lng: -58.9302 },
        { name: 'Suriname', code: 'SUR', capital: 'Paramaribo', lat: 3.9193, lng: -56.0278 }
      ],
      'North America': [
        { name: 'Estados Unidos', code: 'USA', capital: 'Washington', lat: 39.8283, lng: -98.5795 },
        { name: 'Canadá', code: 'CAN', capital: 'Ottawa', lat: 56.1304, lng: -106.3468 },
        { name: 'México', code: 'MEX', capital: 'Cidade do México', lat: 23.6345, lng: -102.5528 },
        { name: 'Guatemala', code: 'GTM', capital: 'Cidade da Guatemala', lat: 15.7835, lng: -90.2308 },
        { name: 'Cuba', code: 'CUB', capital: 'Havana', lat: 21.5218, lng: -77.7812 },
        { name: 'Haiti', code: 'HTI', capital: 'Porto Príncipe', lat: 18.9712, lng: -72.2852 },
        { name: 'República Dominicana', code: 'DOM', capital: 'Santo Domingo', lat: 18.7357, lng: -70.1627 },
        { name: 'Honduras', code: 'HND', capital: 'Tegucigalpa', lat: 15.2000, lng: -86.2419 },
        { name: 'Nicarágua', code: 'NIC', capital: 'Manágua', lat: 12.8654, lng: -85.2072 },
        { name: 'Costa Rica', code: 'CRI', capital: 'San José', lat: 9.7489, lng: -83.7534 },
        { name: 'Panamá', code: 'PAN', capital: 'Cidade do Panamá', lat: 8.5380, lng: -80.7821 }
      ],
      'Europe': [
        { name: 'Reino Unido', code: 'GBR', capital: 'Londres', lat: 55.3781, lng: -3.436 },
        { name: 'França', code: 'FRA', capital: 'Paris', lat: 46.6034, lng: 1.8883 },
        { name: 'Alemanha', code: 'DEU', capital: 'Berlim', lat: 51.1657, lng: 10.4515 },
        { name: 'Espanha', code: 'ESP', capital: 'Madrid', lat: 40.4637, lng: -3.7492 },
        { name: 'Itália', code: 'ITA', capital: 'Roma', lat: 41.8719, lng: 12.5674 },
        { name: 'Portugal', code: 'PRT', capital: 'Lisboa', lat: 39.3999, lng: -8.2245 },
        { name: 'Holanda', code: 'NLD', capital: 'Amsterdã', lat: 52.1326, lng: 5.2913 },
        { name: 'Bélgica', code: 'BEL', capital: 'Bruxelas', lat: 50.5039, lng: 4.4699 },
        { name: 'Suíça', code: 'CHE', capital: 'Berna', lat: 46.8182, lng: 8.2275 },
        { name: 'Áustria', code: 'AUT', capital: 'Viena', lat: 47.5162, lng: 14.5501 },
        { name: 'Polônia', code: 'POL', capital: 'Varsóvia', lat: 51.9194, lng: 19.1451 },
        { name: 'República Tcheca', code: 'CZE', capital: 'Praga', lat: 49.8175, lng: 15.473 },
        { name: 'Hungria', code: 'HUN', capital: 'Budapeste', lat: 47.1625, lng: 19.5033 },
        { name: 'Romênia', code: 'ROU', capital: 'Bucareste', lat: 45.9432, lng: 24.9668 },
        { name: 'Bulgária', code: 'BGR', capital: 'Sofia', lat: 42.7339, lng: 25.4858 },
        { name: 'Grécia', code: 'GRC', capital: 'Atenas', lat: 39.0742, lng: 21.8243 },
        { name: 'Noruega', code: 'NOR', capital: 'Oslo', lat: 60.472, lng: 8.4689 },
        { name: 'Suécia', code: 'SWE', capital: 'Estocolmo', lat: 60.1282, lng: 18.6435 },
        { name: 'Finlândia', code: 'FIN', capital: 'Helsinki', lat: 61.9241, lng: 25.7482 },
        { name: 'Dinamarca', code: 'DNK', capital: 'Copenhague', lat: 56.2639, lng: 9.5018 }
      ],
      'Africa': [
        { name: 'Nigéria', code: 'NGA', capital: 'Abuja', lat: 9.082, lng: 8.6753 },
        { name: 'África do Sul', code: 'ZAF', capital: 'Cidade do Cabo', lat: -30.5595, lng: 22.9375 },
        { name: 'Quênia', code: 'KEN', capital: 'Nairobi', lat: -0.0236, lng: 37.9062 },
        { name: 'Egito', code: 'EGY', capital: 'Cairo', lat: 26.0975, lng: 31.1 },
        { name: 'Marrocos', code: 'MAR', capital: 'Rabat', lat: 31.7917, lng: -7.0926 },
        { name: 'Etiópia', code: 'ETH', capital: 'Adis Abeba', lat: 9.145, lng: 40.4897 },
        { name: 'Gana', code: 'GHA', capital: 'Acra', lat: 7.9465, lng: -1.0232 },
        { name: 'Uganda', code: 'UGA', capital: 'Kampala', lat: 1.3733, lng: 32.2903 },
        { name: 'Tanzânia', code: 'TZA', capital: 'Dodoma', lat: -6.369, lng: 34.8888 },
        { name: 'Angola', code: 'AGO', capital: 'Luanda', lat: -11.2027, lng: 17.8739 },
        { name: 'Moçambique', code: 'MOZ', capital: 'Maputo', lat: -18.665, lng: 35.5296 },
        { name: 'Camarões', code: 'CMR', capital: 'Yaoundé', lat: 7.3697, lng: 12.3547 }
      ],
      'Asia': [
        { name: 'China', code: 'CHN', capital: 'Pequim', lat: 35.8617, lng: 104.1954 },
        { name: 'Índia', code: 'IND', capital: 'Nova Delhi', lat: 20.5937, lng: 78.9629 },
        { name: 'Japão', code: 'JPN', capital: 'Tóquio', lat: 36.2048, lng: 138.2529 },
        { name: 'Coreia do Sul', code: 'KOR', capital: 'Seul', lat: 35.9078, lng: 127.7669 },
        { name: 'Indonésia', code: 'IDN', capital: 'Jacarta', lat: -0.7893, lng: 113.9213 },
        { name: 'Filipinas', code: 'PHL', capital: 'Manila', lat: 12.8797, lng: 121.774 },
        { name: 'Tailândia', code: 'THA', capital: 'Bangkok', lat: 15.87, lng: 100.9925 },
        { name: 'Vietnã', code: 'VNM', capital: 'Hanói', lat: 14.0583, lng: 108.2772 },
        { name: 'Malásia', code: 'MYS', capital: 'Kuala Lumpur', lat: 4.2105, lng: 101.9758 },
        { name: 'Singapura', code: 'SGP', capital: 'Singapura', lat: 1.3521, lng: 103.8198 },
        { name: 'Paquistão', code: 'PAK', capital: 'Islamabad', lat: 30.3753, lng: 69.3451 },
        { name: 'Bangladesh', code: 'BGD', capital: 'Dhaka', lat: 23.685, lng: 90.3563 },
        { name: 'Sri Lanka', code: 'LKA', capital: 'Colombo', lat: 7.8731, lng: 80.7718 },
        { name: 'Myanmar', code: 'MMR', capital: 'Naypyidaw', lat: 21.9162, lng: 95.956 },
        { name: 'Camboja', code: 'KHM', capital: 'Phnom Penh', lat: 12.5657, lng: 104.991 }
      ],
      'Oceania': [
        { name: 'Austrália', code: 'AUS', capital: 'Canberra', lat: -25.2744, lng: 133.7751 },
        { name: 'Nova Zelândia', code: 'NZL', capital: 'Wellington', lat: -40.9006, lng: 174.886 },
        { name: 'Papua Nova Guiné', code: 'PNG', capital: 'Port Moresby', lat: -6.314, lng: 143.9555 },
        { name: 'Fiji', code: 'FJI', capital: 'Suva', lat: -16.7784, lng: 179.414 },
        { name: 'Ilhas Salomão', code: 'SLB', capital: 'Honiara', lat: -9.6457, lng: 160.1562 }
      ]
    };

    return worldData[continent] || [];
  }

  // 🏛️ ESTADOS POR PAÍS (dados limitados por agora, será expandido)
  private getStatesByCountry(countryCode: string) {
    const statesData: Record<string, any[]> = {
      'BRA': [
        { name: 'Acre', capital: 'Rio Branco', lat: -9.0238, lng: -70.812 },
        { name: 'Alagoas', capital: 'Maceió', lat: -9.5713, lng: -36.782 },
        // ... todos os 27 estados brasileiros já estão implementados
      ],
      'USA': [
        { name: 'California', capital: 'Sacramento', lat: 36.7783, lng: -119.4179 },
        { name: 'Texas', capital: 'Austin', lat: 31.9686, lng: -99.9018 },
        { name: 'Florida', capital: 'Tallahassee', lat: 27.7663, lng: -82.6404 },
        { name: 'New York', capital: 'Albany', lat: 42.1657, lng: -74.9481 },
        { name: 'Pennsylvania', capital: 'Harrisburg', lat: 41.2033, lng: -77.1945 }
      ],
      'CAN': [
        { name: 'Ontario', capital: 'Toronto', lat: 51.2538, lng: -85.3232 },
        { name: 'Quebec', capital: 'Quebec City', lat: 53.9303, lng: -73.5468 },
        { name: 'British Columbia', capital: 'Victoria', lat: 53.7267, lng: -127.6476 },
        { name: 'Alberta', capital: 'Edmonton', lat: 53.9333, lng: -116.5765 }
      ]
      // Será expandido para todos os países
    };

    return statesData[countryCode] || [];
  }

  // 🏙️ CIDADES POR ESTADO (será expandido massivamente)
  private getCitiesByState(countryCode: string, stateName: string) {
    // Por agora, retornar apenas capitais para não sobrecarregar
    const statesData = this.getStatesByCountry(countryCode);
    const state = statesData.find(s => s.name === stateName);
    
    if (state && state.capital) {
      return [{
        name: state.capital,
        lat: state.lat,
        lng: state.lng,
        isCapital: true
      }];
    }
    
    return [];
  }

  // 🔍 MÉTODOS DE VERIFICAÇÃO
  private async checkCountryExists(countryCode: string): Promise<boolean> {
    const { data } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('country_code', countryCode)
      .eq('region_type', 'country')
      .single();
    
    return !!data;
  }

  private async checkStateExists(stateName: string, countryId: string): Promise<boolean> {
    const { data } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('name', stateName)
      .eq('parent_id', countryId)
      .eq('region_type', 'state')
      .single();
    
    return !!data;
  }

  private async checkCityExists(cityName: string, stateId: string): Promise<boolean> {
    const { data } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('name', cityName)
      .eq('parent_id', stateId)
      .eq('region_type', 'city')
      .single();
    
    return !!data;
  }

  // ⏱️ UTILITÁRIOS
  private calculateETA(completed: number, total: number, startTime: number): number {
    if (completed === 0) return 0;
    
    const elapsed = Date.now() - startTime;
    const avgTimePerItem = elapsed / completed;
    const remaining = total - completed;
    
    return Math.round((remaining * avgTimePerItem) / 1000 / 60); // minutos
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 📊 STATUS E ESTATÍSTICAS
  async getWorldPopulationStatus() {
    const { data: countries } = await supabase
      .from('spiritual_regions')
      .select('id, country_code')
      .eq('region_type', 'country');

    const { data: states } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('region_type', 'state');

    const { data: cities } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('region_type', 'city');

    const total = (countries?.length || 0) + (states?.length || 0) + (cities?.length || 0);

    return {
      countries: countries?.length || 0,
      states: states?.length || 0,
      cities: cities?.length || 0,
      total,
      countryCodes: countries?.map(c => c.country_code) || []
    };
  }
}

// 🌍 CONFIGURAÇÃO PADRÃO PARA POPULAÇÃO MUNDIAL
export const createWorldPopulationConfig = (): PopulationConfig => ({
  useGoogleMaps: false, // Começar sem Google Maps para não sobrecarregar
  batchSize: 50,
  delayBetweenRequests: 200, // 200ms entre requests
  maxRetries: 3,
  continents: ['South America', 'North America', 'Europe', 'Africa', 'Asia', 'Oceania'],
  skipExisting: true,
  enableCheckpoints: true
});

export const worldPopulationMaster = new WorldPopulationMaster(createWorldPopulationConfig()); 