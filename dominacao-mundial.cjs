// 🌍 DOMINAÇÃO MUNDIAL - ATALAIA GLOBAL EXPANSION
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🌍 DADOS MUNDIAIS
const WORLD_DATA = {
  'South America': [
    { name: 'Argentina', code: 'ARG', capital: 'Buenos Aires', lat: -38.4161, lng: -63.6167 },
    { name: 'Chile', code: 'CHL', capital: 'Santiago', lat: -35.6751, lng: -71.543 },
    { name: 'Peru', code: 'PER', capital: 'Lima', lat: -9.19, lng: -75.0152 },
    { name: 'Colômbia', code: 'COL', capital: 'Bogotá', lat: 4.5709, lng: -74.2973 },
    { name: 'Venezuela', code: 'VEN', capital: 'Caracas', lat: 6.4238, lng: -66.5897 },
    { name: 'Equador', code: 'ECU', capital: 'Quito', lat: -1.8312, lng: -78.1834 },
    { name: 'Bolívia', code: 'BOL', capital: 'La Paz', lat: -16.2902, lng: -63.5887 },
    { name: 'Paraguai', code: 'PRY', capital: 'Assunção', lat: -23.4425, lng: -58.4438 },
    { name: 'Uruguai', code: 'URY', capital: 'Montevidéu', lat: -32.5228, lng: -55.7658 },
    { name: 'Guiana', code: 'GUY', capital: 'Georgetown', lat: 4.8604, lng: -58.9302 },
    { name: 'Suriname', code: 'SUR', capital: 'Paramaribo', lat: 3.9193, lng: -56.0278 }
  ],
  'North America': [
    { name: 'México', code: 'MEX', capital: 'Cidade do México', lat: 23.6345, lng: -102.5528 },
    { name: 'Guatemala', code: 'GTM', capital: 'Cidade da Guatemala', lat: 15.7835, lng: -90.2308 },
    { name: 'Cuba', code: 'CUB', capital: 'Havana', lat: 21.5218, lng: -77.7812 },
    { name: 'Haiti', code: 'HTI', capital: 'Porto Príncipe', lat: 18.9712, lng: -72.2852 },
    { name: 'República Dominicana', code: 'DOM', capital: 'Santo Domingo', lat: 18.7357, lng: -70.1627 },
    { name: 'Honduras', code: 'HND', capital: 'Tegucigalpa', lat: 15.2000, lng: -86.2419 },
    { name: 'Nicarágua', code: 'NIC', capital: 'Manágua', lat: 12.8654, lng: -85.2072 },
    { name: 'Costa Rica', code: 'CRI', capital: 'San José', lat: 9.7489, lng: -83.7534 },
    { name: 'Panamá', code: 'PAN', capital: 'Cidade do Panamá', lat: 8.5380, lng: -80.7821 }
  ],
  'Europe': [
    { name: 'Reino Unido', code: 'GBR', capital: 'Londres', lat: 55.3781, lng: -3.436 },
    { name: 'França', code: 'FRA', capital: 'Paris', lat: 46.6034, lng: 1.8883 },
    { name: 'Alemanha', code: 'DEU', capital: 'Berlim', lat: 51.1657, lng: 10.4515 },
    { name: 'Espanha', code: 'ESP', capital: 'Madrid', lat: 40.4637, lng: -3.7492 },
    { name: 'Itália', code: 'ITA', capital: 'Roma', lat: 41.8719, lng: 12.5674 },
    { name: 'Portugal', code: 'PRT', capital: 'Lisboa', lat: 39.3999, lng: -8.2245 },
    { name: 'Holanda', code: 'NLD', capital: 'Amsterdã', lat: 52.1326, lng: 5.2913 },
    { name: 'Bélgica', code: 'BEL', capital: 'Bruxelas', lat: 50.5039, lng: 4.4699 },
    { name: 'Suíça', code: 'CHE', capital: 'Berna', lat: 46.8182, lng: 8.2275 },
    { name: 'Áustria', code: 'AUT', capital: 'Viena', lat: 47.5162, lng: 14.5501 },
    { name: 'Polônia', code: 'POL', capital: 'Varsóvia', lat: 51.9194, lng: 19.1451 },
    { name: 'República Tcheca', code: 'CZE', capital: 'Praga', lat: 49.8175, lng: 15.473 },
    { name: 'Hungria', code: 'HUN', capital: 'Budapeste', lat: 47.1625, lng: 19.5033 },
    { name: 'Romênia', code: 'ROU', capital: 'Bucareste', lat: 45.9432, lng: 24.9668 },
    { name: 'Bulgária', code: 'BGR', capital: 'Sofia', lat: 42.7339, lng: 25.4858 },
    { name: 'Grécia', code: 'GRC', capital: 'Atenas', lat: 39.0742, lng: 21.8243 },
    { name: 'Noruega', code: 'NOR', capital: 'Oslo', lat: 60.472, lng: 8.4689 },
    { name: 'Suécia', code: 'SWE', capital: 'Estocolmo', lat: 60.1282, lng: 18.6435 },
    { name: 'Finlândia', code: 'FIN', capital: 'Helsinki', lat: 61.9241, lng: 25.7482 },
    { name: 'Dinamarca', code: 'DNK', capital: 'Copenhague', lat: 56.2639, lng: 9.5018 }
  ],
  'Africa': [
    { name: 'Nigéria', code: 'NGA', capital: 'Abuja', lat: 9.082, lng: 8.6753 },
    { name: 'África do Sul', code: 'ZAF', capital: 'Cidade do Cabo', lat: -30.5595, lng: 22.9375 },
    { name: 'Quênia', code: 'KEN', capital: 'Nairobi', lat: -0.0236, lng: 37.9062 },
    { name: 'Egito', code: 'EGY', capital: 'Cairo', lat: 26.0975, lng: 31.1 },
    { name: 'Marrocos', code: 'MAR', capital: 'Rabat', lat: 31.7917, lng: -7.0926 },
    { name: 'Etiópia', code: 'ETH', capital: 'Adis Abeba', lat: 9.145, lng: 40.4897 },
    { name: 'Gana', code: 'GHA', capital: 'Acra', lat: 7.9465, lng: -1.0232 },
    { name: 'Uganda', code: 'UGA', capital: 'Kampala', lat: 1.3733, lng: 32.2903 },
    { name: 'Tanzânia', code: 'TZA', capital: 'Dodoma', lat: -6.369, lng: 34.8888 },
    { name: 'Angola', code: 'AGO', capital: 'Luanda', lat: -11.2027, lng: 17.8739 },
    { name: 'Moçambique', code: 'MOZ', capital: 'Maputo', lat: -18.665, lng: 35.5296 },
    { name: 'Camarões', code: 'CMR', capital: 'Yaoundé', lat: 7.3697, lng: 12.3547 }
  ],
  'Asia': [
    { name: 'China', code: 'CHN', capital: 'Pequim', lat: 35.8617, lng: 104.1954 },
    { name: 'Índia', code: 'IND', capital: 'Nova Delhi', lat: 20.5937, lng: 78.9629 },
    { name: 'Japão', code: 'JPN', capital: 'Tóquio', lat: 36.2048, lng: 138.2529 },
    { name: 'Coreia do Sul', code: 'KOR', capital: 'Seul', lat: 35.9078, lng: 127.7669 },
    { name: 'Indonésia', code: 'IDN', capital: 'Jacarta', lat: -0.7893, lng: 113.9213 },
    { name: 'Filipinas', code: 'PHL', capital: 'Manila', lat: 12.8797, lng: 121.774 },
    { name: 'Tailândia', code: 'THA', capital: 'Bangkok', lat: 15.87, lng: 100.9925 },
    { name: 'Vietnã', code: 'VNM', capital: 'Hanói', lat: 14.0583, lng: 108.2772 },
    { name: 'Malásia', code: 'MYS', capital: 'Kuala Lumpur', lat: 4.2105, lng: 101.9758 },
    { name: 'Singapura', code: 'SGP', capital: 'Singapura', lat: 1.3521, lng: 103.8198 },
    { name: 'Paquistão', code: 'PAK', capital: 'Islamabad', lat: 30.3753, lng: 69.3451 },
    { name: 'Bangladesh', code: 'BGD', capital: 'Dhaka', lat: 23.685, lng: 90.3563 },
    { name: 'Sri Lanka', code: 'LKA', capital: 'Colombo', lat: 7.8731, lng: 80.7718 },
    { name: 'Myanmar', code: 'MMR', capital: 'Naypyidaw', lat: 21.9162, lng: 95.956 },
    { name: 'Camboja', code: 'KHM', capital: 'Phnom Penh', lat: 12.5657, lng: 104.991 }
  ],
  'Oceania': [
    { name: 'Austrália', code: 'AUS', capital: 'Canberra', lat: -25.2744, lng: 133.7751 },
    { name: 'Nova Zelândia', code: 'NZL', capital: 'Wellington', lat: -40.9006, lng: 174.886 },
    { name: 'Papua Nova Guiné', code: 'PNG', capital: 'Port Moresby', lat: -6.314, lng: 143.9555 },
    { name: 'Fiji', code: 'FJI', capital: 'Suva', lat: -16.7784, lng: 179.414 },
    { name: 'Ilhas Salomão', code: 'SLB', capital: 'Honiara', lat: -9.6457, lng: 160.1562 }
  ]
};

// 📊 ESTATÍSTICAS
let stats = {
  countries: { inserted: 0, skipped: 0, failed: 0 }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dominarMundo() {
  console.log('🌍 OPERAÇÃO DOMINAÇÃO MUNDIAL INICIADA!');
  console.log('🚀 CONQUISTANDO TODOS OS CONTINENTES...');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  for (const [continent, countries] of Object.entries(WORLD_DATA)) {
    console.log(`\n🌎 CONQUISTANDO ${continent.toUpperCase()}...`);
    
    for (const country of countries) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('country_code', country.code)
          .eq('region_type', 'country')
          .single();
        
        if (existing) {
          console.log(`⏭️  ${country.name} já dominado`);
          stats.countries.skipped++;
          continue;
        }
        
        // CONQUISTAR!
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: country.name,
            region_type: 'country',
            country_code: country.code,
            coordinates: { lat: country.lat, lng: country.lng },
            data_source: 'imported',
            status: 'approved'
          });
        
        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }
        
        console.log(`🚀 ✅ ${country.name} CONQUISTADO!`);
        stats.countries.inserted++;
        
      } catch (error) {
        console.error(`❌ Falha em ${country.name}: ${error.message}`);
        stats.countries.failed++;
      }
      
      await delay(200); // 200ms delay
    }
  }
  
  // RELATÓRIO FINAL
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n🎉 DOMINAÇÃO MUNDIAL COMPLETA!');
  console.log('='.repeat(60));
  console.log(`⏱️  Tempo: ${totalTime}s`);
  console.log(`🌍 Novos: ${stats.countries.inserted}`);
  console.log(`⏭️  Existentes: ${stats.countries.skipped}`);
  console.log(`❌ Falhas: ${stats.countries.failed}`);
  
  // Status final
  const { data: allCountries } = await supabase
    .from('spiritual_regions')
    .select('id')
    .eq('region_type', 'country');
  
  console.log(`\n🌍 TOTAL DE PAÍSES NO IMPÉRIO: ${allCountries?.length || 0}`);
  console.log('🎯 MISSÃO CUMPRIDA! O MUNDO É NOSSO!');
}

dominarMundo().catch(console.error); 