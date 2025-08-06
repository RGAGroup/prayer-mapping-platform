// 🌍 EXPANSÃO INTELIGENTE - VERSÃO ROBUSTA
// Sistema mais inteligente que busca países pelos nomes existentes

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bkqsovllxcjujmfhkqyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcXNvdmxseGNqdWptZmhrcXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5ODI2NDksImV4cCI6MjAzNDU1ODY0OX0.rnFhudILZQcNJpglxfHuH_yOB7zb8laaODpH4xShj4I';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🌍 EXPANSÃO INTELIGENTE - SISTEMA ATALAIA');
console.log('🔍 Detectando países existentes e adicionando subdivisões');
console.log('='.repeat(60));

// MAPEAMENTO INTELIGENTE DE NOMES DE PAÍSES
const countryNameMapping = {
  // Nomes que podem estar no banco vs nomes que usamos no script
  'Canada': ['Canada', 'Canadá'],
  'Australia': ['Australia', 'Austrália'],
  'Mexico': ['Mexico', 'México'],
  'France': ['France', 'França'],
  'Spain': ['Spain', 'Espanha'],
  'Italy': ['Italy', 'Itália'],
  'Germany': ['Germany', 'Alemanha'],
  'United Kingdom': ['United Kingdom', 'Reino Unido', 'UK'],
  'United States': ['United States', 'Estados Unidos', 'USA', 'US'],
  'Brazil': ['Brazil', 'Brasil'],
  'Russia': ['Russia', 'Rússia', 'Russian Federation'],
  'China': ['China'],
  'India': ['India', 'Índia'],
  'Japan': ['Japan', 'Japão'],
  'South Korea': ['South Korea', 'Coreia do Sul'],
  'Netherlands': ['Netherlands', 'Holanda', 'Países Baixos'],
  'Switzerland': ['Switzerland', 'Suíça'],
  'Argentina': ['Argentina'],
  'Chile': ['Chile'],
  'Colombia': ['Colombia', 'Colômbia'],
  'Peru': ['Peru'],
  'Venezuela': ['Venezuela'],
  'Egypt': ['Egypt', 'Egito'],
  'South Africa': ['South Africa', 'África do Sul'],
  'Nigeria': ['Nigeria', 'Nigéria'],
  'Kenya': ['Kenya', 'Quênia'],
  'Morocco': ['Morocco', 'Marrocos'],
  'Turkey': ['Turkey', 'Turquia'],
  'Iran': ['Iran', 'Irã'],
  'Saudi Arabia': ['Saudi Arabia', 'Arábia Saudita'],
  'Israel': ['Israel'],
  'UAE': ['UAE', 'Emirados Árabes Unidos', 'United Arab Emirates'],
  'Thailand': ['Thailand', 'Tailândia'],
  'Vietnam': ['Vietnam', 'Vietnã'],
  'Philippines': ['Philippines', 'Filipinas'],
  'Indonesia': ['Indonesia', 'Indonésia'],
  'Malaysia': ['Malaysia', 'Malásia'],
  'Singapore': ['Singapore', 'Singapura'],
  'Pakistan': ['Pakistan', 'Paquistão'],
  'Bangladesh': ['Bangladesh'],
  'Sri Lanka': ['Sri Lanka'],
  'Myanmar': ['Myanmar'],
  'Cambodia': ['Cambodia', 'Camboja'],
  'Laos': ['Laos'],
  'Nepal': ['Nepal'],
  'Afghanistan': ['Afghanistan', 'Afeganistão'],
  'Kazakhstan': ['Kazakhstan', 'Cazaquistão'],
  'Uzbekistan': ['Uzbekistan', 'Uzbequistão'],
  'Ukraine': ['Ukraine', 'Ucrânia'],
  'Poland': ['Poland', 'Polônia'],
  'Czech Republic': ['Czech Republic', 'República Tcheca'],
  'Hungary': ['Hungary', 'Hungria'],
  'Romania': ['Romania', 'Romênia'],
  'Bulgaria': ['Bulgaria', 'Bulgária'],
  'Greece': ['Greece', 'Grécia'],
  'Portugal': ['Portugal'],
  'Belgium': ['Belgium', 'Bélgica'],
  'Austria': ['Austria', 'Áustria'],
  'Denmark': ['Denmark', 'Dinamarca'],
  'Sweden': ['Sweden', 'Suécia'],
  'Norway': ['Norway', 'Noruega'],
  'Finland': ['Finland', 'Finlândia'],
  'Ireland': ['Ireland', 'Irlanda'],
  'Iceland': ['Iceland', 'Islândia']
};

// ESTADOS PARA PAÍSES ESPECÍFICOS
const statesByCountry = {
  'Canada': [
    { name: 'Ontario', lat: 51.2538, lng: -85.3232 },
    { name: 'Quebec', lat: 53.9133, lng: -68.7437 },
    { name: 'British Columbia', lat: 53.7267, lng: -127.6476 },
    { name: 'Alberta', lat: 53.9333, lng: -116.5765 },
    { name: 'Manitoba', lat: 56.4151, lng: -96.0810 },
    { name: 'Saskatchewan', lat: 52.9399, lng: -106.4509 },
    { name: 'Nova Scotia', lat: 44.6820, lng: -63.7443 },
    { name: 'New Brunswick', lat: 46.5653, lng: -66.4619 },
    { name: 'Newfoundland and Labrador', lat: 53.1355, lng: -57.6604 },
    { name: 'Prince Edward Island', lat: 46.5107, lng: -63.4168 },
    { name: 'Northwest Territories', lat: 64.2823, lng: -110.8187 },
    { name: 'Yukon', lat: 64.0685, lng: -139.0686 },
    { name: 'Nunavut', lat: 70.2998, lng: -83.1076 }
  ],
  
  'Australia': [
    { name: 'New South Wales', lat: -31.2532, lng: 146.9211 },
    { name: 'Victoria', lat: -36.5986, lng: 144.6780 },
    { name: 'Queensland', lat: -22.7359, lng: 140.0188 },
    { name: 'Western Australia', lat: -25.2744, lng: 123.7751 },
    { name: 'South Australia', lat: -30.0002, lng: 136.2092 },
    { name: 'Tasmania', lat: -41.4332, lng: 145.5051 },
    { name: 'Northern Territory', lat: -19.4914, lng: 132.5510 },
    { name: 'Australian Capital Territory', lat: -35.4735, lng: 149.0124 }
  ],
  
  'Mexico': [
    { name: 'Aguascalientes', lat: 21.8853, lng: -102.2916 },
    { name: 'Baja California', lat: 30.8406, lng: -115.2838 },
    { name: 'Baja California Sur', lat: 24.1426, lng: -110.3128 },
    { name: 'Campeche', lat: 19.8301, lng: -90.5349 },
    { name: 'Chiapas', lat: 16.7569, lng: -93.1292 },
    { name: 'Chihuahua', lat: 28.6329, lng: -106.0691 },
    { name: 'Coahuila', lat: 27.0587, lng: -101.7068 },
    { name: 'Colima', lat: 19.2452, lng: -103.7240 },
    { name: 'Durango', lat: 24.5594, lng: -104.6591 },
    { name: 'Guanajuato', lat: 21.0190, lng: -101.2574 },
    { name: 'Guerrero', lat: 17.7103, lng: -99.4757 },
    { name: 'Hidalgo', lat: 20.0910, lng: -98.7624 },
    { name: 'Jalisco', lat: 20.5888, lng: -103.3496 },
    { name: 'Estado de México', lat: 19.2926, lng: -99.6557 },
    { name: 'Michoacán', lat: 19.5665, lng: -101.7068 },
    { name: 'Morelos', lat: 18.9215, lng: -99.2337 },
    { name: 'Nayarit', lat: 21.5041, lng: -104.8942 },
    { name: 'Nuevo León', lat: 25.5428, lng: -99.9019 },
    { name: 'Oaxaca', lat: 17.0732, lng: -96.7266 },
    { name: 'Puebla', lat: 19.0414, lng: -98.2063 },
    { name: 'Querétaro', lat: 20.5888, lng: -100.3899 },
    { name: 'Quintana Roo', lat: 19.8301, lng: -88.0280 },
    { name: 'San Luis Potosí', lat: 22.1565, lng: -100.9855 },
    { name: 'Sinaloa', lat: 25.1721, lng: -107.4795 },
    { name: 'Sonora', lat: 29.0729, lng: -110.9559 },
    { name: 'Tabasco', lat: 17.9869, lng: -92.9303 },
    { name: 'Tamaulipas', lat: 24.2928, lng: -99.1013 },
    { name: 'Tlaxcala', lat: 19.3139, lng: -98.2404 },
    { name: 'Veracruz', lat: 19.5438, lng: -96.9102 },
    { name: 'Yucatán', lat: 20.7099, lng: -89.0943 },
    { name: 'Zacatecas', lat: 22.7709, lng: -102.5832 },
    { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 }
  ]
};

async function findCountryByMultipleNames(possibleNames) {
  for (const name of possibleNames) {
    const { data } = await supabase
      .from('spiritual_regions')
      .select('id, name')
      .eq('region_type', 'country')
      .ilike('name', `%${name}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      return data[0];
    }
  }
  return null;
}

async function addStatesForCountry(countryKey) {
  console.log(`\\n🔍 Buscando país: ${countryKey}...`);
  
  const possibleNames = countryNameMapping[countryKey] || [countryKey];
  const country = await findCountryByMultipleNames(possibleNames);
  
  if (!country) {
    console.log(`  ⚠️ País não encontrado com nomes: ${possibleNames.join(', ')}`);
    return;
  }
  
  console.log(`  ✅ País encontrado: "${country.name}" (ID: ${country.id})`);
  
  const states = statesByCountry[countryKey];
  if (!states) {
    console.log(`  ⚠️ Nenhum estado definido para ${countryKey}`);
    return;
  }
  
  let inserted = 0;
  let skipped = 0;
  
  for (const state of states) {
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', state.name)
        .eq('region_type', 'state')
        .eq('parent_id', country.id)
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
          parent_id: country.id,
          coordinates: { lat: state.lat, lng: state.lng },
          data_source: 'manual',
          status: 'active'
        });
      
      if (error) {
        console.error(`    ❌ Erro ao inserir ${state.name}:`, error.message);
      } else {
        inserted++;
      }
      
      // Pequeno delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`    ❌ Erro em ${state.name}:`, error.message);
    }
  }
  
  console.log(`  📊 Resultado: ${inserted} inseridos, ${skipped} já existiam`);
}

async function showCurrentStats() {
  try {
    console.log('\\n📊 ESTATÍSTICAS ATUAIS:');
    console.log('-'.repeat(30));
    
    const { data: regions } = await supabase
      .from('spiritual_regions')
      .select('region_type');
    
    if (!regions) {
      console.log('❌ Não foi possível obter estatísticas');
      return;
    }
    
    const counts = regions.reduce((acc, r) => {
      acc[r.region_type] = (acc[r.region_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`🌍 Países: ${counts.country || 0}`);
    console.log(`🏛️ Estados: ${counts.state || 0}`);
    console.log(`🏙️ Cidades: ${counts.city || 0}`);
    console.log(`📍 TOTAL: ${regions.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error.message);
  }
}

async function expansaoInteligente() {
  try {
    await showCurrentStats();
    
    console.log('\\n🚀 INICIANDO EXPANSÃO INTELIGENTE...');
    
    // Processar os principais países
    const priorityCountries = ['Canada', 'Australia', 'Mexico'];
    
    for (const country of priorityCountries) {
      await addStatesForCountry(country);
    }
    
    console.log('\\n📊 ESTATÍSTICAS APÓS EXPANSÃO:');
    await showCurrentStats();
    
    console.log('\\n🎯 EXPANSÃO INTELIGENTE CONCLUÍDA!');
    console.log('🙏 Para a glória de Deus!');
    
  } catch (error) {
    console.error('❌ Erro na expansão:', error);
  }
}

if (require.main === module) {
  expansaoInteligente();
}

module.exports = { expansaoInteligente };