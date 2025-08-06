// 🚀 ADICIONAR ESTADOS AGORA - CORREÇÃO RÁPIDA
// Usar nomes exatos que existem no banco

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

// 🏛️ ESTADOS COM NOMES CORRETOS DO BANCO
const STATES_BY_COUNTRY = {
  "United States": [
    { name: "California", capital: "Sacramento", lat: 36.7783, lng: -119.4179 },
    { name: "Texas", capital: "Austin", lat: 31.9686, lng: -99.9018 },
    { name: "Florida", capital: "Tallahassee", lat: 27.7663, lng: -81.6868 },
    { name: "New York", capital: "Albany", lat: 42.1657, lng: -74.9481 },
    { name: "Pennsylvania", capital: "Harrisburg", lat: 41.2033, lng: -77.1945 }
  ],
  
  "Canada": [
    { name: "Ontario", capital: "Toronto", lat: 51.2538, lng: -85.3232 },
    { name: "Quebec", capital: "Quebec City", lat: 53.9113, lng: -68.7436 },
    { name: "British Columbia", capital: "Victoria", lat: 53.7267, lng: -127.6476 },
    { name: "Alberta", capital: "Edmonton", lat: 53.9333, lng: -116.5765 }
  ],
  
  "Australia": [
    { name: "New South Wales", capital: "Sydney", lat: -31.2532, lng: 146.9211 },
    { name: "Victoria", capital: "Melbourne", lat: -36.5986, lng: 144.6780 },
    { name: "Queensland", capital: "Brisbane", lat: -20.7256, lng: 142.7309 },
    { name: "Western Australia", capital: "Perth", lat: -25.2744, lng: 133.7751 }
  ],
  
  "Alemanha": [
    { name: "Bavaria", capital: "Munich", lat: 49.0134, lng: 10.9916 },
    { name: "Baden-Württemberg", capital: "Stuttgart", lat: 48.6616, lng: 9.3501 },
    { name: "North Rhine-Westphalia", capital: "Düsseldorf", lat: 51.4332, lng: 7.6616 }
  ]
};

let stats = {
  countries_found: 0,
  states_inserted: 0,
  states_skipped: 0,
  states_failed: 0
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function adicionarEstados() {
  console.log('🚀 ADICIONANDO ESTADOS - OPERAÇÃO RELÂMPAGO');
  console.log('🙏 EM NOME DE JESUS!');
  console.log('='.repeat(50));
  
  for (const [countryName, states] of Object.entries(STATES_BY_COUNTRY)) {
    console.log(`\\n📍 Processando: ${countryName}`);
    
    // Buscar país exato
    const { data: country } = await supabase
      .from('spiritual_regions')
      .select('id, name')
      .eq('region_type', 'country')
      .eq('name', countryName)
      .single();
    
    if (!country) {
      console.log(`❌ País não encontrado: ${countryName}`);
      continue;
    }
    
    console.log(`✅ País encontrado: ${country.name} (ID: ${country.id})`);
    stats.countries_found++;
    
    for (const state of states) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id, name')
          .eq('region_type', 'state')
          .eq('parent_id', country.id)
          .ilike('name', `%${state.name}%`);
        
        if (existing && existing.length > 0) {
          console.log(`  ⏭️ ${state.name} já existe`);
          stats.states_skipped++;
          continue;
        }
        
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: state.name,
            region_type: 'state',
            parent_id: country.id,
            coordinates: { lat: state.lat, lng: state.lng },
            country_code: countryName === "United States" ? "USA" : 
                         countryName === "Canada" ? "CAN" : 
                         countryName === "Australia" ? "AUS" : "DEU",
            data_source: 'manual',
            status: 'approved'
          });
        
        if (error) {
          throw error;
        }
        
        console.log(`  🚀 ✅ ${state.name} CONQUISTADO!`);
        stats.states_inserted++;
        
      } catch (error) {
        console.error(`  ❌ ${state.name}: ${error.message}`);
        stats.states_failed++;
      }
      
      await delay(200); // Rate limiting
    }
  }
  
  console.log('\\n' + '='.repeat(50));
  console.log('🎉 OPERAÇÃO RELÂMPAGO COMPLETA!');
  console.log('='.repeat(50));
  console.log('📊 RESULTADOS:');
  console.log(`🌍 Países encontrados: ${stats.countries_found}`);
  console.log(`🏛️ Estados inseridos: ${stats.states_inserted}`);
  console.log(`⏭️ Estados pulados: ${stats.states_skipped}`);
  console.log(`❌ Estados com falha: ${stats.states_failed}`);
  console.log('\\n🙏 GLÓRIA A DEUS! REINO EXPANDIDO!');
  console.log('='.repeat(50));
}

// Executar
if (require.main === module) {
  adicionarEstados().then(() => {
    console.log('\\n✅ Operação concluída!');
    process.exit(0);
  });
}

module.exports = { adicionarEstados, stats };