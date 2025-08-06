// 🌍 ANÁLISE COMPLETA DE COBERTURA DO BANCO DE DADOS
// Verificando o que temos e o que ainda falta para população total

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bkqsovllxcjujmfhkqyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcXNvdmxseGNqdWptZmhrcXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5ODI2NDksImV4cCI6MjAzNDU1ODY0OX0.rnFhudILZQcNJpglxfHuH_yOB7zb8laaODpH4xShj4I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCompleteCoverage() {
  console.log('🌍 ANÁLISE COMPLETA DE COBERTURA - SISTEMA ATALAIA');
  console.log('=' .repeat(70));

  try {
    // 1. ESTATÍSTICAS GERAIS
    const { data: allRegions, error: statsError } = await supabase
      .from('spiritual_regions')
      .select('id, name, region_type, parent_id, country_code, spiritual_data')
      .order('region_type', { ascending: true });

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
      return;
    }

    const countries = allRegions.filter(r => r.region_type === 'country');
    const states = allRegions.filter(r => r.region_type === 'state');
    const cities = allRegions.filter(r => r.region_type === 'city');

    console.log('📊 ESTATÍSTICAS ATUAIS:');
    console.log(`🌍 Países: ${countries.length}`);
    console.log(`🏛️ Estados/Províncias: ${states.length}`);
    console.log(`🏙️ Cidades/Municípios: ${cities.length}`);
    console.log(`📍 TOTAL: ${allRegions.length} regiões`);

    // 2. ANÁLISE DE PAÍSES POR CONTINENTE
    console.log('\\n🌍 ANÁLISE DE PAÍSES POR CONTINENTE:');
    
    const countriesByContinent = {
      'África': countries.filter(c => ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'].includes(c.country_code)),
      'Ásia': countries.filter(c => ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CY', 'GE', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KW', 'KG', 'LA', 'LB', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'KR', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'].includes(c.country_code)),
      'Europa': countries.filter(c => ['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'XK', 'LV', 'LI', 'LT', 'LU', 'MK', 'MT', 'MD', 'MC', 'ME', 'NL', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'UA', 'GB', 'VA'].includes(c.country_code)),
      'América do Norte': countries.filter(c => ['CA', 'US', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA'].includes(c.country_code)),
      'América do Sul': countries.filter(c => ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'].includes(c.country_code)),
      'Oceania': countries.filter(c => ['AU', 'FJ', 'KI', 'MH', 'FM', 'NR', 'NZ', 'PW', 'PG', 'WS', 'SB', 'TO', 'TV', 'VU'].includes(c.country_code)),
      'Caribe': countries.filter(c => ['AG', 'BS', 'BB', 'CU', 'DM', 'DO', 'GD', 'HT', 'JM', 'KN', 'LC', 'VC', 'TT'].includes(c.country_code))
    };

    Object.entries(countriesByContinent).forEach(([continent, countries]) => {
      console.log(`${continent}: ${countries.length} países`);
    });

    // 3. PAÍSES COM MAIS ESTADOS
    console.log('\\n🏛️ TOP 10 PAÍSES COM MAIS ESTADOS:');
    const statesByCountry = {};
    states.forEach(state => {
      const country = countries.find(c => c.id === state.parent_id);
      if (country) {
        statesByCountry[country.name] = (statesByCountry[country.name] || 0) + 1;
      }
    });

    const sortedStates = Object.entries(statesByCountry)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    sortedStates.forEach(([country, count], index) => {
      console.log(`${index + 1}. ${country}: ${count} estados`);
    });

    // 4. PAÍSES SEM ESTADOS
    console.log('\\n🚫 PAÍSES SEM ESTADOS/PROVÍNCIAS:');
    const countriesWithStates = new Set(states.map(s => s.parent_id));
    const countriesWithoutStates = countries.filter(c => !countriesWithStates.has(c.id));
    
    console.log(`Total de países sem estados: ${countriesWithoutStates.length}`);
    
    // Mostrar apenas os primeiros 20 para não poluir
    countriesWithoutStates.slice(0, 20).forEach(country => {
      console.log(`  • ${country.name} (${country.country_code})`);
    });
    
    if (countriesWithoutStates.length > 20) {
      console.log(`  ... e mais ${countriesWithoutStates.length - 20} países`);
    }

    // 5. ESTADOS SEM CIDADES
    console.log('\\n🏙️ ANÁLISE DE CIDADES:');
    const citiesByState = {};
    cities.forEach(city => {
      const state = states.find(s => s.id === city.parent_id);
      if (state) {
        citiesByState[state.name] = (citiesByState[state.name] || 0) + 1;
      }
    });

    const statesWithCities = Object.keys(citiesByState).length;
    const statesWithoutCities = states.length - statesWithCities;

    console.log(`Estados com cidades: ${statesWithCities}`);
    console.log(`Estados sem cidades: ${statesWithoutCities}`);

    // 6. DADOS ESPIRITUAIS
    console.log('\\n✨ ANÁLISE DE DADOS ESPIRITUAIS:');
    const regionsWithSpiritualData = allRegions.filter(r => 
      r.spiritual_data && 
      Object.keys(r.spiritual_data).length > 0 &&
      (r.spiritual_data.sistema_geopolitico_completo || 
       r.spiritual_data.alvos_intercessao_completo || 
       r.spiritual_data.outras_informacoes_importantes)
    );

    console.log(`Regiões com dados espirituais: ${regionsWithSpiritualData.length}/${allRegions.length}`);
    console.log(`Percentual de cobertura espiritual: ${((regionsWithSpiritualData.length / allRegions.length) * 100).toFixed(1)}%`);

    // 7. RECOMENDAÇÕES PARA EXPANSÃO
    console.log('\\n🚀 RECOMENDAÇÕES PARA EXPANSÃO COMPLETA:');
    console.log('=' .repeat(70));
    
    console.log('1. 📍 PAÍSES FALTANTES:');
    console.log('   • Pequenas ilhas do Pacífico e Caribe');
    console.log('   • Territórios dependentes (Groenlândia, Porto Rico, etc.)');
    console.log('   • Verificar se temos todos os 195 países reconhecidos pela ONU');
    
    console.log('\\n2. 🏛️ ESTADOS/PROVÍNCIAS FALTANTES:');
    console.log(`   • ${countriesWithoutStates.length} países ainda precisam de subdivisões`);
    console.log('   • Priorizar países grandes: Canadá, Austrália, México, etc.');
    
    console.log('\\n3. 🏙️ CIDADES/MUNICÍPIOS:');
    console.log(`   • ${statesWithoutCities} estados precisam de cidades`);
    console.log('   • Adicionar capitais estaduais obrigatoriamente');
    console.log('   • Adicionar cidades com >100k habitantes');
    
    console.log('\\n4. 📊 META FINAL ESTIMADA:');
    console.log('   • 📍 Países: ~200 (faltam ~' + (200 - countries.length) + ')');
    console.log('   • 🏛️ Estados: ~2.000 (faltam ~' + (2000 - states.length) + ')');
    console.log('   • 🏙️ Cidades: ~10.000 (faltam ~' + (10000 - cities.length) + ')');
    console.log('   • 🎯 TOTAL ESTIMADO: ~12.200 regiões');

    console.log('\\n🙏 PRÓXIMO PASSO: Criar mega script de população mundial completa!');
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }
}

analyzeCompleteCoverage();