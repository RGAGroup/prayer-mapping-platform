const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarStatus() {
  console.log('🌍 VERIFICANDO STATUS DO PROJETO...');
  console.log('='.repeat(50));
  
  try {
    // Contar por tipo
    const { data: countries } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'country');
    
    const { data: states } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'state');
    
    const { data: cities } = await supabase
      .from('spiritual_regions')
      .select('id, name, country_code')
      .eq('region_type', 'city');
    
    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log(`🌍 Países: ${countries?.length || 0}`);
    console.log(`🏛️ Estados: ${states?.length || 0}`);
    console.log(`🏙️ Cidades: ${cities?.length || 0}`);
    console.log(`📈 Total: ${(countries?.length || 0) + (states?.length || 0) + (cities?.length || 0)}`);
    
    // Análise por continente (amostra)
    console.log('\n🌎 AMOSTRA POR REGIÃO:');
    
    // América do Sul
    const southAmerica = countries?.filter(c => 
      ['BRA', 'ARG', 'CHL', 'PER', 'COL', 'VEN', 'ECU', 'BOL', 'URY', 'PRY', 'GUY', 'SUR'].includes(c.country_code)
    );
    console.log(`🇧🇷 América do Sul: ${southAmerica?.length || 0} países`);
    
    // Ásia (amostra)
    const asia = countries?.filter(c => 
      ['CHN', 'IND', 'JPN', 'KOR', 'IDN', 'THA', 'VNM', 'MYS', 'SGP', 'PHL'].includes(c.country_code)
    );
    console.log(`🏯 Ásia (amostra): ${asia?.length || 0} países`);
    
    // Europa (amostra)  
    const europe = countries?.filter(c => 
      ['RUS', 'TUR', 'DEU', 'FRA', 'GBR', 'ITA', 'ESP', 'POL', 'UKR'].includes(c.country_code)
    );
    console.log(`🏰 Europa (amostra): ${europe?.length || 0} países`);
    
    // Estados por país
    console.log('\n🏛️ ESTADOS POR PAÍS:');
    const statesByCountry = {};
    states?.forEach(state => {
      statesByCountry[state.country_code] = (statesByCountry[state.country_code] || 0) + 1;
    });
    
    Object.entries(statesByCountry)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([code, count]) => {
        console.log(`  ${code}: ${count} estados`);
      });
    
    // Cidades por país
    console.log('\n🏙️ CIDADES POR PAÍS:');
    const citiesByCountry = {};
    cities?.forEach(city => {
      citiesByCountry[city.country_code] = (citiesByCountry[city.country_code] || 0) + 1;
    });
    
    Object.entries(citiesByCountry)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([code, count]) => {
        console.log(`  ${code}: ${count} cidades`);
      });
    
    // Verificar hierarquia Brasil
    console.log('\n🇧🇷 ESTRUTURA BRASIL:');
    const { data: brazil } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('country_code', 'BRA')
      .eq('region_type', 'country')
      .single();
    
    if (brazil) {
      const { data: brazilStates } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('parent_id', brazil.id);
      
      const { data: brazilCities } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('country_code', 'BRA')
        .eq('region_type', 'city');
      
      console.log(`  Estados: ${brazilStates?.length || 0}`);
      console.log(`  Cidades: ${brazilCities?.length || 0}`);
    }
    
    // Verificar hierarquia EUA
    console.log('\n🇺🇸 ESTRUTURA EUA:');
    const { data: usa } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('country_code', 'US')
      .eq('region_type', 'country')
      .single();
    
    if (usa) {
      const { data: usaStates } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('parent_id', usa.id);
      
      const { data: usaCities } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('country_code', 'US')
        .eq('region_type', 'city');
      
      console.log(`  Estados: ${usaStates?.length || 0}`);
      console.log(`  Cidades: ${usaCities?.length || 0}`);
    }
    
    console.log('\n🎯 PRÓXIMOS ALVOS SUGERIDOS:');
    console.log('1. 🇨🇳 China - 34 províncias');
    console.log('2. 🇮🇳 Índia - 28 estados');  
    console.log('3. 🇷🇺 Rússia - 85 regiões');
    console.log('4. 🇨🇦 Canadá - 13 províncias/territórios');
    console.log('5. 🇦🇺 Austrália - 8 estados/territórios');
    
    console.log('\n✅ STATUS: PRONTO PARA PRÓXIMA FASE!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
}

verificarStatus().catch(console.error); 