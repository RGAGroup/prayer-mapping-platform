// 🇺🇸 EXPANSÃO EUA - TODOS OS 50 ESTADOS + TERRITÓRIOS
// Execute: node expansion-usa-states.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cxibuehwbuobwruhzwka.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4'
);

// 🇺🇸 TODOS OS 50 ESTADOS AMERICANOS + DC + TERRITÓRIOS
const USA_STATES = [
  // 50 Estados
  { name: 'Alabama', code: 'AL', capital: 'Montgomery', lat: 32.806671, lng: -86.79113 },
  { name: 'Alaska', code: 'AK', capital: 'Juneau', lat: 61.068661, lng: -153.005405 },
  { name: 'Arizona', code: 'AZ', capital: 'Phoenix', lat: 33.729759, lng: -111.431221 },
  { name: 'Arkansas', code: 'AR', capital: 'Little Rock', lat: 34.736009, lng: -92.331122 },
  { name: 'California', code: 'CA', capital: 'Sacramento', lat: 36.778259, lng: -119.417931 },
  { name: 'Colorado', code: 'CO', capital: 'Denver', lat: 39.550051, lng: -105.782067 },
  { name: 'Connecticut', code: 'CT', capital: 'Hartford', lat: 41.767, lng: -72.677 },
  { name: 'Delaware', code: 'DE', capital: 'Dover', lat: 39.161921, lng: -75.526755 },
  { name: 'Florida', code: 'FL', capital: 'Tallahassee', lat: 27.771762, lng: -82.640315 },
  { name: 'Georgia', code: 'GA', capital: 'Atlanta', lat: 33.76, lng: -84.39 },
  { name: 'Hawaii', code: 'HI', capital: 'Honolulu', lat: 21.30895, lng: -157.826182 },
  { name: 'Idaho', code: 'ID', capital: 'Boise', lat: 44.240459, lng: -114.478828 },
  { name: 'Illinois', code: 'IL', capital: 'Springfield', lat: 40.349457, lng: -89.031738 },
  { name: 'Indiana', code: 'IN', capital: 'Indianapolis', lat: 39.790942, lng: -86.147685 },
  { name: 'Iowa', code: 'IA', capital: 'Des Moines', lat: 42.032974, lng: -93.581543 },
  { name: 'Kansas', code: 'KS', capital: 'Topeka', lat: 38.572954, lng: -98.580009 },
  { name: 'Kentucky', code: 'KY', capital: 'Frankfort', lat: 37.669457, lng: -84.670067 },
  { name: 'Louisiana', code: 'LA', capital: 'Baton Rouge', lat: 31.169546, lng: -91.867805 },
  { name: 'Maine', code: 'ME', capital: 'Augusta', lat: 44.323535, lng: -69.765261 },
  { name: 'Maryland', code: 'MD', capital: 'Annapolis', lat: 39.161921, lng: -76.526755 },
  { name: 'Massachusetts', code: 'MA', capital: 'Boston', lat: 42.2352, lng: -71.0275 },
  { name: 'Michigan', code: 'MI', capital: 'Lansing', lat: 43.326618, lng: -84.536095 },
  { name: 'Minnesota', code: 'MN', capital: 'Saint Paul', lat: 45.7326, lng: -93.9196 },
  { name: 'Mississippi', code: 'MS', capital: 'Jackson', lat: 32.320, lng: -90.207 },
  { name: 'Missouri', code: 'MO', capital: 'Jefferson City', lat: 38.572954, lng: -92.189283 },
  { name: 'Montana', code: 'MT', capital: 'Helena', lat: 47.052632, lng: -109.633837 },
  { name: 'Nebraska', code: 'NE', capital: 'Lincoln', lat: 41.590939, lng: -99.675285 },
  { name: 'Nevada', code: 'NV', capital: 'Carson City', lat: 38.313515, lng: -117.055374 },
  { name: 'New Hampshire', code: 'NH', capital: 'Concord', lat: 43.220093, lng: -71.549896 },
  { name: 'New Jersey', code: 'NJ', capital: 'Trenton', lat: 40.221741, lng: -74.756138 },
  { name: 'New Mexico', code: 'NM', capital: 'Santa Fe', lat: 34.307144, lng: -106.018066 },
  { name: 'New York', code: 'NY', capital: 'Albany', lat: 42.659829, lng: -73.781339 },
  { name: 'North Carolina', code: 'NC', capital: 'Raleigh', lat: 35.771, lng: -78.638 },
  { name: 'North Dakota', code: 'ND', capital: 'Bismarck', lat: 47.518420, lng: -99.784012 },
  { name: 'Ohio', code: 'OH', capital: 'Columbus', lat: 40.367474, lng: -82.996216 },
  { name: 'Oklahoma', code: 'OK', capital: 'Oklahoma City', lat: 35.482309, lng: -97.534994 },
  { name: 'Oregon', code: 'OR', capital: 'Salem', lat: 44.931109, lng: -123.029159 },
  { name: 'Pennsylvania', code: 'PA', capital: 'Harrisburg', lat: 40.269789, lng: -76.875613 },
  { name: 'Rhode Island', code: 'RI', capital: 'Providence', lat: 41.82355, lng: -71.422132 },
  { name: 'South Carolina', code: 'SC', capital: 'Columbia', lat: 33.836082, lng: -81.163727 },
  { name: 'South Dakota', code: 'SD', capital: 'Pierre', lat: 44.367966, lng: -99.336339 },
  { name: 'Tennessee', code: 'TN', capital: 'Nashville', lat: 35.771, lng: -86.784 },
  { name: 'Texas', code: 'TX', capital: 'Austin', lat: 31.9686, lng: -99.9018 },
  { name: 'Utah', code: 'UT', capital: 'Salt Lake City', lat: 40.777477, lng: -111.888237 },
  { name: 'Vermont', code: 'VT', capital: 'Montpelier', lat: 44.26639, lng: -72.580536 },
  { name: 'Virginia', code: 'VA', capital: 'Richmond', lat: 37.54, lng: -78.46 },
  { name: 'Washington', code: 'WA', capital: 'Olympia', lat: 47.042418, lng: -122.893077 },
  { name: 'West Virginia', code: 'WV', capital: 'Charleston', lat: 38.349497, lng: -81.633294 },
  { name: 'Wisconsin', code: 'WI', capital: 'Madison', lat: 44.268543, lng: -89.616508 },
  { name: 'Wyoming', code: 'WY', capital: 'Cheyenne', lat: 41.145548, lng: -104.802042 },
  
  // Distrito Federal
  { name: 'District of Columbia', code: 'DC', capital: 'Washington', lat: 38.9072, lng: -77.0369 },
  
  // Territórios
  { name: 'Puerto Rico', code: 'PR', capital: 'San Juan', lat: 18.2208, lng: -66.5901 },
  { name: 'US Virgin Islands', code: 'VI', capital: 'Charlotte Amalie', lat: 18.3358, lng: -64.8963 },
  { name: 'American Samoa', code: 'AS', capital: 'Pago Pago', lat: -14.2710, lng: -170.1322 },
  { name: 'Guam', code: 'GU', capital: 'Hagåtña', lat: 13.4443, lng: 144.7937 },
  { name: 'Northern Mariana Islands', code: 'MP', capital: 'Saipan', lat: 15.0979, lng: 145.6739 }
];

// 🏙️ PRINCIPAIS CIDADES POR ESTADO (amostra)
const USA_MAJOR_CITIES = {
  'California': [
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
    { name: 'Fresno', lat: 36.7378, lng: -119.7871 }
  ],
  'Texas': [
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
    { name: 'Fort Worth', lat: 32.7555, lng: -97.3308 }
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
  ],
  'Illinois': [
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 }
  ],
  'Pennsylvania': [
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
    { name: 'Pittsburgh', lat: 40.4406, lng: -79.9959 }
  ]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function expandUSAStates() {
  console.log('🇺🇸 INICIANDO EXPANSÃO DOS ESTADOS AMERICANOS');
  console.log('='.repeat(60));
  
  // Primeiro, encontrar o ID dos EUA
  const { data: usaCountries, error: searchError } = await supabase
    .from('spiritual_regions')
    .select('id, name')
    .eq('country_code', 'US')
    .eq('region_type', 'country')
    .limit(1);



  const usaCountry = usaCountries?.[0];

  if (!usaCountry) {
    console.error('❌ País EUA não encontrado no banco!');
    return;
  }

  console.log(`✅ País encontrado: ${usaCountry.name} (ID: ${usaCountry.id})`);
  
  let statesInserted = 0;
  let statesSkipped = 0;
  let citiesInserted = 0;
  let citiesSkipped = 0;

  // FASE 1: Inserir Estados
  console.log('\n🏛️ INSERINDO ESTADOS...');
  
  for (const state of USA_STATES) {
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', state.name)
        .eq('parent_id', usaCountry.id)
        .eq('region_type', 'state')
        .single();

      if (existing) {
        console.log(`⏭️ ${state.name} já existe`);
        statesSkipped++;
        continue;
      }

      // Inserir estado
              const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: state.name,
            region_type: 'state',
            country_code: 'US',
            parent_id: usaCountry.id,
            coordinates: { lat: state.lat, lng: state.lng },
            data_source: 'imported',
            status: 'approved'
          });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      console.log(`✅ ${state.name} inserido`);
      statesInserted++;

    } catch (error) {
      console.error(`❌ ${state.name}: ${error.message}`);
    }

    await delay(100);
  }

  // FASE 2: Inserir Cidades Principais
  console.log('\n🏙️ INSERINDO CIDADES PRINCIPAIS...');
  
  // Buscar estados recém-inseridos
  const { data: usaStates } = await supabase
    .from('spiritual_regions')
    .select('id, name')
    .eq('parent_id', usaCountry.id)
    .eq('region_type', 'state');

  for (const state of usaStates || []) {
    const cities = USA_MAJOR_CITIES[state.name];
    
    if (!cities || cities.length === 0) {
      continue;
    }
    
    console.log(`\n🏙️ ${state.name}: ${cities.length} cidades`);

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
          citiesSkipped++;
          continue;
        }

        // Inserir cidade
                  const { error } = await supabase
            .from('spiritual_regions')
            .insert({
              name: city.name,
              region_type: 'city',
              country_code: 'US',
              parent_id: state.id,
              coordinates: { lat: city.lat, lng: city.lng },
              data_source: 'imported',
              status: 'approved'
            });

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }

        console.log(`     ✅ ${city.name}`);
        citiesInserted++;

      } catch (error) {
        console.error(`     ❌ ${city.name}: ${error.message}`);
      }

      await delay(100);
    }
  }

  // RESUMO FINAL
  console.log('\n🎉 EXPANSÃO EUA COMPLETA!');
  console.log('='.repeat(60));
  console.log(`🏛️ Estados inseridos: ${statesInserted}`);
  console.log(`🏛️ Estados pulados: ${statesSkipped}`);
  console.log(`🏙️ Cidades inseridas: ${citiesInserted}`);
  console.log(`🏙️ Cidades puladas: ${citiesSkipped}`);
  
  const totalAdded = statesInserted + citiesInserted;
  console.log(`📈 TOTAL ADICIONADO: ${totalAdded} regiões`);

  // Status final do banco
  const { data: finalStatus } = await supabase
    .from('spiritual_regions')
    .select('region_type');

  const countries = finalStatus?.filter(r => r.region_type === 'country').length || 0;
  const states = finalStatus?.filter(r => r.region_type === 'state').length || 0;
  const cities = finalStatus?.filter(r => r.region_type === 'city').length || 0;

  console.log('\n📊 STATUS MUNDIAL ATUAL:');
  console.log(`🌍 Países: ${countries}`);
  console.log(`🏛️ Estados: ${states}`);
  console.log(`🏙️ Cidades: ${cities}`);
  console.log(`📊 TOTAL: ${countries + states + cities} regiões`);
}

// Executar
expandUSAStates().catch(console.error); 