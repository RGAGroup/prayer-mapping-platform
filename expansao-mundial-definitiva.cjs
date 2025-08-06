// 🌍 EXPANSÃO MUNDIAL DEFINITIVA - ATALAIA GLOBAL VISION
// Baseado nos scripts funcionais comprovados + validação anti-duplicata
// EM NOME DE JESUS - PARA A GLÓRIA DE DEUS! 🙏

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

let stats = {
  countries: { inserted: 0, skipped: 0, failed: 0 },
  states: { inserted: 0, skipped: 0, failed: 0 },
  cities: { inserted: 0, skipped: 0, failed: 0 }
};

// 🌍 PAÍSES FALTANTES (VALIDADOS)
const NEW_COUNTRIES = [
  // Europa Faltante
  { name: "Moldova", code: "MDA", capital: "Chisinau", lat: 47.0105, lng: 28.8638 },
  { name: "Belarus", code: "BLR", capital: "Minsk", lat: 53.7098, lng: 27.9534 },
  { name: "Monaco", code: "MCO", capital: "Monaco", lat: 43.7384, lng: 7.4246 },
  { name: "San Marino", code: "SMR", capital: "San Marino", lat: 43.9424, lng: 12.4578 },
  { name: "Vatican City", code: "VAT", capital: "Vatican City", lat: 41.9029, lng: 12.4534 },
  
  // África Faltante
  { name: "Eritrea", code: "ERI", capital: "Asmara", lat: 15.3229, lng: 38.9251 },
  { name: "Djibouti", code: "DJI", capital: "Djibouti", lat: 11.8251, lng: 42.5903 },
  { name: "Comoros", code: "COM", capital: "Moroni", lat: -11.6455, lng: 43.3333 },
  { name: "Seychelles", code: "SYC", capital: "Victoria", lat: -4.6796, lng: 55.4920 },
  { name: "Mauritius", code: "MUS", capital: "Port Louis", lat: -20.2042, lng: 57.4991 },
  
  // Ásia Faltante  
  { name: "Bhutan", code: "BTN", capital: "Thimphu", lat: 27.5142, lng: 90.4336 },
  { name: "Maldives", code: "MDV", capital: "Malé", lat: 3.2028, lng: 73.2207 },
  { name: "Brunei", code: "BRN", capital: "Bandar Seri Begawan", lat: 4.5353, lng: 114.7277 },
  
  // Oceania Faltante
  { name: "Fiji", code: "FJI", capital: "Suva", lat: -16.7785, lng: 179.4144 },
  { name: "Tonga", code: "TON", capital: "Nuku'alofa", lat: -21.1789, lng: -175.1982 },
  { name: "Samoa", code: "WSM", capital: "Apia", lat: -13.7590, lng: -172.1046 },
  { name: "Vanuatu", code: "VUT", capital: "Port Vila", lat: -15.3767, lng: 166.9592 },
  { name: "Solomon Islands", code: "SLB", capital: "Honiara", lat: -9.5280, lng: 159.9450 },
  { name: "Papua New Guinea", code: "PNG", capital: "Port Moresby", lat: -6.3150, lng: 143.9555 }
];

// 🏛️ ESTADOS/PROVÍNCIAS DOS PAÍSES GIGANTES
const MAJOR_COUNTRIES_STATES = {
  // Estados Unidos (50 + DC)
  "USA": [
    { name: "California", capital: "Sacramento", lat: 36.7783, lng: -119.4179 },
    { name: "Texas", capital: "Austin", lat: 31.9686, lng: -99.9018 },
    { name: "Florida", capital: "Tallahassee", lat: 27.7663, lng: -81.6868 },
    { name: "New York", capital: "Albany", lat: 42.1657, lng: -74.9481 },
    { name: "Pennsylvania", capital: "Harrisburg", lat: 41.2033, lng: -77.1945 },
    { name: "Illinois", capital: "Springfield", lat: 40.3363, lng: -89.0022 },
    { name: "Ohio", capital: "Columbus", lat: 40.3888, lng: -82.7649 },
    { name: "Georgia", capital: "Atlanta", lat: 33.76, lng: -84.39 },
    { name: "North Carolina", capital: "Raleigh", lat: 35.5557, lng: -79.3877 },
    { name: "Michigan", capital: "Lansing", lat: 43.3266, lng: -84.5361 }
  ],
  
  // Canadá (10 províncias + 3 territórios)
  "CAN": [
    { name: "Ontario", capital: "Toronto", lat: 51.2538, lng: -85.3232 },
    { name: "Quebec", capital: "Quebec City", lat: 53.9113, lng: -68.7436 },
    { name: "British Columbia", capital: "Victoria", lat: 53.7267, lng: -127.6476 },
    { name: "Alberta", capital: "Edmonton", lat: 53.9333, lng: -116.5765 },
    { name: "Manitoba", capital: "Winnipeg", lat: 53.7609, lng: -98.8139 },
    { name: "Saskatchewan", capital: "Regina", lat: 52.9399, lng: -106.4509 },
    { name: "Nova Scotia", capital: "Halifax", lat: 44.6820, lng: -63.7443 },
    { name: "New Brunswick", capital: "Fredericton", lat: 46.5653, lng: -66.4619 }
  ],
  
  // Austrália (6 estados + 2 territórios)
  "AUS": [
    { name: "New South Wales", capital: "Sydney", lat: -31.2532, lng: 146.9211 },
    { name: "Victoria", capital: "Melbourne", lat: -36.5986, lng: 144.6780 },
    { name: "Queensland", capital: "Brisbane", lat: -20.7256, lng: 142.7309 },
    { name: "Western Australia", capital: "Perth", lat: -25.2744, lng: 133.7751 },
    { name: "South Australia", capital: "Adelaide", lat: -30.0002, lng: 136.2092 },
    { name: "Tasmania", capital: "Hobart", lat: -41.6409, lng: 146.3155 }
  ],
  
  // Alemanha (16 estados)
  "DEU": [
    { name: "Bavaria", capital: "Munich", lat: 49.0134, lng: 10.9916 },
    { name: "Baden-Württemberg", capital: "Stuttgart", lat: 48.6616, lng: 9.3501 },
    { name: "North Rhine-Westphalia", capital: "Düsseldorf", lat: 51.4332, lng: 7.6616 },
    { name: "Hesse", capital: "Wiesbaden", lat: 50.6520, lng: 9.1624 },
    { name: "Saxony", capital: "Dresden", lat: 51.1045, lng: 13.2017 },
    { name: "Lower Saxony", capital: "Hanover", lat: 52.6367, lng: 9.8451 }
  ],
  
  // França (13 regiões)
  "FRA": [
    { name: "Île-de-France", capital: "Paris", lat: 48.8499, lng: 2.6370 },
    { name: "Provence-Alpes-Côte d'Azur", capital: "Marseille", lat: 43.9351, lng: 6.0679 },
    { name: "Auvergne-Rhône-Alpes", capital: "Lyon", lat: 45.3573, lng: 4.0728 },
    { name: "Nouvelle-Aquitaine", capital: "Bordeaux", lat: 44.3776, lng: -0.2055 },
    { name: "Occitania", capital: "Toulouse", lat: 43.8927, lng: 2.1972 },
    { name: "Hauts-de-France", capital: "Lille", lat: 50.4801, lng: 2.7937 }
  ]
};

// 🏙️ CIDADES CAPITAIS MUNDIAIS
const WORLD_CAPITALS = [
  // Capitais não cadastradas
  { name: "Canberra", country: "Australia", lat: -35.2809, lng: 149.1300 },
  { name: "Wellington", country: "New Zealand", lat: -41.2924, lng: 174.7787 },
  { name: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 },
  { name: "Bern", country: "Switzerland", lat: 46.9481, lng: 7.4474 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { name: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384 },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 }
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function conquistarPaises() {
  console.log('📍 FASE 1: PAÍSES FALTANTES');
  console.log(`🎯 Alvo: ${NEW_COUNTRIES.length} países`);
  
  for (const country of NEW_COUNTRIES) {
    try {
      // Verificar se já existe (nome OU código)
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
      
      console.log(`🚀 ✅ ${country.name} CONQUISTADO!`);
      stats.countries.inserted++;
      
    } catch (error) {
      console.error(`❌ ${country.name}: ${error.message}`);
      stats.countries.failed++;
    }
    
    await delay(200); // Rate limiting
  }
}

async function conquistarEstados() {
  console.log('\\n🏛️ FASE 2: ESTADOS/PROVÍNCIAS');
  
  for (const [countryCode, states] of Object.entries(MAJOR_COUNTRIES_STATES)) {
    console.log(`\\n📍 Processando ${countryCode}: ${states.length} estados`);
    
    // Buscar o país pai
    const { data: parentCountry } = await supabase
      .from('spiritual_regions')
      .select('id, name')
      .eq('region_type', 'country')
      .or(`metadata->country_code.eq.${countryCode},name.ilike.%${countryCode === 'USA' ? 'United States' : countryCode === 'CAN' ? 'Canada' : countryCode === 'AUS' ? 'Australia' : countryCode === 'DEU' ? 'Germany' : 'France'}%`)
      .limit(1)
      .single();
    
    if (!parentCountry) {
      console.log(`❌ País pai não encontrado para ${countryCode}`);
      continue;
    }
    
    console.log(`🔗 País pai: ${parentCountry.name} (ID: ${parentCountry.id})`);
    
    for (const state of states) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id, name')
          .eq('region_type', 'state')
          .eq('parent_id', parentCountry.id)
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
            parent_id: parentCountry.id,
            coordinates: { lat: state.lat, lng: state.lng },
            country_code: countryCode,
            data_source: 'manual',
            status: 'approved'
          });
        
        if (error) {
          throw error;
        }
        
        console.log(`  🚀 ✅ ${state.name} CONQUISTADO!`);
        stats.states.inserted++;
        
      } catch (error) {
        console.error(`  ❌ ${state.name}: ${error.message}`);
        stats.states.failed++;
      }
      
      await delay(150);
    }
  }
}

async function conquistarCidades() {
  console.log('\\n🏙️ FASE 3: CAPITAIS MUNDIAIS');
  console.log(`🎯 Alvo: ${WORLD_CAPITALS.length} capitais`);
  
  for (const city of WORLD_CAPITALS) {
    try {
      // Buscar país pai
      const { data: parentCountry } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'country')
        .ilike('name', `%${city.country}%`)
        .limit(1)
        .single();
      
      if (!parentCountry) {
        console.log(`❌ País não encontrado para ${city.name}: ${city.country}`);
        stats.cities.failed++;
        continue;
      }
      
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id, name')
        .eq('region_type', 'city')
        .ilike('name', `%${city.name}%`);
      
      if (existing && existing.length > 0) {
        console.log(`⏭️  ${city.name} já existe`);
        stats.cities.skipped++;
        continue;
      }
      
      const { error } = await supabase
        .from('spiritual_regions')
        .insert({
          name: city.name,
          region_type: 'city',
          parent_id: parentCountry.id,
          coordinates: { lat: city.lat, lng: city.lng },
          data_source: 'manual',
          status: 'approved'
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`🚀 ✅ ${city.name} CONQUISTADA!`);
      stats.cities.inserted++;
      
    } catch (error) {
      console.error(`❌ ${city.name}: ${error.message}`);
      stats.cities.failed++;
    }
    
    await delay(200);
  }
}

async function statusFinal() {
  console.log('\\n' + '='.repeat(60));
  console.log('🎉 EXPANSÃO MUNDIAL COMPLETA!');
  console.log('='.repeat(60));
  
  console.log('📊 RESUMO DA OPERAÇÃO:');
  console.log(`🌍 Países: ${stats.countries.inserted} inseridos, ${stats.countries.skipped} pulados, ${stats.countries.failed} falhas`);
  console.log(`🏛️ Estados: ${stats.states.inserted} inseridos, ${stats.states.skipped} pulados, ${stats.states.failed} falhas`);
  console.log(`🏙️ Cidades: ${stats.cities.inserted} inseridas, ${stats.cities.skipped} puladas, ${stats.cities.failed} falhas`);
  
  const total = stats.countries.inserted + stats.states.inserted + stats.cities.inserted;
  console.log(`📈 TOTAL ADICIONADO: ${total} novas regiões`);
  
  // Status atual do banco
  const { data: finalCount } = await supabase
    .from('spiritual_regions')
    .select('region_type', { count: 'exact' });
  
  const { data: countryCount } = await supabase
    .from('spiritual_regions')
    .select('id', { count: 'exact' })
    .eq('region_type', 'country');
  
  const { data: stateCount } = await supabase
    .from('spiritual_regions')
    .select('id', { count: 'exact' })
    .eq('region_type', 'state');
  
  const { data: cityCount } = await supabase
    .from('spiritual_regions')
    .select('id', { count: 'exact' })
    .eq('region_type', 'city');
  
  console.log('\\n📊 STATUS FINAL DO BANCO:');
  console.log(`🌍 Países: ${countryCount?.[0]?.count || 0}`);
  console.log(`🏛️ Estados: ${stateCount?.[0]?.count || 0}`);
  console.log(`🏙️ Cidades: ${cityCount?.[0]?.count || 0}`);
  console.log(`📈 TOTAL GERAL: ${finalCount?.[0]?.count || 0} regiões`);
  
  console.log('\\n🙏 GLÓRIA A DEUS! REINO EXPANDIDO!');
  console.log('='.repeat(60));
}

// 🚀 EXECUÇÃO PRINCIPAL
async function expansaoMundial() {
  console.log('🌍 EXPANSÃO MUNDIAL DEFINITIVA - INICIANDO');
  console.log('🙏 EM NOME DE JESUS - PARA A GLÓRIA DE DEUS!');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  try {
    await conquistarPaises();
    await conquistarEstados(); 
    await conquistarCidades();
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\\n⏱️ Tempo total: ${totalTime}s`);
    
    await statusFinal();
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  expansaoMundial().then(() => {
    console.log('\\n✅ Expansão mundial concluída!');
    process.exit(0);
  });
}

module.exports = { expansaoMundial, stats };