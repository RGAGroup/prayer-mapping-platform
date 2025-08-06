// 🧪 TESTE DA EXPANSÃO - AMOSTRA PEQUENA
// Testando 3 países + 3 estados para validar

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

// 🧪 TESTE: Apenas 3 países pequenos
const TEST_COUNTRIES = [
  { name: "Monaco", code: "MCO", capital: "Monaco", lat: 43.7384, lng: 7.4246 },
  { name: "San Marino", code: "SMR", capital: "San Marino", lat: 43.9424, lng: 12.4578 },
  { name: "Vatican City", code: "VAT", capital: "Vatican City", lat: 41.9029, lng: 12.4534 }
];

// 🧪 TESTE: 3 estados da Alemanha
const TEST_STATES = {
  "DEU": [
    { name: "Bavaria", capital: "Munich", lat: 49.0134, lng: 10.9916 },
    { name: "Baden-Württemberg", capital: "Stuttgart", lat: 48.6616, lng: 9.3501 },
    { name: "Saxony", capital: "Dresden", lat: 51.1045, lng: 13.2017 }
  ]
};

let stats = {
  countries: { inserted: 0, skipped: 0, failed: 0 },
  states: { inserted: 0, skipped: 0, failed: 0 }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testeCountries() {
  console.log('🧪 TESTE - FASE 1: 3 PAÍSES');
  
  for (const country of TEST_COUNTRIES) {
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'country')
        .or(`name.eq.${country.name},name.ilike.%${country.name}%`);
      
      if (existing && existing.length > 0) {
        console.log(`⏭️  ${country.name} já existe: ${existing[0].name}`);
        stats.countries.skipped++;
        continue;
      }
      
      const { error } = await supabase
        .from('spiritual_regions')
        .insert({
          name: country.name,
          region_type: 'country',
          coordinates: { lat: country.lat, lng: country.lng },
          country_code: country.code,
          data_source: 'manual',
          status: 'approved'
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`🚀 ✅ ${country.name} INSERIDO!`);
      stats.countries.inserted++;
      
    } catch (error) {
      console.error(`❌ ${country.name}: ${error.message}`);
      stats.countries.failed++;
    }
    
    await delay(300);
  }
}

async function testeStates() {
  console.log('\\n🧪 TESTE - FASE 2: 3 ESTADOS DA ALEMANHA');
  
  // Buscar Alemanha
  const { data: germany } = await supabase
    .from('spiritual_regions')
    .select('id, name')
    .eq('region_type', 'country')
    .or('name.ilike.%Germany%,name.ilike.%Alemanha%')
    .limit(1)
    .single();
  
  if (!germany) {
    console.log('❌ Alemanha não encontrada no banco');
    return;
  }
  
  console.log(`🔗 País pai: ${germany.name} (ID: ${germany.id})`);
  
  const states = TEST_STATES["DEU"];
  
  for (const state of states) {
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'state')
        .eq('parent_id', germany.id)
        .ilike('name', `%${state.name}%`);
      
      if (existing && existing.length > 0) {
        console.log(`  ⏭️ ${state.name} já existe`);
        stats.states.skipped++;
        continue;
      }
      
      const { error } = await supabase
        .from('spiritual_regions')
        .insert({
          name: state.name,
          region_type: 'state',
          parent_id: germany.id,
          coordinates: { lat: state.lat, lng: state.lng },
          country_code: "DEU",
          data_source: 'manual',
          status: 'approved'
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`  🚀 ✅ ${state.name} INSERIDO!`);
      stats.states.inserted++;
      
    } catch (error) {
      console.error(`  ❌ ${state.name}: ${error.message}`);
      stats.states.failed++;
    }
    
    await delay(300);
  }
}

async function testeCompleto() {
  console.log('🧪 TESTE DE EXPANSÃO - AMOSTRA PEQUENA');
  console.log('🙏 Testando validações antes da operação completa');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  try {
    await testeCountries();
    await testeStates();
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\\n' + '='.repeat(50));
    console.log('🧪 TESTE CONCLUÍDO!');
    console.log('='.repeat(50));
    console.log('📊 RESULTADOS:');
    console.log(`🌍 Países: ${stats.countries.inserted} inseridos, ${stats.countries.skipped} pulados, ${stats.countries.failed} falhas`);
    console.log(`🏛️ Estados: ${stats.states.inserted} inseridos, ${stats.states.skipped} pulados, ${stats.states.failed} falhas`);
    console.log(`⏱️ Tempo: ${totalTime}s`);
    
    if (stats.countries.failed === 0 && stats.states.failed === 0) {
      console.log('\\n✅ TESTE PASSOU! Sistema funcionando perfeitamente!');
      console.log('🚀 Pronto para expansão mundial completa!');
    } else {
      console.log('\\n⚠️ TESTE COM FALHAS! Verificar erros antes de continuar.');
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
if (require.main === module) {
  testeCompleto().then(() => {
    console.log('\\n✅ Teste finalizado!');
    process.exit(0);
  });
}

module.exports = { testeCompleto, stats };