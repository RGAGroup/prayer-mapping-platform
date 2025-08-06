// 🕵️ IDENTIFICAR PAÍSES DUPLICADOS
// Encontrar PT vs EN e decidir qual manter

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cxibuehwbuobwruhzwka.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4";

const supabase = createClient(supabaseUrl, supabaseKey);

// 🎯 MAPEAMENTO DE DUPLICATAS CONHECIDAS (PT vs EN)
const KNOWN_DUPLICATES = {
  // Português → Inglês (manter inglês)
  'Afeganistão': 'Afghanistan',
  'África do Sul': 'South Africa', 
  'Alemanha': 'Germany',
  'Arábia Saudita': 'Saudi Arabia',
  'Argentina': 'Argentina', // Mesmo nome
  'Austrália': 'Australia',
  'Áustria': 'Austria',
  'Bélgica': 'Belgium',
  'Brasil': 'Brazil',
  'Canadá': 'Canada', 
  'China': 'China', // Mesmo nome
  'Coreia do Sul': 'South Korea',
  'Coreia do Norte': 'North Korea',
  'Dinamarca': 'Denmark',
  'Egito': 'Egypt',
  'Emirados Árabes Unidos': 'United Arab Emirates',
  'Espanha': 'Spain',
  'Estados Unidos': 'United States',
  'Finlândia': 'Finland',
  'França': 'France',
  'Grécia': 'Greece',
  'Holanda': 'Netherlands',
  'Índia': 'India',
  'Indonésia': 'Indonesia',
  'Irã': 'Iran',
  'Iraque': 'Iraq',
  'Irlanda': 'Ireland',
  'Israel': 'Israel', // Mesmo nome
  'Itália': 'Italy',
  'Japão': 'Japan',
  'México': 'Mexico',
  'Noruega': 'Norway',
  'Polônia': 'Poland',
  'Portugal': 'Portugal', // Mesmo nome
  'Reino Unido': 'United Kingdom',
  'Rússia': 'Russia',
  'Suécia': 'Sweden',
  'Suíça': 'Switzerland',
  'Tailândia': 'Thailand',
  'Turquia': 'Turkey',
  'Ucrânia': 'Ukraine'
};

async function identificarDuplicatas() {
  console.log('🕵️ IDENTIFICAR PAÍSES DUPLICADOS');
  console.log('🎯 Buscando duplicatas PT vs EN');
  console.log('='.repeat(50));

  try {
    // Buscar todos os países
    const { data: allCountries, error } = await supabase
      .from('spiritual_regions')
      .select('id, name, spiritual_data, created_at, country_code')
      .eq('region_type', 'country')
      .order('name');

    if (error) {
      console.error('❌ Erro ao buscar países:', error);
      return;
    }

    console.log(`📊 TOTAL DE PAÍSES: ${allCountries.length}`);
    console.log('');

    const duplicatesFound = [];
    const toDelete = [];
    const toKeep = [];

    // Verificar duplicatas conhecidas
    for (const [portugues, ingles] of Object.entries(KNOWN_DUPLICATES)) {
      const ptCountry = allCountries.find(c => c.name === portugues);
      const enCountry = allCountries.find(c => c.name === ingles);

      if (ptCountry && enCountry) {
        console.log(`🔍 DUPLICATA ENCONTRADA:`);
        console.log(`  🇧🇷 PT: "${ptCountry.name}" (ID: ${ptCountry.id})`);
        console.log(`  🇺🇸 EN: "${enCountry.name}" (ID: ${enCountry.id})`);
        
        // Verificar qual tem mais dados espirituais
        const ptHasData = ptCountry.spiritual_data && Object.keys(ptCountry.spiritual_data).length > 0;
        const enHasData = enCountry.spiritual_data && Object.keys(enCountry.spiritual_data).length > 0;
        
        console.log(`  📊 PT tem dados: ${ptHasData ? 'SIM' : 'NÃO'}`);
        console.log(`  📊 EN tem dados: ${enHasData ? 'SIM' : 'NÃO'}`);

        // Verificar qual tem estados filhos
        const { data: ptStates } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('region_type', 'state')
          .eq('parent_id', ptCountry.id);

        const { data: enStates } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('region_type', 'state')
          .eq('parent_id', enCountry.id);

        const ptStatesCount = ptStates?.length || 0;
        const enStatesCount = enStates?.length || 0;

        console.log(`  🏛️ PT tem estados: ${ptStatesCount}`);
        console.log(`  🏛️ EN tem estados: ${enStatesCount}`);

        // DECISÃO: Manter o que tem mais valor (estados > dados espirituais > inglês)
        let keepCountry, deleteCountry, reason;

        if (enStatesCount > ptStatesCount) {
          keepCountry = enCountry;
          deleteCountry = ptCountry;
          reason = `EN tem mais estados (${enStatesCount} vs ${ptStatesCount})`;
        } else if (ptStatesCount > enStatesCount) {
          keepCountry = ptCountry;
          deleteCountry = enCountry;
          reason = `PT tem mais estados (${ptStatesCount} vs ${enStatesCount})`;
        } else if (enHasData && !ptHasData) {
          keepCountry = enCountry;
          deleteCountry = ptCountry;
          reason = 'EN tem dados espirituais';
        } else if (ptHasData && !enHasData) {
          keepCountry = ptCountry;
          deleteCountry = enCountry;
          reason = 'PT tem dados espirituais';
        } else {
          // Empate: preferir inglês
          keepCountry = enCountry;
          deleteCountry = ptCountry;
          reason = 'Preferência por inglês (padrão)';
        }

        console.log(`  ✅ MANTER: "${keepCountry.name}" - ${reason}`);
        console.log(`  ❌ DELETAR: "${deleteCountry.name}"`);
        console.log('');

        duplicatesFound.push({
          portuguese: ptCountry,
          english: enCountry,
          keep: keepCountry,
          delete: deleteCountry,
          reason
        });

        toKeep.push(keepCountry);
        toDelete.push(deleteCountry);
      }
    }

    // Buscar duplicatas por similaridade (não mapeadas)
    console.log('🔍 BUSCANDO OUTRAS POSSÍVEIS DUPLICATAS...');
    const unmappedDuplicates = [];
    
    for (let i = 0; i < allCountries.length; i++) {
      for (let j = i + 1; j < allCountries.length; j++) {
        const country1 = allCountries[i];
        const country2 = allCountries[j];
        
        // Verificar se são similares mas não estão no mapeamento conhecido
        const similarity = calculateSimilarity(country1.name, country2.name);
        
        if (similarity > 0.7 && !duplicatesFound.some(d => 
          (d.portuguese.id === country1.id || d.english.id === country1.id) ||
          (d.portuguese.id === country2.id || d.english.id === country2.id)
        )) {
          unmappedDuplicates.push({
            country1,
            country2,
            similarity: Math.round(similarity * 100)
          });
        }
      }
    }

    if (unmappedDuplicates.length > 0) {
      console.log('⚠️ POSSÍVEIS DUPLICATAS NÃO MAPEADAS:');
      unmappedDuplicates.slice(0, 10).forEach(dup => {
        console.log(`  📝 "${dup.country1.name}" vs "${dup.country2.name}" (${dup.similarity}% similar)`);
      });
      console.log('');
    }

    // RESUMO FINAL
    console.log('='.repeat(50));
    console.log('📊 RESUMO DE DUPLICATAS:');
    console.log(`🔍 Duplicatas encontradas: ${duplicatesFound.length}`);
    console.log(`✅ Para manter: ${toKeep.length}`);
    console.log(`❌ Para deletar: ${toDelete.length}`);
    console.log(`⚠️ Possíveis não mapeadas: ${unmappedDuplicates.length}`);
    console.log('');

    console.log('📋 LISTA DE DELEÇÕES:');
    toDelete.forEach(country => {
      console.log(`  ❌ ${country.name} (ID: ${country.id})`);
    });

    console.log('='.repeat(50));

    return {
      duplicatesFound,
      toDelete,
      toKeep,
      unmappedDuplicates,
      totalCountries: allCountries.length
    };

  } catch (error) {
    console.error('💥 Erro na identificação:', error);
  }
}

// Função para calcular similaridade entre strings
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Executar identificação
if (require.main === module) {
  identificarDuplicatas().then(() => {
    console.log('✅ Identificação concluída!');
    process.exit(0);
  });
}

module.exports = { identificarDuplicatas };