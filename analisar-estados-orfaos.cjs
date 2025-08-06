// 🔍 ANÁLISE DOS ESTADOS ÓRFÃOS
// Identificar quais estados precisam de país pai

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function analisarEstadosOrfaos() {
  console.log('🔍 ANÁLISE DOS ESTADOS ÓRFÃOS');
  console.log('🎯 Identificando estados sem país pai');
  console.log('='.repeat(50));

  try {
    // Buscar todos os estados
    const { data: allStates, error } = await supabase
      .from('spiritual_regions')
      .select('id, name, region_type, parent_id, country_code')
      .eq('region_type', 'state')
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar estados:', error);
      return;
    }

    console.log(`📊 TOTAL DE ESTADOS: ${allStates.length}`);

    // Separar órfãos e com pais
    const orphanStates = allStates.filter(s => !s.parent_id);
    const linkedStates = allStates.filter(s => s.parent_id);

    console.log(`👨‍👩‍👧‍👦 Estados com país pai: ${linkedStates.length}`);
    console.log(`🚨 Estados órfãos: ${orphanStates.length}`);
    console.log('');

    // Agrupar órfãos por country_code
    const orphansByCountry = orphanStates.reduce((acc, state) => {
      const code = state.country_code || 'SEM_CODIGO';
      if (!acc[code]) acc[code] = [];
      acc[code].push(state);
      return acc;
    }, {});

    console.log('🏛️ ESTADOS ÓRFÃOS POR PAÍS:');
    Object.entries(orphansByCountry)
      .sort(([,a], [,b]) => b.length - a.length)
      .forEach(([code, states]) => {
        console.log(`  ${code}: ${states.length} estados`);
        if (states.length <= 5) {
          states.forEach(s => console.log(`    - ${s.name}`));
        } else {
          states.slice(0, 3).forEach(s => console.log(`    - ${s.name}`));
          console.log(`    ... e mais ${states.length - 3} estados`);
        }
      });

    console.log('');

    // Verificar se países correspondentes existem
    console.log('🌍 VERIFICANDO PAÍSES CORRESPONDENTES:');
    
    const countryMappings = {
      'USA': ['United States', 'Estados Unidos'],
      'BRA': ['Brazil', 'Brasil'], 
      'CAN': ['Canada'],
      'AUS': ['Australia', 'Austrália'],
      'CHN': ['China'],
      'RUS': ['Russia', 'Russian Federation', 'Rússia'],
      'IND': ['India', 'Índia'],
      'DEU': ['Germany', 'Alemanha'],
      'FRA': ['France', 'França'],
      'GBR': ['United Kingdom', 'Reino Unido'],
      'ITA': ['Italy', 'Itália'],
      'ESP': ['Spain', 'Espanha'],
      'SEM_CODIGO': ['Identificar manualmente']
    };

    for (const [code, possibleNames] of Object.entries(countryMappings)) {
      if (orphansByCountry[code]) {
        console.log(`\\n📍 ${code} (${orphansByCountry[code].length} estados órfãos):`);
        
        for (const name of possibleNames) {
          const { data: country } = await supabase
            .from('spiritual_regions')
            .select('id, name')
            .eq('region_type', 'country')
            .ilike('name', `%${name}%`)
            .limit(1);
          
          if (country && country.length > 0) {
            console.log(`  ✅ País encontrado: "${country[0].name}" (ID: ${country[0].id})`);
            break;
          } else {
            console.log(`  ❌ Não encontrado: "${name}"`);
          }
        }
      }
    }

    console.log('\\n' + '='.repeat(50));
    console.log('📋 RESUMO:');
    console.log(`🏛️ Total de estados: ${allStates.length}`);
    console.log(`✅ Com país pai: ${linkedStates.length}`);
    console.log(`🚨 Órfãos para corrigir: ${orphanStates.length}`);
    console.log(`📊 Países envolvidos: ${Object.keys(orphansByCountry).length}`);
    console.log('='.repeat(50));

    return {
      totalStates: allStates.length,
      linkedStates: linkedStates.length,
      orphanStates: orphanStates.length,
      orphansByCountry
    };

  } catch (error) {
    console.error('💥 Erro na análise:', error);
  }
}

// Executar análise
if (require.main === module) {
  analisarEstadosOrfaos().then(() => {
    console.log('\\n✅ Análise concluída!');
    process.exit(0);
  });
}

module.exports = { analisarEstadosOrfaos };