// 🌍 MEGA EXPANSÃO MUNDIAL COMPLETA - SISTEMA ATALAIA
// Populando TODOS os países, estados e principais cidades do mundo
// Para completar nossa base de dados de intercessão global

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bkqsovllxcjujmfhkqyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcXNvdmxseGNqdWptZmhrcXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5ODI2NDksImV4cCI6MjAzNDU1ODY0OX0.rnFhudILZQcNJpglxfHuH_yOB7zb8laaODpH4xShj4I';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🌍 MEGA EXPANSÃO MUNDIAL COMPLETA - SISTEMA ATALAIA');
console.log('🙏 Para que TODA a Terra seja coberta em oração!');
console.log('='.repeat(70));

// ========================================================================================
// 📍 FASE 1: PAÍSES FALTANTES (Pequenas ilhas, territórios, países menores)
// ========================================================================================

const countriesFaltantes = [
  // CARIBE E ILHAS ATLÂNTICAS
  { name: 'Anguilla', country_code: 'AI', lat: 18.2206, lng: -63.0686, continent: 'Americas' },
  { name: 'Montserrat', country_code: 'MS', lat: 16.7425, lng: -62.1874, continent: 'Americas' },
  { name: 'Turks e Caicos', country_code: 'TC', lat: 21.7214, lng: -71.7371, continent: 'Americas' },
  { name: 'Ilhas Virgens Britânicas', country_code: 'VG', lat: 18.4207, lng: -64.6399, continent: 'Americas' },
  { name: 'Ilhas Virgens Americanas', country_code: 'VI', lat: 18.3358, lng: -64.8963, continent: 'Americas' },
  { name: 'Puerto Rico', country_code: 'PR', lat: 18.2208, lng: -66.5901, continent: 'Americas' },
  { name: 'Bermuda', country_code: 'BM', lat: 32.3199, lng: -64.7503, continent: 'Americas' },
  
  // PACÍFICO
  { name: 'Guam', country_code: 'GU', lat: 13.4443, lng: 144.7937, continent: 'Oceania' },
  { name: 'Samoa Americana', country_code: 'AS', lat: -14.2710, lng: -170.1322, continent: 'Oceania' },
  { name: 'Ilhas Cook', country_code: 'CK', lat: -21.2367, lng: -159.7777, continent: 'Oceania' },
  { name: 'Niue', country_code: 'NU', lat: -19.0544, lng: -169.8672, continent: 'Oceania' },
  { name: 'Tokelau', country_code: 'TK', lat: -8.9716, lng: -171.8548, continent: 'Oceania' },
  { name: 'Wallis e Futuna', country_code: 'WF', lat: -13.7687, lng: -177.1562, continent: 'Oceania' },
  { name: 'Nova Caledônia', country_code: 'NC', lat: -20.9043, lng: 165.6180, continent: 'Oceania' },
  { name: 'Polinésia Francesa', country_code: 'PF', lat: -17.6797, lng: -149.4068, continent: 'Oceania' },
  
  // ÁFRICA E OCEANO ÍNDICO
  { name: 'Mayotte', country_code: 'YT', lat: -12.8275, lng: 45.1662, continent: 'Africa' },
  { name: 'Reunião', country_code: 'RE', lat: -21.1351, lng: 55.2471, continent: 'Africa' },
  { name: 'Santa Helena', country_code: 'SH', lat: -15.9657, lng: -5.7179, continent: 'Africa' },
  
  // ÁRTICO
  { name: 'Groenlândia', country_code: 'GL', lat: 71.7069, lng: -42.6043, continent: 'Americas' },
  { name: 'Svalbard', country_code: 'SJ', lat: 77.5536, lng: 23.6703, continent: 'Europe' },
  { name: 'Ilhas Faroé', country_code: 'FO', lat: 61.8926, lng: -6.9118, continent: 'Europe' },
  
  // OUTROS TERRITÓRIOS
  { name: 'Gibraltar', country_code: 'GI', lat: 36.1408, lng: -5.3536, continent: 'Europe' },
  { name: 'Ilha de Man', country_code: 'IM', lat: 54.2361, lng: -4.5481, continent: 'Europe' },
  { name: 'Jersey', country_code: 'JE', lat: 49.2144, lng: -2.1312, continent: 'Europe' },
  { name: 'Guernsey', country_code: 'GG', lat: 49.4658, lng: -2.5854, continent: 'Europe' },
];

// ========================================================================================
// 🏛️ FASE 2: ESTADOS/PROVÍNCIAS FALTANTES DOS PRINCIPAIS PAÍSES
// ========================================================================================

const estadosFaltantes = {
  // 🇨🇦 CANADÁ - 10 Províncias + 3 Territórios
  'Canada': [
    { name: 'Ontario', capital: 'Toronto', lat: 51.2538, lng: -85.3232 },
    { name: 'Quebec', capital: 'Quebec City', lat: 53.9133, lng: -68.7437 },
    { name: 'Nova Scotia', capital: 'Halifax', lat: 44.6820, lng: -63.7443 },
    { name: 'New Brunswick', capital: 'Fredericton', lat: 46.5653, lng: -66.4619 },
    { name: 'Manitoba', capital: 'Winnipeg', lat: 56.4151, lng: -96.0810 },
    { name: 'British Columbia', capital: 'Victoria', lat: 53.7267, lng: -127.6476 },
    { name: 'Prince Edward Island', capital: 'Charlottetown', lat: 46.5107, lng: -63.4168 },
    { name: 'Saskatchewan', capital: 'Regina', lat: 52.9399, lng: -106.4509 },
    { name: 'Alberta', capital: 'Edmonton', lat: 53.9333, lng: -116.5765 },
    { name: 'Newfoundland and Labrador', capital: 'St. Johns', lat: 53.1355, lng: -57.6604 },
    { name: 'Northwest Territories', capital: 'Yellowknife', lat: 64.2823, lng: -110.8187 },
    { name: 'Yukon', capital: 'Whitehorse', lat: 64.0685, lng: -139.0686 },
    { name: 'Nunavut', capital: 'Iqaluit', lat: 70.2998, lng: -83.1076 }
  ],
  
  // 🇦🇺 AUSTRÁLIA - 6 Estados + 2 Territórios
  'Australia': [
    { name: 'New South Wales', capital: 'Sydney', lat: -31.2532, lng: 146.9211 },
    { name: 'Victoria', capital: 'Melbourne', lat: -36.5986, lng: 144.6780 },
    { name: 'Queensland', capital: 'Brisbane', lat: -22.7359, lng: 140.0188 },
    { name: 'Western Australia', capital: 'Perth', lat: -25.2744, lng: 123.7751 },
    { name: 'South Australia', capital: 'Adelaide', lat: -30.0002, lng: 136.2092 },
    { name: 'Tasmania', capital: 'Hobart', lat: -41.4332, lng: 145.5051 },
    { name: 'Northern Territory', capital: 'Darwin', lat: -19.4914, lng: 132.5510 },
    { name: 'Australian Capital Territory', capital: 'Canberra', lat: -35.4735, lng: 149.0124 }
  ],
  
  // 🇲🇽 MÉXICO - 32 Estados
  'Mexico': [
    { name: 'Aguascalientes', capital: 'Aguascalientes', lat: 21.8853, lng: -102.2916 },
    { name: 'Baja California', capital: 'Mexicali', lat: 30.8406, lng: -115.2838 },
    { name: 'Baja California Sur', capital: 'La Paz', lat: 24.1426, lng: -110.3128 },
    { name: 'Campeche', capital: 'Campeche', lat: 19.8301, lng: -90.5349 },
    { name: 'Chiapas', capital: 'Tuxtla Gutiérrez', lat: 16.7569, lng: -93.1292 },
    { name: 'Chihuahua', capital: 'Chihuahua', lat: 28.6329, lng: -106.0691 },
    { name: 'Coahuila', capital: 'Saltillo', lat: 27.0587, lng: -101.7068 },
    { name: 'Colima', capital: 'Colima', lat: 19.2452, lng: -103.7240 },
    { name: 'Durango', capital: 'Durango', lat: 24.5594, lng: -104.6591 },
    { name: 'Guanajuato', capital: 'Guanajuato', lat: 21.0190, lng: -101.2574 },
    { name: 'Guerrero', capital: 'Chilpancingo', lat: 17.7103, lng: -99.4757 },
    { name: 'Hidalgo', capital: 'Pachuca', lat: 20.0910, lng: -98.7624 },
    { name: 'Jalisco', capital: 'Guadalajara', lat: 20.5888, lng: -103.3496 },
    { name: 'Estado de México', capital: 'Toluca', lat: 19.2926, lng: -99.6557 },
    { name: 'Michoacán', capital: 'Morelia', lat: 19.5665, lng: -101.7068 },
    { name: 'Morelos', capital: 'Cuernavaca', lat: 18.9215, lng: -99.2337 },
    { name: 'Nayarit', capital: 'Tepic', lat: 21.5041, lng: -104.8942 },
    { name: 'Nuevo León', capital: 'Monterrey', lat: 25.5428, lng: -99.9019 },
    { name: 'Oaxaca', capital: 'Oaxaca', lat: 17.0732, lng: -96.7266 },
    { name: 'Puebla', capital: 'Puebla', lat: 19.0414, lng: -98.2063 },
    { name: 'Querétaro', capital: 'Querétaro', lat: 20.5888, lng: -100.3899 },
    { name: 'Quintana Roo', capital: 'Chetumal', lat: 19.8301, lng: -88.0280 },
    { name: 'San Luis Potosí', capital: 'San Luis Potosí', lat: 22.1565, lng: -100.9855 },
    { name: 'Sinaloa', capital: 'Culiacán', lat: 25.1721, lng: -107.4795 },
    { name: 'Sonora', capital: 'Hermosillo', lat: 29.0729, lng: -110.9559 },
    { name: 'Tabasco', capital: 'Villahermosa', lat: 17.9869, lng: -92.9303 },
    { name: 'Tamaulipas', capital: 'Ciudad Victoria', lat: 24.2928, lng: -99.1013 },
    { name: 'Tlaxcala', capital: 'Tlaxcala', lat: 19.3139, lng: -98.2404 },
    { name: 'Veracruz', capital: 'Xalapa', lat: 19.5438, lng: -96.9102 },
    { name: 'Yucatán', capital: 'Mérida', lat: 20.7099, lng: -89.0943 },
    { name: 'Zacatecas', capital: 'Zacatecas', lat: 22.7709, lng: -102.5832 },
    { name: 'Ciudad de México', capital: 'Ciudad de México', lat: 19.4326, lng: -99.1332 }
  ],
  
  // 🇫🇷 FRANÇA - 18 Regiões
  'France': [
    { name: 'Île-de-France', capital: 'Paris', lat: 48.8499, lng: 2.6370 },
    { name: 'Auvergne-Rhône-Alpes', capital: 'Lyon', lat: 45.3573, lng: 4.0728 },
    { name: 'Hauts-de-France', capital: 'Lille', lat: 50.4801, lng: 2.7931 },
    { name: 'Provence-Alpes-Côte d\'Azur', capital: 'Marseille', lat: 43.9351, lng: 6.0679 },
    { name: 'Grand Est', capital: 'Strasbourg', lat: 48.7100, lng: 6.2347 },
    { name: 'Occitanie', capital: 'Toulouse', lat: 43.8927, lng: 2.1972 },
    { name: 'Nouvelle-Aquitaine', capital: 'Bordeaux', lat: 45.3573, lng: -0.3340 },
    { name: 'Bretagne', capital: 'Rennes', lat: 48.0077, lng: -2.7888 },
    { name: 'Normandie', capital: 'Rouen', lat: 49.1815, lng: 0.3707 },
    { name: 'Pays de la Loire', capital: 'Nantes', lat: 47.7633, lng: -0.8560 },
    { name: 'Centre-Val de Loire', capital: 'Orléans', lat: 47.7516, lng: 1.9751 },
    { name: 'Bourgogne-Franche-Comté', capital: 'Dijon', lat: 47.1432, lng: 4.9419 },
    { name: 'Corse', capital: 'Ajaccio', lat: 42.0396, lng: 9.0129 }
  ],
  
  // 🇪🇸 ESPANHA - 17 Comunidades Autônomas
  'Spain': [
    { name: 'Andalucía', capital: 'Sevilla', lat: 37.3886, lng: -5.9823 },
    { name: 'Cataluña', capital: 'Barcelona', lat: 41.5912, lng: 1.5209 },
    { name: 'Madrid', capital: 'Madrid', lat: 40.4167, lng: -3.7033 },
    { name: 'Comunidad Valenciana', capital: 'Valencia', lat: 39.4697, lng: -0.3774 },
    { name: 'Galicia', capital: 'Santiago de Compostela', lat: 42.8782, lng: -8.5448 },
    { name: 'Castilla y León', capital: 'Valladolid', lat: 41.6521, lng: -4.7236 },
    { name: 'País Vasco', capital: 'Vitoria-Gasteiz', lat: 42.8473, lng: -2.6768 },
    { name: 'Castilla-La Mancha', capital: 'Toledo', lat: 39.8628, lng: -4.0273 },
    { name: 'Canarias', capital: 'Las Palmas', lat: 28.1248, lng: -15.4300 },
    { name: 'Región de Murcia', capital: 'Murcia', lat: 37.9922, lng: -1.1307 },
    { name: 'Aragón', capital: 'Zaragoza', lat: 41.6563, lng: -0.8773 },
    { name: 'Extremadura', capital: 'Mérida', lat: 38.9165, lng: -6.3432 },
    { name: 'Illes Balears', capital: 'Palma', lat: 39.6953, lng: 2.9039 },
    { name: 'Asturias', capital: 'Oviedo', lat: 43.3614, lng: -5.8593 },
    { name: 'Navarra', capital: 'Pamplona', lat: 42.8169, lng: -1.6432 },
    { name: 'Cantabria', capital: 'Santander', lat: 43.4623, lng: -3.8099 },
    { name: 'La Rioja', capital: 'Logroño', lat: 42.4627, lng: -2.4449 }
  ],
  
  // 🇮🇹 ITÁLIA - 20 Regiões
  'Italy': [
    { name: 'Lombardia', capital: 'Milano', lat: 45.6495, lng: 9.8773 },
    { name: 'Lazio', capital: 'Roma', lat: 41.8905, lng: 12.4942 },
    { name: 'Campania', capital: 'Napoli', lat: 40.8358, lng: 14.2488 },
    { name: 'Sicilia', capital: 'Palermo', lat: 37.5079, lng: 14.0934 },
    { name: 'Veneto', capital: 'Venezia', lat: 45.4398, lng: 12.3318 },
    { name: 'Emilia-Romagna', capital: 'Bologna', lat: 44.4056, lng: 11.2423 },
    { name: 'Piemonte', capital: 'Torino', lat: 45.0703, lng: 7.6869 },
    { name: 'Puglia', capital: 'Bari', lat: 41.1258, lng: 16.8620 },
    { name: 'Toscana', capital: 'Firenze', lat: 43.7799, lng: 11.2463 },
    { name: 'Calabria', capital: 'Catanzaro', lat: 38.9072, lng: 16.5947 },
    { name: 'Sardegna', capital: 'Cagliari', lat: 39.2238, lng: 9.1217 },
    { name: 'Liguria', capital: 'Genova', lat: 44.4264, lng: 8.8543 },
    { name: 'Marche', capital: 'Ancona', lat: 43.6158, lng: 13.5189 },
    { name: 'Abruzzo', capital: 'LAquila', lat: 42.3499, lng: 13.3995 },
    { name: 'Friuli-Venezia Giulia', capital: 'Trieste', lat: 45.8131, lng: 13.2417 },
    { name: 'Trentino-Alto Adige', capital: 'Trento', lat: 46.0679, lng: 11.1210 },
    { name: 'Umbria', capital: 'Perugia', lat: 43.1122, lng: 12.3888 },
    { name: 'Basilicata', capital: 'Potenza', lat: 40.6389, lng: 15.8061 },
    { name: 'Molise', capital: 'Campobasso', lat: 41.5594, lng: 14.6681 },
    { name: 'Valle d\'Aosta', capital: 'Aosta', lat: 45.7383, lng: 7.3207 }
  ]
};

// ========================================================================================
// 🏙️ FASE 3: PRINCIPAIS CIDADES POR REGIÃO (Capitais + Cidades >500k habitantes)
// ========================================================================================

const cidadesPrincipais = {
  // 🇧🇷 BRASIL - Principais cidades por estado
  'São Paulo': [
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 12300000 },
    { name: 'Guarulhos', lat: -23.4627, lng: -46.5333, population: 1400000 },
    { name: 'Campinas', lat: -22.9071, lng: -47.0631, population: 1200000 },
    { name: 'São Bernardo do Campo', lat: -23.6914, lng: -46.5646, population: 850000 },
    { name: 'Santo André', lat: -23.6544, lng: -46.5311, population: 720000 },
    { name: 'Osasco', lat: -23.5329, lng: -46.7916, population: 700000 }
  ],
  
  'Rio de Janeiro': [
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 6700000 },
    { name: 'São Gonçalo', lat: -22.8267, lng: -43.0537, population: 1100000 },
    { name: 'Duque de Caxias', lat: -22.7856, lng: -43.3117, population: 920000 },
    { name: 'Nova Iguaçu', lat: -22.7592, lng: -43.4511, population: 820000 }
  ],
  
  'Minas Gerais': [
    { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, population: 2500000 },
    { name: 'Uberlândia', lat: -18.9113, lng: -48.2622, population: 700000 },
    { name: 'Contagem', lat: -19.9320, lng: -44.0537, population: 670000 },
    { name: 'Juiz de Fora', lat: -21.7642, lng: -43.3467, population: 560000 }
  ],
  
  // 🇺🇸 EUA - Principais cidades por estado
  'California': [
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, population: 4000000 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611, population: 1400000 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863, population: 1030000 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194, population: 880000 },
    { name: 'Fresno', lat: 36.7468, lng: -119.7725, population: 540000 },
    { name: 'Sacramento', lat: 38.5816, lng: -121.4944, population: 510000 }
  ],
  
  'Texas': [
    { name: 'Houston', lat: 29.7604, lng: -95.3698, population: 2300000 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936, population: 1500000 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970, population: 1300000 },
    { name: 'Austin', lat: 30.2672, lng: -97.7431, population: 980000 },
    { name: 'Fort Worth', lat: 32.7555, lng: -97.3308, population: 920000 }
  ],
  
  'New York': [
    { name: 'New York City', lat: 40.7128, lng: -74.0060, population: 8400000 },
    { name: 'Buffalo', lat: 42.8864, lng: -78.8784, population: 260000 },
    { name: 'Rochester', lat: 43.1566, lng: -77.6088, population: 210000 },
    { name: 'Yonkers', lat: 40.9312, lng: -73.8988, population: 200000 }
  ],
  
  // 🇨🇳 CHINA - Principais cidades por província
  'Guangdong': [
    { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, population: 15000000 },
    { name: 'Shenzhen', lat: 22.5431, lng: 114.0579, population: 13000000 },
    { name: 'Dongguan', lat: 23.0209, lng: 113.7518, population: 8300000 },
    { name: 'Foshan', lat: 23.0218, lng: 113.1063, population: 7200000 }
  ],
  
  'Shandong': [
    { name: 'Jinan', lat: 36.6512, lng: 117.1201, population: 7000000 },
    { name: 'Qingdao', lat: 36.0671, lng: 120.3826, population: 9500000 },
    { name: 'Yantai', lat: 37.4638, lng: 121.4478, population: 7000000 }
  ],
  
  // 🇮🇳 ÍNDIA - Principais cidades por estado
  'Maharashtra': [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 20400000 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, population: 3100000 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882, population: 2500000 }
  ],
  
  'Uttar Pradesh': [
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462, population: 2900000 },
    { name: 'Kanpur', lat: 26.4499, lng: 80.3319, population: 2800000 },
    { name: 'Agra', lat: 27.1767, lng: 78.0081, population: 1700000 },
    { name: 'Varanasi', lat: 25.3176, lng: 82.9739, population: 1200000 }
  ]
};

// ========================================================================================
// 🚀 FUNÇÕES DE EXECUÇÃO
// ========================================================================================

async function insertCountries() {
  console.log('\\n📍 FASE 1: Inserindo países faltantes...');
  
  for (const country of countriesFaltantes) {
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('name', country.name)
        .eq('region_type', 'country')
        .single();
      
      if (existing) {
        console.log(`  ⏭️ ${country.name} já existe`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('spiritual_regions')
        .insert({
          name: country.name,
          region_type: 'country',
          country_code: country.country_code,
          coordinates: { lat: country.lat, lng: country.lng },
          data_source: 'manual',
          status: 'active'
        })
        .select();
      
      if (error) {
        console.error(`  ❌ Erro ao inserir ${country.name}:`, error.message);
      } else {
        console.log(`  ✅ ${country.name} inserido com sucesso`);
      }
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Erro em ${country.name}:`, error.message);
    }
  }
}

async function insertStates() {
  console.log('\\n🏛️ FASE 2: Inserindo estados/províncias faltantes...');
  
  for (const [countryName, states] of Object.entries(estadosFaltantes)) {
    console.log(`\\n  🌍 Processando ${countryName}...`);
    
    // Buscar o país
    const { data: country } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('name', countryName)
      .eq('region_type', 'country')
      .single();
    
    if (!country) {
      console.log(`    ⚠️ País ${countryName} não encontrado`);
      continue;
    }
    
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
          console.log(`    ⏭️ ${state.name} já existe`);
          continue;
        }
        
        const { data, error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: state.name,
            region_type: 'state',
            parent_id: country.id,
            coordinates: { lat: state.lat, lng: state.lng },
            data_source: 'manual',
            status: 'active'
          })
          .select();
        
        if (error) {
          console.error(`    ❌ Erro ao inserir ${state.name}:`, error.message);
        } else {
          console.log(`    ✅ ${state.name} inserido`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`    ❌ Erro em ${state.name}:`, error.message);
      }
    }
  }
}

async function insertCities() {
  console.log('\\n🏙️ FASE 3: Inserindo principais cidades...');
  
  for (const [stateName, cities] of Object.entries(cidadesPrincipais)) {
    console.log(`\\n  🏛️ Processando ${stateName}...`);
    
    // Buscar o estado
    const { data: state } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('name', stateName)
      .eq('region_type', 'state')
      .single();
    
    if (!state) {
      console.log(`    ⚠️ Estado ${stateName} não encontrado`);
      continue;
    }
    
    for (const city of cities) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', city.name)
          .eq('region_type', 'city')
          .eq('parent_id', state.id)
          .single();
        
        if (existing) {
          console.log(`    ⏭️ ${city.name} já existe`);
          continue;
        }
        
        const { data, error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: city.name,
            region_type: 'city',
            parent_id: state.id,
            coordinates: { lat: city.lat, lng: city.lng },
            data_source: 'manual',
            status: 'active'
          })
          .select();
        
        if (error) {
          console.error(`    ❌ Erro ao inserir ${city.name}:`, error.message);
        } else {
          console.log(`    ✅ ${city.name} inserido (${city.population?.toLocaleString()} hab)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`    ❌ Erro em ${city.name}:`, error.message);
      }
    }
  }
}

async function showFinalStats() {
  console.log('\\n📊 ESTATÍSTICAS FINAIS:');
  console.log('='.repeat(50));
  
  try {
    const { data: regions } = await supabase
      .from('spiritual_regions')
      .select('region_type');
    
    const counts = regions.reduce((acc, r) => {
      acc[r.region_type] = (acc[r.region_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`🌍 Países: ${counts.country || 0}`);
    console.log(`🏛️ Estados: ${counts.state || 0}`);
    console.log(`🏙️ Cidades: ${counts.city || 0}`);
    console.log(`📍 TOTAL: ${regions.length} regiões`);
    
    console.log('\\n🙏 EXPANSÃO MUNDIAL CONCLUÍDA!');
    console.log('✨ O Sistema Atalaia agora cobre todo o planeta!');
    console.log('🌍 Que a Terra toda seja coberta em oração!');
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
  }
}

// ========================================================================================
// 🚀 EXECUÇÃO PRINCIPAL
// ========================================================================================

async function megaExpansaoMundial() {
  try {
    await insertCountries();
    await insertStates();
    await insertCities();
    await showFinalStats();
    
    console.log('\\n🎯 MEGA EXPANSÃO MUNDIAL COMPLETA!');
    console.log('🙏 TODA HONRA E GLÓRIA A DEUS!');
    
  } catch (error) {
    console.error('❌ Erro na mega expansão:', error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  megaExpansaoMundial();
}

module.exports = { megaExpansaoMundial };