// 🌍 WORLD POPULATOR - Sistema para população mundial completa
import { supabase } from '../integrations/supabase/client';

interface WorldConfig {
  batchSize: number;
  delayMs: number;
  continents: string[];
  skipExisting: boolean;
}

interface PopulationStats {
  countries: { inserted: number; skipped: number; failed: number };
  states: { inserted: number; skipped: number; failed: number };
  cities: { inserted: number; skipped: number; failed: number };
}

export class WorldPopulator {
  private config: WorldConfig;
  private stats: PopulationStats;

  constructor(config: WorldConfig) {
    this.config = config;
    this.stats = {
      countries: { inserted: 0, skipped: 0, failed: 0 },
      states: { inserted: 0, skipped: 0, failed: 0 },
      cities: { inserted: 0, skipped: 0, failed: 0 }
    };
  }

  // 🌍 POPULAÇÃO MUNDIAL COMPLETA
  async populateWorld(): Promise<PopulationStats> {
    console.log('🌍 INICIANDO POPULAÇÃO MUNDIAL COMPLETA');
    console.log('='.repeat(60));

    // FASE 1: Países
    console.log('📍 FASE 1: Populando países...');
    await this.populateCountries();

    // FASE 2: Estados
    console.log('\n📍 FASE 2: Populando estados...');
    await this.populateStates();

    // FASE 3: Cidades
    console.log('\n📍 FASE 3: Populando cidades...');
    await this.populateCities();

    console.log('\n🎉 POPULAÇÃO MUNDIAL COMPLETA!');
    this.printStats();
    
    return this.stats;
  }

  // 🌎 POPULAÇÃO DE PAÍSES
  private async populateCountries(): Promise<void> {
    for (const continent of this.config.continents) {
      console.log(`\n🌎 Populando ${continent}...`);
      
      const countries = this.getCountriesByContinent(continent);
      
      for (const country of countries) {
        try {
          // Verificar se já existe
          if (this.config.skipExisting) {
            const { data: existing } = await supabase
              .from('spiritual_regions')
              .select('id')
              .eq('country_code', country.code)
              .eq('region_type', 'country')
              .single();

            if (existing) {
              console.log(`⏭️ ${country.name} já existe`);
              this.stats.countries.skipped++;
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

          console.log(`✅ ${country.name}`);
          this.stats.countries.inserted++;

        } catch (error) {
          console.error(`❌ ${country.name}: ${error instanceof Error ? error.message : 'Erro'}`);
          this.stats.countries.failed++;
        }

        await this.delay(this.config.delayMs);
      }
    }
  }

  // 🏛️ POPULAÇÃO DE ESTADOS
  private async populateStates(): Promise<void> {
    // Buscar países no banco
    const { data: countries } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'country')
      .order('name');

    if (!countries) return;

    for (const country of countries) {
      const states = this.getStatesByCountry(country.country_code);
      
      if (states.length === 0) continue;
      
      console.log(`\n🏛️ ${country.name}: ${states.length} estados`);

      for (const state of states) {
        try {
          // Verificar se já existe
          if (this.config.skipExisting) {
            const { data: existing } = await supabase
              .from('spiritual_regions')
              .select('id')
              .eq('name', state.name)
              .eq('parent_id', country.id)
              .eq('region_type', 'state')
              .single();

            if (existing) {
              this.stats.states.skipped++;
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

          console.log(`   ✅ ${state.name}`);
          this.stats.states.inserted++;

        } catch (error) {
          console.error(`   ❌ ${state.name}: ${error instanceof Error ? error.message : 'Erro'}`);
          this.stats.states.failed++;
        }

        await this.delay(this.config.delayMs);
      }
    }
  }

  // 🏙️ POPULAÇÃO DE CIDADES
  private async populateCities(): Promise<void> {
    // Buscar estados no banco
    const { data: states } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'state')
      .order('name');

    if (!states) return;

    for (const state of states) {
      const cities = this.getCitiesByState(state.country_code, state.name);
      
      if (cities.length === 0) continue;
      
      console.log(`\n🏙️ ${state.name}: ${cities.length} cidades`);

      for (const city of cities) {
        try {
          // Verificar se já existe
          if (this.config.skipExisting) {
            const { data: existing } = await supabase
              .from('spiritual_regions')
              .select('id')
              .eq('name', city.name)
              .eq('parent_id', state.id)
              .eq('region_type', 'city')
              .single();

            if (existing) {
              this.stats.cities.skipped++;
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

          console.log(`     ✅ ${city.name}`);
          this.stats.cities.inserted++;

        } catch (error) {
          console.error(`     ❌ ${city.name}: ${error instanceof Error ? error.message : 'Erro'}`);
          this.stats.cities.failed++;
        }

        await this.delay(this.config.delayMs);
      }
    }
  }

  // 🌎 DADOS DOS PAÍSES POR CONTINENTE
  private getCountriesByContinent(continent: string) {
    const data: Record<string, any[]> = {
      'South America': [
        { name: 'Brasil', code: 'BRA', lat: -14.235, lng: -51.9253 },
        { name: 'Argentina', code: 'ARG', lat: -38.4161, lng: -63.6167 },
        { name: 'Chile', code: 'CHL', lat: -35.6751, lng: -71.543 },
        { name: 'Peru', code: 'PER', lat: -9.19, lng: -75.0152 },
        { name: 'Colômbia', code: 'COL', lat: 4.5709, lng: -74.2973 },
        { name: 'Venezuela', code: 'VEN', lat: 6.4238, lng: -66.5897 },
        { name: 'Equador', code: 'ECU', lat: -1.8312, lng: -78.1834 },
        { name: 'Bolívia', code: 'BOL', lat: -16.2902, lng: -63.5887 },
        { name: 'Paraguai', code: 'PRY', lat: -23.4425, lng: -58.4438 },
        { name: 'Uruguai', code: 'URY', lat: -32.5228, lng: -55.7658 },
        { name: 'Guiana', code: 'GUY', lat: 4.8604, lng: -58.9302 },
        { name: 'Suriname', code: 'SUR', lat: 3.9193, lng: -56.0278 }
      ],
      'North America': [
        { name: 'Estados Unidos', code: 'USA', lat: 39.8283, lng: -98.5795 },
        { name: 'Canadá', code: 'CAN', lat: 56.1304, lng: -106.3468 },
        { name: 'México', code: 'MEX', lat: 23.6345, lng: -102.5528 },
        { name: 'Guatemala', code: 'GTM', lat: 15.7835, lng: -90.2308 },
        { name: 'Cuba', code: 'CUB', lat: 21.5218, lng: -77.7812 },
        { name: 'Haiti', code: 'HTI', lat: 18.9712, lng: -72.2852 },
        { name: 'República Dominicana', code: 'DOM', lat: 18.7357, lng: -70.1627 },
        { name: 'Jamaica', code: 'JAM', lat: 18.1096, lng: -77.2975 },
        { name: 'Honduras', code: 'HND', lat: 15.2000, lng: -86.2419 },
        { name: 'Nicarágua', code: 'NIC', lat: 12.8654, lng: -85.2072 },
        { name: 'Costa Rica', code: 'CRI', lat: 9.7489, lng: -83.7534 },
        { name: 'Panamá', code: 'PAN', lat: 8.5380, lng: -80.7821 }
      ],
      'Europe': [
        { name: 'Reino Unido', code: 'GBR', lat: 55.3781, lng: -3.436 },
        { name: 'França', code: 'FRA', lat: 46.6034, lng: 1.8883 },
        { name: 'Alemanha', code: 'DEU', lat: 51.1657, lng: 10.4515 },
        { name: 'Espanha', code: 'ESP', lat: 40.4637, lng: -3.7492 },
        { name: 'Itália', code: 'ITA', lat: 41.8719, lng: 12.5674 },
        { name: 'Portugal', code: 'PRT', lat: 39.3999, lng: -8.2245 },
        { name: 'Holanda', code: 'NLD', lat: 52.1326, lng: 5.2913 },
        { name: 'Bélgica', code: 'BEL', lat: 50.5039, lng: 4.4699 },
        { name: 'Suíça', code: 'CHE', lat: 46.8182, lng: 8.2275 },
        { name: 'Áustria', code: 'AUT', lat: 47.5162, lng: 14.5501 },
        { name: 'Polônia', code: 'POL', lat: 51.9194, lng: 19.1451 },
        { name: 'República Tcheca', code: 'CZE', lat: 49.8175, lng: 15.473 },
        { name: 'Eslováquia', code: 'SVK', lat: 48.669, lng: 19.699 },
        { name: 'Hungria', code: 'HUN', lat: 47.1625, lng: 19.5033 },
        { name: 'Romênia', code: 'ROU', lat: 45.9432, lng: 24.9668 },
        { name: 'Bulgária', code: 'BGR', lat: 42.7339, lng: 25.4858 },
        { name: 'Grécia', code: 'GRC', lat: 39.0742, lng: 21.8243 },
        { name: 'Croácia', code: 'HRV', lat: 45.1, lng: 15.2 },
        { name: 'Sérvia', code: 'SRB', lat: 44.016521, lng: 21.005859 },
        { name: 'Noruega', code: 'NOR', lat: 60.472, lng: 8.4689 },
        { name: 'Suécia', code: 'SWE', lat: 60.1282, lng: 18.6435 },
        { name: 'Finlândia', code: 'FIN', lat: 61.9241, lng: 25.7482 },
        { name: 'Dinamarca', code: 'DNK', lat: 56.2639, lng: 9.5018 },
        { name: 'Irlanda', code: 'IRL', lat: 53.41291, lng: -8.24389 },
        { name: 'Islândia', code: 'ISL', lat: 64.9631, lng: -19.0208 }
      ],
      'Africa': [
        { name: 'Nigéria', code: 'NGA', lat: 9.082, lng: 8.6753 },
        { name: 'África do Sul', code: 'ZAF', lat: -30.5595, lng: 22.9375 },
        { name: 'Quênia', code: 'KEN', lat: -0.0236, lng: 37.9062 },
        { name: 'Egito', code: 'EGY', lat: 26.0975, lng: 31.1 },
        { name: 'Marrocos', code: 'MAR', lat: 31.7917, lng: -7.0926 },
        { name: 'Etiópia', code: 'ETH', lat: 9.145, lng: 40.4897 },
        { name: 'Gana', code: 'GHA', lat: 7.9465, lng: -1.0232 },
        { name: 'Uganda', code: 'UGA', lat: 1.3733, lng: 32.2903 },
        { name: 'Tanzânia', code: 'TZA', lat: -6.369, lng: 34.8888 },
        { name: 'Angola', code: 'AGO', lat: -11.2027, lng: 17.8739 },
        { name: 'Moçambique', code: 'MOZ', lat: -18.665, lng: 35.5296 },
        { name: 'Camarões', code: 'CMR', lat: 7.3697, lng: 12.3547 },
        { name: 'Costa do Marfim', code: 'CIV', lat: 7.539989, lng: -5.54708 },
        { name: 'Senegal', code: 'SEN', lat: 14.497401, lng: -14.452362 },
        { name: 'Mali', code: 'MLI', lat: 17.570692, lng: -3.996166 },
        { name: 'Burkina Faso', code: 'BFA', lat: 12.238333, lng: -1.561593 },
        { name: 'Níger', code: 'NER', lat: 17.607789, lng: 8.081666 },
        { name: 'Chade', code: 'TCD', lat: 15.454166, lng: 18.732207 },
        { name: 'Sudão', code: 'SDN', lat: 12.862807, lng: 30.217636 },
        { name: 'Sudão do Sul', code: 'SSD', lat: 6.877, lng: 31.307 }
      ],
      'Asia': [
        { name: 'China', code: 'CHN', lat: 35.8617, lng: 104.1954 },
        { name: 'Índia', code: 'IND', lat: 20.5937, lng: 78.9629 },
        { name: 'Japão', code: 'JPN', lat: 36.2048, lng: 138.2529 },
        { name: 'Coreia do Sul', code: 'KOR', lat: 35.9078, lng: 127.7669 },
        { name: 'Indonésia', code: 'IDN', lat: -0.7893, lng: 113.9213 },
        { name: 'Filipinas', code: 'PHL', lat: 12.8797, lng: 121.774 },
        { name: 'Tailândia', code: 'THA', lat: 15.87, lng: 100.9925 },
        { name: 'Vietnã', code: 'VNM', lat: 14.0583, lng: 108.2772 },
        { name: 'Malásia', code: 'MYS', lat: 4.2105, lng: 101.9758 },
        { name: 'Singapura', code: 'SGP', lat: 1.3521, lng: 103.8198 },
        { name: 'Paquistão', code: 'PAK', lat: 30.3753, lng: 69.3451 },
        { name: 'Bangladesh', code: 'BGD', lat: 23.685, lng: 90.3563 },
        { name: 'Sri Lanka', code: 'LKA', lat: 7.8731, lng: 80.7718 },
        { name: 'Myanmar', code: 'MMR', lat: 21.9162, lng: 95.956 },
        { name: 'Camboja', code: 'KHM', lat: 12.5657, lng: 104.991 },
        { name: 'Laos', code: 'LAO', lat: 19.85627, lng: 102.495496 },
        { name: 'Nepal', code: 'NPL', lat: 28.394857, lng: 84.124008 },
        { name: 'Bután', code: 'BTN', lat: 27.514162, lng: 90.433601 },
        { name: 'Mongólia', code: 'MNG', lat: 46.862496, lng: 103.846656 },
        { name: 'Cazaquistão', code: 'KAZ', lat: 48.019573, lng: 66.923684 },
        { name: 'Uzbequistão', code: 'UZB', lat: 41.377491, lng: 64.585262 },
        { name: 'Turquia', code: 'TUR', lat: 38.963745, lng: 35.243322 },
        { name: 'Irã', code: 'IRN', lat: 32.427908, lng: 53.688046 },
        { name: 'Iraque', code: 'IRQ', lat: 33.223191, lng: 43.679291 },
        { name: 'Arábia Saudita', code: 'SAU', lat: 23.885942, lng: 45.079162 }
      ],
      'Oceania': [
        { name: 'Austrália', code: 'AUS', lat: -25.2744, lng: 133.7751 },
        { name: 'Nova Zelândia', code: 'NZL', lat: -40.9006, lng: 174.886 },
        { name: 'Papua Nova Guiné', code: 'PNG', lat: -6.314, lng: 143.9555 },
        { name: 'Fiji', code: 'FJI', lat: -16.7784, lng: 179.414 },
        { name: 'Ilhas Salomão', code: 'SLB', lat: -9.6457, lng: 160.1562 },
        { name: 'Vanuatu', code: 'VUT', lat: -15.376706, lng: 166.959158 },
        { name: 'Samoa', code: 'WSM', lat: -13.759029, lng: -172.104629 },
        { name: 'Tonga', code: 'TON', lat: -21.178986, lng: -175.198242 }
      ]
    };

    return data[continent] || [];
  }

  // 🏛️ ESTADOS POR PAÍS (implementação inicial - será expandida)
  private getStatesByCountry(countryCode: string) {
    const statesData: Record<string, any[]> = {
      'USA': [
        { name: 'California', lat: 36.7783, lng: -119.4179 },
        { name: 'Texas', lat: 31.9686, lng: -99.9018 },
        { name: 'Florida', lat: 27.7663, lng: -82.6404 },
        { name: 'New York', lat: 42.1657, lng: -74.9481 },
        { name: 'Pennsylvania', lat: 41.2033, lng: -77.1945 },
        { name: 'Illinois', lat: 40.3363, lng: -89.0022 },
        { name: 'Ohio', lat: 40.3888, lng: -82.7649 },
        { name: 'Georgia', lat: 33.76, lng: -84.39 },
        { name: 'North Carolina', lat: 35.771, lng: -78.638 },
        { name: 'Michigan', lat: 43.3266, lng: -84.5361 }
      ],
      'CAN': [
        { name: 'Ontario', lat: 51.2538, lng: -85.3232 },
        { name: 'Quebec', lat: 53.9303, lng: -73.5468 },
        { name: 'British Columbia', lat: 53.7267, lng: -127.6476 },
        { name: 'Alberta', lat: 53.9333, lng: -116.5765 },
        { name: 'Manitoba', lat: 53.7609, lng: -98.8139 },
        { name: 'Saskatchewan', lat: 52.9399, lng: -106.4509 }
      ],
      'DEU': [
        { name: 'Bavaria', lat: 49.0134, lng: 10.9583 },
        { name: 'Baden-Württemberg', lat: 48.6616, lng: 9.3501 },
        { name: 'North Rhine-Westphalia', lat: 51.4332, lng: 7.6616 },
        { name: 'Hesse', lat: 50.6521, lng: 9.1624 },
        { name: 'Saxony', lat: 51.1045, lng: 13.2017 },
        { name: 'Lower Saxony', lat: 52.6367, lng: 9.8451 }
      ],
      'FRA': [
        { name: 'Île-de-France', lat: 48.8499, lng: 2.6370 },
        { name: 'Provence-Alpes-Côte d\'Azur', lat: 43.9352, lng: 6.0679 },
        { name: 'Auvergne-Rhône-Alpes', lat: 45.3584, lng: 4.0912 },
        { name: 'Occitanie', lat: 43.8927, lng: 2.1972 },
        { name: 'Nouvelle-Aquitaine', lat: 45.7640, lng: 0.8043 },
        { name: 'Grand Est', lat: 48.7000, lng: 5.9000 }
      ],
      'AUS': [
        { name: 'New South Wales', lat: -31.8759, lng: 145.2015 },
        { name: 'Victoria', lat: -36.5986, lng: 144.6780 },
        { name: 'Queensland', lat: -22.1646, lng: 144.2780 },
        { name: 'Western Australia', lat: -25.2834, lng: 122.2834 },
        { name: 'South Australia', lat: -30.0002, lng: 136.2092 },
        { name: 'Tasmania', lat: -42.0409, lng: 146.5981 }
      ]
      // Será expandido para incluir todos os países
    };

    return statesData[countryCode] || [];
  }

  // 🏙️ CIDADES POR ESTADO (implementação inicial)
  private getCitiesByState(countryCode: string, stateName: string) {
    const citiesData: Record<string, Record<string, any[]>> = {
      'USA': {
        'California': [
          { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
          { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
          { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
          { name: 'Sacramento', lat: 38.5816, lng: -121.4944 }
        ],
        'Texas': [
          { name: 'Houston', lat: 29.7604, lng: -95.3698 },
          { name: 'Austin', lat: 30.2672, lng: -97.7431 },
          { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
          { name: 'San Antonio', lat: 29.4241, lng: -98.4936 }
        ],
        'Florida': [
          { name: 'Miami', lat: 25.7617, lng: -80.1918 },
          { name: 'Orlando', lat: 28.5383, lng: -81.3792 },
          { name: 'Tampa', lat: 27.9506, lng: -82.4572 },
          { name: 'Jacksonville', lat: 30.3322, lng: -81.6557 }
        ]
      },
      'CAN': {
        'Ontario': [
          { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
          { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
          { name: 'Hamilton', lat: 43.2557, lng: -79.8711 }
        ],
        'Quebec': [
          { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
          { name: 'Quebec City', lat: 46.8139, lng: -71.2080 }
        ]
      }
      // Será expandido massivamente
    };

    return citiesData[countryCode]?.[stateName] || [];
  }

  // ⏱️ UTILITÁRIOS
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printStats(): void {
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log('='.repeat(40));
    console.log(`🌍 Países:`);
    console.log(`   ✅ Inseridos: ${this.stats.countries.inserted}`);
    console.log(`   ⏭️ Pulados: ${this.stats.countries.skipped}`);
    console.log(`   ❌ Falharam: ${this.stats.countries.failed}`);
    
    console.log(`🏛️ Estados:`);
    console.log(`   ✅ Inseridos: ${this.stats.states.inserted}`);
    console.log(`   ⏭️ Pulados: ${this.stats.states.skipped}`);
    console.log(`   ❌ Falharam: ${this.stats.states.failed}`);
    
    console.log(`🏙️ Cidades:`);
    console.log(`   ✅ Inseridos: ${this.stats.cities.inserted}`);
    console.log(`   ⏭️ Pulados: ${this.stats.cities.skipped}`);
    console.log(`   ❌ Falharam: ${this.stats.cities.failed}`);
    
    const total = this.stats.countries.inserted + this.stats.states.inserted + this.stats.cities.inserted;
    console.log(`\n📈 TOTAL INSERIDO: ${total} regiões`);
  }
}

// 🌍 CONFIGURAÇÃO PADRÃO
export const createDefaultConfig = (): WorldConfig => ({
  batchSize: 50,
  delayMs: 200, // 200ms entre requests
  continents: ['South America', 'North America', 'Europe', 'Africa', 'Asia', 'Oceania'],
  skipExisting: true
});

export const worldPopulator = new WorldPopulator(createDefaultConfig()); 