// 🌍 WORLD POPULATION SCRIPT - População mundial completa
// Execute: node world-populate.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxibuehwbuobwruhzwka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxNTkxMDIsImV4cCI6MjAzNDczNTEwMn0.jXOgTj8X4EQVJYzCmnI2wPRyKUNNrXOBAOUOJMf--aI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🌍 DADOS MUNDIAIS ORGANIZADOS POR CONTINENTE
const WORLD_DATA = {
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
    { name: 'Sudão do Sul', code: 'SSD', lat: 6.877, lng: 31.307 },
    { name: 'Zimbábue', code: 'ZWE', lat: -19.015438, lng: 29.154857 },
    { name: 'Zâmbia', code: 'ZMB', lat: -13.133897, lng: 27.849332 },
    { name: 'Botswana', code: 'BWA', lat: -22.328474, lng: 24.684866 },
    { name: 'Namíbia', code: 'NAM', lat: -22.95764, lng: 18.49041 },
    { name: 'Lesoto', code: 'LSO', lat: -29.609988, lng: 28.233608 }
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
    { name: 'Arábia Saudita', code: 'SAU', lat: 23.885942, lng: 45.079162 },
    { name: 'Israel', code: 'ISR', lat: 31.046051, lng: 34.851612 },
    { name: 'Jordânia', code: 'JOR', lat: 30.585164, lng: 36.238414 },
    { name: 'Líbano', code: 'LBN', lat: 33.854721, lng: 35.862285 },
    { name: 'Síria', code: 'SYR', lat: 34.802075, lng: 38.996815 },
    { name: 'Kuwait', code: 'KWT', lat: 29.31166, lng: 47.481766 }
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
    { name: 'Bósnia e Herzegovina', code: 'BIH', lat: 43.915886, lng: 17.679076 },
    { name: 'Montenegro', code: 'MNE', lat: 42.708678, lng: 19.37439 },
    { name: 'Albânia', code: 'ALB', lat: 41.153332, lng: 20.168331 },
    { name: 'Macedônia do Norte', code: 'MKD', lat: 41.608635, lng: 21.745275 },
    { name: 'Eslovênia', code: 'SVN', lat: 46.151241, lng: 14.995463 },
    { name: 'Noruega', code: 'NOR', lat: 60.472, lng: 8.4689 },
    { name: 'Suécia', code: 'SWE', lat: 60.1282, lng: 18.6435 },
    { name: 'Finlândia', code: 'FIN', lat: 61.9241, lng: 25.7482 },
    { name: 'Dinamarca', code: 'DNK', lat: 56.2639, lng: 9.5018 },
    { name: 'Irlanda', code: 'IRL', lat: 53.41291, lng: -8.24389 },
    { name: 'Islândia', code: 'ISL', lat: 64.9631, lng: -19.0208 },
    { name: 'Rússia', code: 'RUS', lat: 61.52401, lng: 105.318756 },
    { name: 'Ucrânia', code: 'UKR', lat: 48.379433, lng: 31.16558 },
    { name: 'Belarus', code: 'BLR', lat: 53.709807, lng: 27.953389 },
    { name: 'Lituânia', code: 'LTU', lat: 55.169438, lng: 23.881275 },
    { name: 'Letônia', code: 'LVA', lat: 56.879635, lng: 24.603189 },
    { name: 'Estônia', code: 'EST', lat: 58.595272, lng: 25.013607 }
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
    { name: 'Panamá', code: 'PAN', lat: 8.5380, lng: -80.7821 },
    { name: 'El Salvador', code: 'SLV', lat: 13.794185, lng: -88.89653 },
    { name: 'Belize', code: 'BLZ', lat: 17.189877, lng: -88.49765 },
    { name: 'Bahamas', code: 'BHS', lat: 25.03428, lng: -77.39628 },
    { name: 'Barbados', code: 'BRB', lat: 13.193887, lng: -59.543198 },
    { name: 'Trinidad e Tobago', code: 'TTO', lat: 10.691803, lng: -61.222503 }
  ],
  'Oceania': [
    { name: 'Austrália', code: 'AUS', lat: -25.2744, lng: 133.7751 },
    { name: 'Nova Zelândia', code: 'NZL', lat: -40.9006, lng: 174.886 },
    { name: 'Papua Nova Guiné', code: 'PNG', lat: -6.314, lng: 143.9555 },
    { name: 'Fiji', code: 'FJI', lat: -16.7784, lng: 179.414 },
    { name: 'Ilhas Salomão', code: 'SLB', lat: -9.6457, lng: 160.1562 },
    { name: 'Vanuatu', code: 'VUT', lat: -15.376706, lng: 166.959158 },
    { name: 'Samoa', code: 'WSM', lat: -13.759029, lng: -172.104629 },
    { name: 'Tonga', code: 'TON', lat: -21.178986, lng: -175.198242 },
    { name: 'Micronésia', code: 'FSM', lat: 7.425554, lng: 150.550812 },
    { name: 'Palau', code: 'PLW', lat: 7.51498, lng: 134.58252 },
    { name: 'Ilhas Marshall', code: 'MHL', lat: 7.131474, lng: 171.184478 },
    { name: 'Nauru', code: 'NRU', lat: -0.522778, lng: 166.931503 },
    { name: 'Tuvalu', code: 'TUV', lat: -7.109535, lng: 177.64933 },
    { name: 'Kiribati', code: 'KIR', lat: -3.370417, lng: -168.734039 }
  ]
};

// 🌍 POPULAÇÃO DE PAÍSES
async function populateCountries() {
  console.log('🌍 INICIANDO POPULAÇÃO DE PAÍSES MUNDIAIS');
  console.log('='.repeat(60));
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const [continent, countries] of Object.entries(WORLD_DATA)) {
    console.log(`\n🌎 ${continent}: ${countries.length} países`);
    
    for (const country of countries) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('country_code', country.code)
          .eq('region_type', 'country')
          .single();

        if (existing) {
          console.log(`⏭️ ${country.name} já existe`);
          totalSkipped++;
          continue;
        }

        // Inserir país
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: country.name,
            region_type: 'country',
            country_code: country.code,
            coordinates: { lat: country.lat, lng: country.lng },
            data_source: 'world_import',
            status: 'approved'
          });

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }

        console.log(`✅ ${country.name}`);
        totalInserted++;

      } catch (error) {
        console.error(`❌ ${country.name}: ${error.message}`);
        totalFailed++;
      }

      await delay(150); // 150ms entre requests
    }
  }

  console.log('\n📊 RESULTADOS DOS PAÍSES:');
  console.log(`✅ Inseridos: ${totalInserted}`);
  console.log(`⏭️ Pulados: ${totalSkipped}`);
  console.log(`❌ Falharam: ${totalFailed}`);
  
  return { inserted: totalInserted, skipped: totalSkipped, failed: totalFailed };
}

// 🏛️ DADOS DE ESTADOS PARA PAÍSES PRINCIPAIS
const STATES_DATA = {
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
    { name: 'Michigan', lat: 43.3266, lng: -84.5361 },
    { name: 'Washington', lat: 47.7511, lng: -120.7401 },
    { name: 'Arizona', lat: 34.0489, lng: -111.0937 },
    { name: 'Massachusetts', lat: 42.4072, lng: -71.3824 },
    { name: 'Tennessee', lat: 35.7796, lng: -86.7663 },
    { name: 'Indiana', lat: 39.7817, lng: -86.1478 },
    { name: 'Missouri', lat: 37.9643, lng: -91.8318 },
    { name: 'Maryland', lat: 39.0458, lng: -76.6413 },
    { name: 'Wisconsin', lat: 43.7844, lng: -88.7879 },
    { name: 'Colorado', lat: 39.0598, lng: -105.3111 },
    { name: 'Minnesota', lat: 45.7326, lng: -93.9196 }
  ],
  'CAN': [
    { name: 'Ontario', lat: 51.2538, lng: -85.3232 },
    { name: 'Quebec', lat: 53.9303, lng: -73.5468 },
    { name: 'British Columbia', lat: 53.7267, lng: -127.6476 },
    { name: 'Alberta', lat: 53.9333, lng: -116.5765 },
    { name: 'Manitoba', lat: 53.7609, lng: -98.8139 },
    { name: 'Saskatchewan', lat: 52.9399, lng: -106.4509 },
    { name: 'Nova Scotia', lat: 44.682, lng: -63.7443 },
    { name: 'New Brunswick', lat: 46.5653, lng: -66.4619 },
    { name: 'Newfoundland and Labrador', lat: 53.1355, lng: -57.6604 },
    { name: 'Prince Edward Island', lat: 46.5107, lng: -63.4168 }
  ],
  'DEU': [
    { name: 'Bavaria', lat: 49.0134, lng: 10.9583 },
    { name: 'Baden-Württemberg', lat: 48.6616, lng: 9.3501 },
    { name: 'North Rhine-Westphalia', lat: 51.4332, lng: 7.6616 },
    { name: 'Hesse', lat: 50.6521, lng: 9.1624 },
    { name: 'Saxony', lat: 51.1045, lng: 13.2017 },
    { name: 'Lower Saxony', lat: 52.6367, lng: 9.8451 },
    { name: 'Rhineland-Palatinate', lat: 49.9129, lng: 7.4597 },
    { name: 'Schleswig-Holstein', lat: 54.2194, lng: 9.6961 },
    { name: 'Brandenburg', lat: 52.4125, lng: 12.5316 },
    { name: 'Saxony-Anhalt', lat: 51.9503, lng: 11.6923 }
  ],
  'FRA': [
    { name: 'Île-de-France', lat: 48.8499, lng: 2.6370 },
    { name: 'Provence-Alpes-Côte d\'Azur', lat: 43.9352, lng: 6.0679 },
    { name: 'Auvergne-Rhône-Alpes', lat: 45.3584, lng: 4.0912 },
    { name: 'Occitanie', lat: 43.8927, lng: 2.1972 },
    { name: 'Nouvelle-Aquitaine', lat: 45.7640, lng: 0.8043 },
    { name: 'Grand Est', lat: 48.7000, lng: 5.9000 },
    { name: 'Hauts-de-France', lat: 50.4801, lng: 2.7937 },
    { name: 'Normandy', lat: 49.1829, lng: 0.3707 },
    { name: 'Centre-Val de Loire', lat: 47.7515, lng: 1.6750 },
    { name: 'Bourgogne-Franche-Comté', lat: 47.2768, lng: 4.9980 }
  ],
  'AUS': [
    { name: 'New South Wales', lat: -31.8759, lng: 145.2015 },
    { name: 'Victoria', lat: -36.5986, lng: 144.6780 },
    { name: 'Queensland', lat: -22.1646, lng: 144.2780 },
    { name: 'Western Australia', lat: -25.2834, lng: 122.2834 },
    { name: 'South Australia', lat: -30.0002, lng: 136.2092 },
    { name: 'Tasmania', lat: -42.0409, lng: 146.5981 },
    { name: 'Northern Territory', lat: -19.4914, lng: 132.5510 },
    { name: 'Australian Capital Territory', lat: -35.4735, lng: 149.0124 }
  ],
  'CHN': [
    { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: 'Guangdong', lat: 23.3417, lng: 113.4244 },
    { name: 'Sichuan', lat: 30.6171, lng: 102.7103 },
    { name: 'Henan', lat: 33.8818, lng: 113.6140 },
    { name: 'Shandong', lat: 36.3427, lng: 118.1498 },
    { name: 'Hebei', lat: 38.0428, lng: 114.5149 },
    { name: 'Hunan', lat: 27.6104, lng: 111.7088 },
    { name: 'Anhui', lat: 31.8612, lng: 117.2273 },
    { name: 'Hubei', lat: 30.9756, lng: 112.2707 }
  ],
  'IND': [
    { name: 'Maharashtra', lat: 19.7515, lng: 75.7139 },
    { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569 },
    { name: 'Karnataka', lat: 15.3173, lng: 75.7139 },
    { name: 'Gujarat', lat: 22.2587, lng: 71.1924 },
    { name: 'Rajasthan', lat: 27.0238, lng: 74.2179 },
    { name: 'West Bengal', lat: 22.9868, lng: 87.8550 },
    { name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569 },
    { name: 'Kerala', lat: 10.8505, lng: 76.2711 },
    { name: 'Punjab', lat: 31.1471, lng: 75.3412 }
  ]
};

// 🏛️ POPULAÇÃO DE ESTADOS
async function populateStates() {
  console.log('\n🏛️ INICIANDO POPULAÇÃO DE ESTADOS/PROVÍNCIAS');
  console.log('='.repeat(60));
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // Buscar países que já estão no banco
  const { data: countries } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'country')
    .order('name');

  if (!countries) {
    console.log('❌ Nenhum país encontrado no banco');
    return { inserted: 0, skipped: 0, failed: 0 };
  }

  for (const country of countries) {
    const states = STATES_DATA[country.country_code];
    
    if (!states || states.length === 0) {
      console.log(`⏭️ ${country.name}: sem dados de estados`);
      continue;
    }
    
    console.log(`\n🏛️ ${country.name}: ${states.length} estados`);

    for (const state of states) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', state.name)
          .eq('parent_id', country.id)
          .eq('region_type', 'state')
          .single();

        if (existing) {
          console.log(`   ⏭️ ${state.name} já existe`);
          totalSkipped++;
          continue;
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
            data_source: 'world_import',
            status: 'approved'
          });

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }

        console.log(`   ✅ ${state.name}`);
        totalInserted++;

      } catch (error) {
        console.error(`   ❌ ${state.name}: ${error.message}`);
        totalFailed++;
      }

      await delay(100);
    }
  }

  console.log('\n📊 RESULTADOS DOS ESTADOS:');
  console.log(`✅ Inseridos: ${totalInserted}`);
  console.log(`⏭️ Pulados: ${totalSkipped}`);
  console.log(`❌ Falharam: ${totalFailed}`);
  
  return { inserted: totalInserted, skipped: totalSkipped, failed: totalFailed };
}

// 🏙️ PRINCIPAIS CIDADES MUNDIAIS
const MAJOR_CITIES = {
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
    ],
    'New York': [
      { name: 'New York City', lat: 40.7128, lng: -74.0060 },
      { name: 'Buffalo', lat: 42.8864, lng: -78.8784 },
      { name: 'Rochester', lat: 43.1566, lng: -77.6088 }
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
    ],
    'British Columbia': [
      { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
      { name: 'Victoria', lat: 48.4284, lng: -123.3656 }
    ]
  },
  'GBR': {
    'England': [
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
      { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
      { name: 'Liverpool', lat: 53.4084, lng: -2.9916 }
    ]
  },
  'FRA': {
    'Île-de-France': [
      { name: 'Paris', lat: 48.8566, lng: 2.3522 }
    ],
    'Provence-Alpes-Côte d\'Azur': [
      { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
      { name: 'Nice', lat: 43.7102, lng: 7.2620 }
    ]
  },
  'DEU': {
    'Bavaria': [
      { name: 'Munich', lat: 48.1351, lng: 11.5820 }
    ],
    'North Rhine-Westphalia': [
      { name: 'Cologne', lat: 50.9375, lng: 6.9603 },
      { name: 'Düsseldorf', lat: 51.2277, lng: 6.7735 }
    ]
  },
  'CHN': {
    'Beijing': [
      { name: 'Beijing', lat: 39.9042, lng: 116.4074 }
    ],
    'Shanghai': [
      { name: 'Shanghai', lat: 31.2304, lng: 121.4737 }
    ],
    'Guangdong': [
      { name: 'Guangzhou', lat: 23.1291, lng: 113.2644 },
      { name: 'Shenzhen', lat: 22.5431, lng: 114.0579 }
    ]
  },
  'JPN': {
    'Tokyo': [
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 }
    ],
    'Osaka': [
      { name: 'Osaka', lat: 34.6937, lng: 135.5023 }
    ]
  },
  'AUS': {
    'New South Wales': [
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
    ],
    'Victoria': [
      { name: 'Melbourne', lat: -37.8136, lng: 144.9631 }
    ],
    'Queensland': [
      { name: 'Brisbane', lat: -27.4698, lng: 153.0251 }
    ]
  }
};

// 🏙️ POPULAÇÃO DE CIDADES
async function populateCities() {
  console.log('\n🏙️ INICIANDO POPULAÇÃO DE CIDADES PRINCIPAIS');
  console.log('='.repeat(60));
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // Buscar estados no banco
  const { data: states } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'state')
    .order('name');

  if (!states) {
    console.log('❌ Nenhum estado encontrado no banco');
    return { inserted: 0, skipped: 0, failed: 0 };
  }

  for (const state of states) {
    const cities = MAJOR_CITIES[state.country_code]?.[state.name];
    
    if (!cities || cities.length === 0) {
      continue; // Pular silenciosamente estados sem dados
    }
    
    console.log(`\n🏙️ ${state.name}, ${state.country_code}: ${cities.length} cidades`);

    for (const city of cities) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', city.name)
          .eq('parent_id', state.id)
          .eq('region_type', 'city')
          .single();

        if (existing) {
          console.log(`     ⏭️ ${city.name} já existe`);
          totalSkipped++;
          continue;
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
            data_source: 'world_import',
            status: 'approved'
          });

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }

        console.log(`     ✅ ${city.name}`);
        totalInserted++;

      } catch (error) {
        console.error(`     ❌ ${city.name}: ${error.message}`);
        totalFailed++;
      }

      await delay(100);
    }
  }

  console.log('\n📊 RESULTADOS DAS CIDADES:');
  console.log(`✅ Inseridos: ${totalInserted}`);
  console.log(`⏭️ Pulados: ${totalSkipped}`);
  console.log(`❌ Falharam: ${totalFailed}`);
  
  return { inserted: totalInserted, skipped: totalSkipped, failed: totalFailed };
}

// 🌍 EXECUÇÃO PRINCIPAL
async function main() {
  console.log('🌍 POPULAÇÃO MUNDIAL COMPLETA - INICIANDO');
  console.log('='.repeat(60));
  console.log('Este script irá popular:');
  console.log('• Países de todos os continentes');
  console.log('• Estados/províncias dos países principais');
  console.log('• Cidades principais mundiais');
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    // FASE 1: Países
    const countriesResult = await populateCountries();
    
    // FASE 2: Estados
    const statesResult = await populateStates();
    
    // FASE 3: Cidades
    const citiesResult = await populateCities();

    // RESUMO FINAL
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const totalInserted = countriesResult.inserted + statesResult.inserted + citiesResult.inserted;

    console.log('\n🎉 POPULAÇÃO MUNDIAL COMPLETA!');
    console.log('='.repeat(60));
    console.log('📊 RESUMO FINAL:');
    console.log(`🌍 Países: ${countriesResult.inserted} inseridos, ${countriesResult.skipped} pulados`);
    console.log(`🏛️ Estados: ${statesResult.inserted} inseridos, ${statesResult.skipped} pulados`);
    console.log(`🏙️ Cidades: ${citiesResult.inserted} inseridos, ${citiesResult.skipped} pulados`);
    console.log(`📈 TOTAL INSERIDO: ${totalInserted} regiões`);
    console.log(`⏱️ Tempo total: ${totalTime}s`);
    console.log('='.repeat(60));

    // Verificar status final do banco
    const { data: finalCount } = await supabase
      .from('spiritual_regions')
      .select('region_type', { count: 'exact' });

    const { data: countriesCount } = await supabase
      .from('spiritual_regions')
      .select('id', { count: 'exact' })
      .eq('region_type', 'country');

    const { data: statesCount } = await supabase
      .from('spiritual_regions')
      .select('id', { count: 'exact' })
      .eq('region_type', 'state');

    const { data: citiesCount } = await supabase
      .from('spiritual_regions')
      .select('id', { count: 'exact' })
      .eq('region_type', 'city');

    console.log('\n📈 STATUS FINAL DO BANCO:');
    console.log(`🌍 Total de países: ${countriesCount?.length || 0}`);
    console.log(`🏛️ Total de estados: ${statesCount?.length || 0}`);
    console.log(`🏙️ Total de cidades: ${citiesCount?.length || 0}`);
    console.log(`📊 TOTAL GERAL: ${(countriesCount?.length || 0) + (statesCount?.length || 0) + (citiesCount?.length || 0)} regiões`);

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error.message);
    process.exit(1);
  }
}

// Executar script
main(); 