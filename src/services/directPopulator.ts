import { supabase } from '../integrations/supabase/client';

interface PopulationProgress {
  step: string;
  completed: number;
  total: number;
  percentage: number;
  errors: string[];
}

interface RegionData {
  name: string;
  region_type: 'country' | 'state' | 'city';
  country_code?: string;
  coordinates?: { lat: number; lng: number };
  parent_id?: string;
}

export class DirectPopulator {
  private progressCallback?: (progress: PopulationProgress) => void;

  onProgress(callback: (progress: PopulationProgress) => void) {
    this.progressCallback = callback;
  }

  private notify(step: string, completed: number, total: number, errors: string[] = []) {
    if (this.progressCallback) {
      this.progressCallback({
        step,
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
        errors
      });
    }
  }

  // 🌍 POPULAR PAÍSES DO MUNDO
  async populateWorldCountries(): Promise<{ success: boolean; total: number; errors: string[] }> {
    console.log('🌍 Iniciando população mundial de países...');
    
    const countries = await this.getWorldCountriesData();
    const errors: string[] = [];
    let inserted = 0;

    this.notify('Inserindo países', 0, countries.length);

    for (let i = 0; i < countries.length; i++) {
      try {
        const country = countries[i];
        
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: country.name,
            region_type: 'country',
            country_code: country.country_code,
            coordinates: country.coordinates ? {
              lat: country.coordinates.lat,
              lng: country.coordinates.lng
            } : null,
            data_source: 'imported',
            status: 'approved'
          });

        if (error) {
          if (!error.message.includes('duplicate key')) {
            errors.push(`${country.name}: ${error.message}`);
          }
        } else {
          inserted++;
        }

        this.notify('Inserindo países', i + 1, countries.length, errors);
        
      } catch (error) {
        errors.push(`${countries[i].name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log(`✅ Países inseridos: ${inserted}/${countries.length}`);
    return { success: errors.length === 0, total: inserted, errors };
  }

  // 🇧🇷 POPULAR ESTADOS DO BRASIL
  async populateBrazilStates(): Promise<{ success: boolean; total: number; errors: string[] }> {
    console.log('🇧🇷 Iniciando população dos estados do Brasil...');
    
    // Buscar ID do Brasil
    const { data: brazil } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('country_code', 'BRA')
      .eq('region_type', 'country')
      .single();

    if (!brazil) {
      return { success: false, total: 0, errors: ['Brasil não encontrado no banco'] };
    }

    const states = this.getBrazilStatesData();
    const errors: string[] = [];
    let inserted = 0;

    this.notify('Inserindo estados do Brasil', 0, states.length);

    for (let i = 0; i < states.length; i++) {
      try {
        const state = states[i];
        
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: state.name,
            region_type: 'state',
            country_code: 'BRA',
            parent_id: brazil.id,
            coordinates: state.coordinates ? {
              lat: state.coordinates.lat,
              lng: state.coordinates.lng
            } : null,
            data_source: 'imported',
            status: 'approved'
          });

        if (error) {
          if (!error.message.includes('duplicate key')) {
            errors.push(`${state.name}: ${error.message}`);
          }
        } else {
          inserted++;
        }

        this.notify('Inserindo estados do Brasil', i + 1, states.length, errors);
        
      } catch (error) {
        errors.push(`${states[i].name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log(`✅ Estados inseridos: ${inserted}/${states.length}`);
    return { success: errors.length === 0, total: inserted, errors };
  }

  // 🏙️ POPULAR PRINCIPAIS CIDADES DO BRASIL
  async populateBrazilMainCities(): Promise<{ success: boolean; total: number; errors: string[] }> {
    console.log('🏙️ Iniciando população das principais cidades do Brasil...');
    
    const cities = this.getBrazilMainCitiesData();
    const errors: string[] = [];
    let inserted = 0;

    this.notify('Inserindo cidades do Brasil', 0, cities.length);

    for (let i = 0; i < cities.length; i++) {
      try {
        const city = cities[i];
        
        // Buscar estado pai
        const { data: state } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', city.state)
          .eq('region_type', 'state')
          .eq('country_code', 'BRA')
          .single();

        if (!state) {
          errors.push(`${city.name}: Estado ${city.state} não encontrado`);
          continue;
        }
        
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: city.name,
            region_type: 'city',
            country_code: 'BRA',
            parent_id: state.id,
            coordinates: city.coordinates ? {
              lat: city.coordinates.lat,
              lng: city.coordinates.lng
            } : null,
            data_source: 'imported',
            status: 'approved'
          });

        if (error) {
          if (!error.message.includes('duplicate key')) {
            errors.push(`${city.name}: ${error.message}`);
          }
        } else {
          inserted++;
        }

        this.notify('Inserindo cidades do Brasil', i + 1, cities.length, errors);
        
      } catch (error) {
        errors.push(`${cities[i].name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log(`✅ Cidades inseridas: ${inserted}/${cities.length}`);
    return { success: errors.length === 0, total: inserted, errors };
  }

  // 🌍 DADOS DOS PAÍSES (usando Natural Earth como base)
  private async getWorldCountriesData(): Promise<RegionData[]> {
    return [
      // América do Sul
      { name: 'Brasil', region_type: 'country', country_code: 'BRA', coordinates: { lat: -14.235, lng: -51.9253 } },
      { name: 'Argentina', region_type: 'country', country_code: 'ARG', coordinates: { lat: -38.4161, lng: -63.6167 } },
      { name: 'Chile', region_type: 'country', country_code: 'CHL', coordinates: { lat: -35.6751, lng: -71.543 } },
      { name: 'Peru', region_type: 'country', country_code: 'PER', coordinates: { lat: -9.19, lng: -75.0152 } },
      { name: 'Colômbia', region_type: 'country', country_code: 'COL', coordinates: { lat: 4.5709, lng: -74.2973 } },
      { name: 'Venezuela', region_type: 'country', country_code: 'VEN', coordinates: { lat: 6.4238, lng: -66.5897 } },
      { name: 'Equador', region_type: 'country', country_code: 'ECU', coordinates: { lat: -1.8312, lng: -78.1834 } },
      { name: 'Bolívia', region_type: 'country', country_code: 'BOL', coordinates: { lat: -16.2902, lng: -63.5887 } },
      { name: 'Paraguai', region_type: 'country', country_code: 'PRY', coordinates: { lat: -23.4425, lng: -58.4438 } },
      { name: 'Uruguai', region_type: 'country', country_code: 'URY', coordinates: { lat: -32.5228, lng: -55.7658 } },
      { name: 'Guiana', region_type: 'country', country_code: 'GUY', coordinates: { lat: 4.8604, lng: -58.9302 } },
      { name: 'Suriname', region_type: 'country', country_code: 'SUR', coordinates: { lat: 3.9193, lng: -56.0278 } },
      
      // América do Norte
      { name: 'Estados Unidos', region_type: 'country', country_code: 'USA', coordinates: { lat: 39.8283, lng: -98.5795 } },
      { name: 'Canadá', region_type: 'country', country_code: 'CAN', coordinates: { lat: 56.1304, lng: -106.3468 } },
      { name: 'México', region_type: 'country', country_code: 'MEX', coordinates: { lat: 23.6345, lng: -102.5528 } },
      
      // Europa
      { name: 'Reino Unido', region_type: 'country', country_code: 'GBR', coordinates: { lat: 55.3781, lng: -3.436 } },
      { name: 'França', region_type: 'country', country_code: 'FRA', coordinates: { lat: 46.6034, lng: 1.8883 } },
      { name: 'Alemanha', region_type: 'country', country_code: 'DEU', coordinates: { lat: 51.1657, lng: 10.4515 } },
      { name: 'Espanha', region_type: 'country', country_code: 'ESP', coordinates: { lat: 40.4637, lng: -3.7492 } },
      { name: 'Itália', region_type: 'country', country_code: 'ITA', coordinates: { lat: 41.8719, lng: 12.5674 } },
      { name: 'Portugal', region_type: 'country', country_code: 'PRT', coordinates: { lat: 39.3999, lng: -8.2245 } },
      
      // África
      { name: 'Nigéria', region_type: 'country', country_code: 'NGA', coordinates: { lat: 9.082, lng: 8.6753 } },
      { name: 'África do Sul', region_type: 'country', country_code: 'ZAF', coordinates: { lat: -30.5595, lng: 22.9375 } },
      { name: 'Quênia', region_type: 'country', country_code: 'KEN', coordinates: { lat: -0.0236, lng: 37.9062 } },
      { name: 'Egito', region_type: 'country', country_code: 'EGY', coordinates: { lat: 26.0975, lng: 31.1 } },
      
      // Ásia
      { name: 'China', region_type: 'country', country_code: 'CHN', coordinates: { lat: 35.8617, lng: 104.1954 } },
      { name: 'Índia', region_type: 'country', country_code: 'IND', coordinates: { lat: 20.5937, lng: 78.9629 } },
      { name: 'Japão', region_type: 'country', country_code: 'JPN', coordinates: { lat: 36.2048, lng: 138.2529 } },
      { name: 'Coreia do Sul', region_type: 'country', country_code: 'KOR', coordinates: { lat: 35.9078, lng: 127.7669 } },
      { name: 'Indonésia', region_type: 'country', country_code: 'IDN', coordinates: { lat: -0.7893, lng: 113.9213 } },
      { name: 'Filipinas', region_type: 'country', country_code: 'PHL', coordinates: { lat: 12.8797, lng: 121.774 } },
      
      // Oceania
      { name: 'Austrália', region_type: 'country', country_code: 'AUS', coordinates: { lat: -25.2744, lng: 133.7751 } },
      { name: 'Nova Zelândia', region_type: 'country', country_code: 'NZL', coordinates: { lat: -40.9006, lng: 174.886 } }
    ];
  }

  // 🏛️ DADOS DOS ESTADOS DO BRASIL
  private getBrazilStatesData(): RegionData[] {
    return [
      { name: 'Acre', region_type: 'state', coordinates: { lat: -9.0238, lng: -70.812 } },
      { name: 'Alagoas', region_type: 'state', coordinates: { lat: -9.5713, lng: -36.782 } },
      { name: 'Amapá', region_type: 'state', coordinates: { lat: 1.41, lng: -51.77 } },
      { name: 'Amazonas', region_type: 'state', coordinates: { lat: -3.4168, lng: -65.8561 } },
      { name: 'Bahia', region_type: 'state', coordinates: { lat: -12.5797, lng: -41.7007 } },
      { name: 'Ceará', region_type: 'state', coordinates: { lat: -5.4984, lng: -39.3206 } },
      { name: 'Distrito Federal', region_type: 'state', coordinates: { lat: -15.7998, lng: -47.8645 } },
      { name: 'Espírito Santo', region_type: 'state', coordinates: { lat: -19.1834, lng: -40.3089 } },
      { name: 'Goiás', region_type: 'state', coordinates: { lat: -15.827, lng: -49.8362 } },
      { name: 'Maranhão', region_type: 'state', coordinates: { lat: -4.9609, lng: -45.2744 } },
      { name: 'Mato Grosso', region_type: 'state', coordinates: { lat: -12.6819, lng: -56.9211 } },
      { name: 'Mato Grosso do Sul', region_type: 'state', coordinates: { lat: -20.7722, lng: -54.7852 } },
      { name: 'Minas Gerais', region_type: 'state', coordinates: { lat: -18.5122, lng: -44.555 } },
      { name: 'Pará', region_type: 'state', coordinates: { lat: -3.9019, lng: -51.4847 } },
      { name: 'Paraíba', region_type: 'state', coordinates: { lat: -7.28, lng: -36.72 } },
      { name: 'Paraná', region_type: 'state', coordinates: { lat: -24.89, lng: -51.55 } },
      { name: 'Pernambuco', region_type: 'state', coordinates: { lat: -8.8137, lng: -36.9541 } },
      { name: 'Piauí', region_type: 'state', coordinates: { lat: -8.5, lng: -43.68 } },
      { name: 'Rio de Janeiro', region_type: 'state', coordinates: { lat: -22.25, lng: -42.66 } },
      { name: 'Rio Grande do Norte', region_type: 'state', coordinates: { lat: -5.81, lng: -36.59 } },
      { name: 'Rio Grande do Sul', region_type: 'state', coordinates: { lat: -30.17, lng: -53.5 } },
      { name: 'Rondônia', region_type: 'state', coordinates: { lat: -10.83, lng: -63.34 } },
      { name: 'Roraima', region_type: 'state', coordinates: { lat: 1.99, lng: -61.33 } },
      { name: 'Santa Catarina', region_type: 'state', coordinates: { lat: -27.45, lng: -50.95 } },
      { name: 'São Paulo', region_type: 'state', coordinates: { lat: -23.32, lng: -46.52 } },
      { name: 'Sergipe', region_type: 'state', coordinates: { lat: -10.57, lng: -37.45 } },
      { name: 'Tocantins', region_type: 'state', coordinates: { lat: -9.46, lng: -48.26 } }
    ];
  }

  // 🏙️ PRINCIPAIS CIDADES DO BRASIL
  private getBrazilMainCitiesData() {
    return [
      { name: 'São Paulo', state: 'São Paulo', coordinates: { lat: -23.5558, lng: -46.6396 } },
      { name: 'Rio de Janeiro', state: 'Rio de Janeiro', coordinates: { lat: -22.9068, lng: -43.1729 } },
      { name: 'Brasília', state: 'Distrito Federal', coordinates: { lat: -15.7801, lng: -47.9292 } },
      { name: 'Salvador', state: 'Bahia', coordinates: { lat: -12.9714, lng: -38.5014 } },
      { name: 'Fortaleza', state: 'Ceará', coordinates: { lat: -3.7319, lng: -38.5267 } },
      { name: 'Belo Horizonte', state: 'Minas Gerais', coordinates: { lat: -19.9167, lng: -43.9345 } },
      { name: 'Manaus', state: 'Amazonas', coordinates: { lat: -3.119, lng: -60.0217 } },
      { name: 'Curitiba', state: 'Paraná', coordinates: { lat: -25.4284, lng: -49.2733 } },
      { name: 'Recife', state: 'Pernambuco', coordinates: { lat: -8.0476, lng: -34.8770 } },
      { name: 'Goiânia', state: 'Goiás', coordinates: { lat: -16.6869, lng: -49.2648 } },
      { name: 'Belém', state: 'Pará', coordinates: { lat: -1.4558, lng: -48.5044 } },
      { name: 'Porto Alegre', state: 'Rio Grande do Sul', coordinates: { lat: -30.0346, lng: -51.2177 } },
      { name: 'Guarulhos', state: 'São Paulo', coordinates: { lat: -23.4538, lng: -46.5330 } },
      { name: 'Campinas', state: 'São Paulo', coordinates: { lat: -22.9099, lng: -47.0626 } },
      { name: 'São Luís', state: 'Maranhão', coordinates: { lat: -2.5387, lng: -44.2825 } },
      { name: 'São Gonçalo', state: 'Rio de Janeiro', coordinates: { lat: -22.8267, lng: -43.0537 } },
      { name: 'Maceió', state: 'Alagoas', coordinates: { lat: -9.6658, lng: -35.7353 } },
      { name: 'Duque de Caxias', state: 'Rio de Janeiro', coordinates: { lat: -22.7858, lng: -43.3054 } },
      { name: 'Teresina', state: 'Piauí', coordinates: { lat: -5.0892, lng: -42.8019 } },
      { name: 'Natal', state: 'Rio Grande do Norte', coordinates: { lat: -5.7945, lng: -35.2110 } }
    ];
  }

  // 🧹 LIMPAR DADOS DE TESTE
  async clearTestData(): Promise<{ success: boolean; deleted: number }> {
    try {
      const { error, count } = await supabase
        .from('spiritual_regions')
        .delete()
        .neq('data_source', 'manual');

      if (error) throw error;

      return { success: true, deleted: count || 0 };
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return { success: false, deleted: 0 };
    }
  }

  // 📊 VERIFICAR DADOS EXISTENTES
  async checkExistingData() {
    const { data: countries } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('region_type', 'country');

    const { data: states } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('region_type', 'state');

    const { data: cities } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('region_type', 'city');

    return {
      countries: countries?.length || 0,
      states: states?.length || 0,
      cities: cities?.length || 0,
      total: (countries?.length || 0) + (states?.length || 0) + (cities?.length || 0)
    };
  }
}

export const directPopulator = new DirectPopulator(); 