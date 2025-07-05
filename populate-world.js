// 🌍 SCRIPT DE POPULAÇÃO MUNDIAL COMPLETA
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cxibuehwbuobwruhzwka.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxNTkxMDIsImV4cCI6MjAzNDczNTEwMn0.jXOgTj8X4EQVJYzCmnI2wPRyKUNNrXOBAOUOJMf--aI'
);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🌍 PAÍSES POR CONTINENTE
const COUNTRIES_DATA = {
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
    { name: 'Hungria', code: 'HUN', lat: 47.1625, lng: 19.5033 },
    { name: 'Romênia', code: 'ROU', lat: 45.9432, lng: 24.9668 },
    { name: 'Bulgária', code: 'BGR', lat: 42.7339, lng: 25.4858 },
    { name: 'Grécia', code: 'GRC', lat: 39.0742, lng: 21.8243 },
    { name: 'Noruega', code: 'NOR', lat: 60.472, lng: 8.4689 },
    { name: 'Suécia', code: 'SWE', lat: 60.1282, lng: 18.6435 },
    { name: 'Finlândia', code: 'FIN', lat: 61.9241, lng: 25.7482 },
    { name: 'Dinamarca', code: 'DNK', lat: 56.2639, lng: 9.5018 },
    { name: 'Irlanda', code: 'IRL', lat: 53.41291, lng: -8.24389 },
    { name: 'Islândia', code: 'ISL', lat: 64.9631, lng: -19.0208 },
    { name: 'Rússia', code: 'RUS', lat: 61.52401, lng: 105.318756 },
    { name: 'Ucrânia', code: 'UKR', lat: 48.379433, lng: 31.16558 }
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
    { name: 'Mongólia', code: 'MNG', lat: 46.862496, lng: 103.846656 },
    { name: 'Turquia', code: 'TUR', lat: 38.963745, lng: 35.243322 },
    { name: 'Irã', code: 'IRN', lat: 32.427908, lng: 53.688046 },
    { name: 'Iraque', code: 'IRQ', lat: 33.223191, lng: 43.679291 },
    { name: 'Arábia Saudita', code: 'SAU', lat: 23.885942, lng: 45.079162 },
    { name: 'Israel', code: 'ISR', lat: 31.046051, lng: 34.851612 }
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
    { name: 'Níger', code: 'NER', lat: 17.607789, lng: 8.081666 },
    { name: 'Chade', code: 'TCD', lat: 15.454166, lng: 18.732207 },
    { name: 'Sudão', code: 'SDN', lat: 12.862807, lng: 30.217636 },
    { name: 'Zimbábue', code: 'ZWE', lat: -19.015438, lng: 29.154857 },
    { name: 'Zâmbia', code: 'ZMB', lat: -13.133897, lng: 27.849332 }
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

// 🏛️ PRINCIPAIS ESTADOS/PROVÍNCIAS
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
  'CHN': [
    { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: 'Guangdong', lat: 23.3417, lng: 113.4244 },
    { name: 'Sichuan', lat: 30.6171, lng: 102.7103 },
    { name: 'Shandong', lat: 36.3427, lng: 118.1498 },
    { name: 'Henan', lat: 33.8818, lng: 113.6140 }
  ],
  'IND': [
    { name: 'Maharashtra', lat: 19.7515, lng: 75.7139 },
    { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569 },
    { name: 'Karnataka', lat: 15.3173, lng: 75.7139 },
    { name: 'Gujarat', lat: 22.2587, lng: 71.1924 },
    { name: 'Rajasthan', lat: 27.0238, lng: 74.2179 },
    { name: 'West Bengal', lat: 22.9868, lng: 87.8550 }
  ],
  'AUS': [
    { name: 'New South Wales', lat: -31.8759, lng: 145.2015 },
    { name: 'Victoria', lat: -36.5986, lng: 144.6780 },
    { name: 'Queensland', lat: -22.1646, lng: 144.2780 },
    { name: 'Western Australia', lat: -25.2834, lng: 122.2834 },
    { name: 'South Australia', lat: -30.0002, lng: 136.2092 },
    { name: 'Tasmania', lat: -42.0409, lng: 146.5981 }
  ]
};

// 🏙️ PRINCIPAIS CIDADES
const CITIES_DATA = {
  'USA': {
    'California': [
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { name: 'San Diego', lat: 32.7157, lng: -117.1611 }
    ],
    'Texas': [
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Austin', lat: 30.2672, lng: -97.7431 },
      { name: 'Dallas', lat: 32.7767, lng: -96.7970 }
    ],
    'New York': [
      { name: 'New York City', lat: 40.7128, lng: -74.0060 }
    ]
  },
  'CAN': {
    'Ontario': [
      { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { name: 'Ottawa', lat: 45.4215, lng: -75.6972 }
    ],
    'Quebec': [
      { name: 'Montreal', lat: 45.5017, lng: -73.5673 }
    ]
  },
  'CHN': {
    'Beijing': [
      { name: 'Beijing', lat: 39.9042, lng: 116.4074 }
    ],
    'Shanghai': [
      { name: 'Shanghai', lat: 31.2304, lng: 121.4737 }
    ]
  }
};

async function populateCountries() {
  console.log('🌍 POPULANDO PAÍSES...');
  let inserted = 0, skipped = 0, failed = 0;

  for (const [continent, countries] of Object.entries(COUNTRIES_DATA)) {
    console.log(`\n🌎 ${continent}: ${countries.length} países`);
    
    for (const country of countries) {
      try {
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('country_code', country.code)
          .eq('region_type', 'country')
          .single();

        if (existing) {
          console.log(`⏭️ ${country.name}`);
          skipped++;
          continue;
        }

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
        inserted++;

      } catch (error) {
        console.error(`❌ ${country.name}: ${error.message}`);
        failed++;
      }

      await delay(100);
    }
  }

  console.log(`\n📊 Países: ${inserted} inseridos, ${skipped} pulados, ${failed} falharam`);
  return { inserted, skipped, failed };
}

async function populateStates() {
  console.log('\n🏛️ POPULANDO ESTADOS...');
  let inserted = 0, skipped = 0, failed = 0;

  const { data: countries } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'country');

  for (const country of countries || []) {
    const states = STATES_DATA[country.country_code];
    if (!states) continue;
    
    console.log(`\n🏛️ ${country.name}: ${states.length} estados`);

    for (const state of states) {
      try {
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', state.name)
          .eq('parent_id', country.id)
          .eq('region_type', 'state')
          .single();

        if (existing) {
          skipped++;
          continue;
        }

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
        inserted++;

      } catch (error) {
        console.error(`   ❌ ${state.name}: ${error.message}`);
        failed++;
      }

      await delay(100);
    }
  }

  console.log(`\n📊 Estados: ${inserted} inseridos, ${skipped} pulados, ${failed} falharam`);
  return { inserted, skipped, failed };
}

async function populateCities() {
  console.log('\n🏙️ POPULANDO CIDADES...');
  let inserted = 0, skipped = 0, failed = 0;

  const { data: states } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'state');

  for (const state of states || []) {
    const cities = CITIES_DATA[state.country_code]?.[state.name];
    if (!cities) continue;
    
    console.log(`\n🏙️ ${state.name}: ${cities.length} cidades`);

    for (const city of cities) {
      try {
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', city.name)
          .eq('parent_id', state.id)
          .eq('region_type', 'city')
          .single();

        if (existing) {
          skipped++;
          continue;
        }

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
        inserted++;

      } catch (error) {
        console.error(`     ❌ ${city.name}: ${error.message}`);
        failed++;
      }

      await delay(100);
    }
  }

  console.log(`\n📊 Cidades: ${inserted} inseridos, ${skipped} pulados, ${failed} falharam`);
  return { inserted, skipped, failed };
}

async function main() {
  console.log('🌍 POPULAÇÃO MUNDIAL INICIADA');
  console.log('='.repeat(50));

  const startTime = Date.now();

  const countriesResult = await populateCountries();
  const statesResult = await populateStates();
  const citiesResult = await populateCities();

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  const totalInserted = countriesResult.inserted + statesResult.inserted + citiesResult.inserted;

  console.log('\n🎉 POPULAÇÃO MUNDIAL COMPLETA!');
  console.log('='.repeat(50));
  console.log(`📈 TOTAL INSERIDO: ${totalInserted} regiões`);
  console.log(`⏱️ Tempo: ${totalTime}s`);

  // Status final
  const { data: finalCount } = await supabase
    .from('spiritual_regions')
    .select('region_type');

  const countries = finalCount?.filter(r => r.region_type === 'country').length || 0;
  const states = finalCount?.filter(r => r.region_type === 'state').length || 0;
  const cities = finalCount?.filter(r => r.region_type === 'city').length || 0;

  console.log('\n📊 STATUS FINAL:');
  console.log(`🌍 Países: ${countries}`);
  console.log(`🏛️ Estados: ${states}`);
  console.log(`🏙️ Cidades: ${cities}`);
  console.log(`📊 TOTAL: ${countries + states + cities} regiões`);
}

main().catch(console.error); 