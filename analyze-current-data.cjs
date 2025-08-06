// 📊 ANÁLISE COMPLETA DOS DADOS ATUAIS
// Identifica gaps e define estratégia de expansão

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCurrentData() {
  console.log('📊 ANÁLISE COMPLETA DOS DADOS ATUAIS');
  console.log('='.repeat(60));

  try {
    // 1. CONTAGEM TOTAL
    const { data: allRegions, error } = await supabase
      .from('spiritual_regions')
      .select('name, region_type, parent_region_id, spiritual_data')
      .order('region_type, name');

    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
      return;
    }

    console.log(`📈 TOTAL DE REGIÕES: ${allRegions.length}`);
    console.log('');

    // 2. CONTAGEM POR TIPO
    const byType = allRegions.reduce((acc, region) => {
      acc[region.region_type] = (acc[region.region_type] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 DISTRIBUIÇÃO POR TIPO:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type.toUpperCase()}: ${count}`);
    });
    console.log('');

    // 3. PAÍSES COM DADOS ESPIRITUAIS
    const countries = allRegions.filter(r => r.region_type === 'country');
    const countriesWithData = countries.filter(r => r.spiritual_data && Object.keys(r.spiritual_data).length > 0);

    console.log('🌍 ANÁLISE DE PAÍSES:');
    console.log(`  Total de países: ${countries.length}`);
    console.log(`  Com dados espirituais: ${countriesWithData.length}`);
    console.log(`  Sem dados espirituais: ${countries.length - countriesWithData.length}`);
    console.log('');

    // 4. PAÍSES SEM DADOS ESPIRITUAIS
    const countriesWithoutData = countries.filter(r => !r.spiritual_data || Object.keys(r.spiritual_data).length === 0);
    if (countriesWithoutData.length > 0) {
      console.log('⚠️ PAÍSES SEM DADOS ESPIRITUAIS:');
      countriesWithoutData.slice(0, 10).forEach(country => {
        console.log(`  - ${country.name}`);
      });
      if (countriesWithoutData.length > 10) {
        console.log(`  ... e mais ${countriesWithoutData.length - 10} países`);
      }
      console.log('');
    }

    // 5. ANÁLISE DE ESTADOS/PROVÍNCIAS
    const states = allRegions.filter(r => r.region_type === 'state');
    console.log('🏛️ ANÁLISE DE ESTADOS/PROVÍNCIAS:');
    console.log(`  Total de estados: ${states.length}`);

    // Agrupar por país pai
    const statesByCountry = states.reduce((acc, state) => {
      const country = state.parent_region_id || 'Sem país pai';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    console.log('  Estados por país:');
    Object.entries(statesByCountry)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`    ${country}: ${count} estados`);
      });
    console.log('');

    // 6. PAÍSES SEM ESTADOS
    const countriesWithStates = Object.keys(statesByCountry);
    const countriesWithoutStates = countries.filter(c => !countriesWithStates.includes(c.name));

    console.log('🔍 PAÍSES SEM ESTADOS/PROVÍNCIAS CADASTRADOS:');
    console.log(`  Total: ${countriesWithoutStates.length} países`);
    countriesWithoutStates.slice(0, 15).forEach(country => {
      console.log(`  - ${country.name}`);
    });
    if (countriesWithoutStates.length > 15) {
      console.log(`  ... e mais ${countriesWithoutStates.length - 15} países`);
    }
    console.log('');

    // 7. ANÁLISE DE CIDADES
    const cities = allRegions.filter(r => r.region_type === 'city');
    console.log('🏙️ ANÁLISE DE CIDADES:');
    console.log(`  Total de cidades: ${cities.length}`);
    console.log('');

    // 8. SUGESTÕES DE EXPANSÃO
    console.log('🚀 ESTRATÉGIA DE EXPANSÃO RECOMENDADA:');
    console.log('');
    console.log('📋 PRIORIDADE 1 - PAÍSES FALTANTES:');
    console.log('  • Identificar países não cadastrados ainda');
    console.log('  • Focar em países importantes (G20, etc)');
    console.log('');
    console.log('📋 PRIORIDADE 2 - ESTADOS DE PAÍSES GRANDES:');
    console.log('  • Completar estados dos países principais:');
    
    const majorCountries = ['United States', 'China', 'Russia', 'Brazil', 'India', 'Canada', 'Australia'];
    majorCountries.forEach(country => {
      const stateCount = statesByCountry[country] || 0;
      console.log(`    - ${country}: ${stateCount} estados cadastrados`);
    });
    console.log('');
    console.log('📋 PRIORIDADE 3 - CIDADES PRINCIPAIS:');
    console.log('  • Adicionar capitais mundiais');
    console.log('  • Cidades com mais de 1 milhão de habitantes');
    console.log('  • Centros espirituais importantes');
    console.log('');

    // 9. RESUMO FINAL
    console.log('='.repeat(60));
    console.log('📊 RESUMO EXECUTIVO:');
    console.log(`  🌍 Total atual: ${allRegions.length} regiões`);
    console.log(`  🗺️ Países: ${countries.length} (${countriesWithData.length} com dados)`);
    console.log(`  🏛️ Estados: ${states.length}`);
    console.log(`  🏙️ Cidades: ${cities.length}`);
    console.log(`  📈 Potencial expansão: ~${countriesWithoutStates.length * 10} novos estados`);
    console.log(`  🎯 Meta final: ~2000+ regiões`);
    console.log('='.repeat(60));

    return {
      totalRegions: allRegions.length,
      countries: countries.length,
      states: states.length, 
      cities: cities.length,
      countriesWithoutStates: countriesWithoutStates.length,
      expansionPotential: countriesWithoutStates.length * 10
    };

  } catch (error) {
    console.error('💥 Erro na análise:', error);
  }
}

// Executar análise
analyzeCurrentData().then(() => {
  console.log('✅ Análise concluída!');
  process.exit(0);
});