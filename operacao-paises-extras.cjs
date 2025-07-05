// 🌍 OPERAÇÃO PAÍSES EXTRAS - Completar dominação mundial
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

const PAISES_EXTRAS = [
  { name: 'Irlanda', code: 'IRL', capital: 'Dublin', lat: 53.1424, lng: -7.6921 },
  { name: 'Islândia', code: 'ISL', capital: 'Reykjavik', lat: 64.9631, lng: -19.0208 },
  { name: 'Luxemburgo', code: 'LUX', capital: 'Luxemburgo', lat: 49.8153, lng: 6.1296 },
  { name: 'Malta', code: 'MLT', capital: 'Valletta', lat: 35.9375, lng: 14.3754 },
  { name: 'Croácia', code: 'HRV', capital: 'Zagreb', lat: 45.1000, lng: 15.2000 },
  { name: 'Eslovênia', code: 'SVN', capital: 'Ljubljana', lat: 46.0569, lng: 14.5058 },
  { name: 'Eslováquia', code: 'SVK', capital: 'Bratislava', lat: 48.6690, lng: 19.6990 },
  { name: 'Estônia', code: 'EST', capital: 'Tallinn', lat: 58.5953, lng: 25.0136 },
  { name: 'Letônia', code: 'LVA', capital: 'Riga', lat: 56.8796, lng: 24.6032 },
  { name: 'Lituânia', code: 'LTU', capital: 'Vilnius', lat: 55.1694, lng: 23.8813 },
  { name: 'Rússia', code: 'RUS', capital: 'Moscou', lat: 61.5240, lng: 105.3188 },
  { name: 'Turquia', code: 'TUR', capital: 'Ancara', lat: 38.9637, lng: 35.2433 },
  { name: 'Irã', code: 'IRN', capital: 'Teerã', lat: 32.4279, lng: 53.6880 },
  { name: 'Israel', code: 'ISR', capital: 'Jerusalém', lat: 31.0461, lng: 34.8516 },
  { name: 'Jordânia', code: 'JOR', capital: 'Amã', lat: 30.5852, lng: 36.2384 },
  { name: 'Líbano', code: 'LBN', capital: 'Beirute', lat: 33.8547, lng: 35.8623 },
  { name: 'Afeganistão', code: 'AFG', capital: 'Cabul', lat: 33.9391, lng: 67.7100 },
  { name: 'Nepal', code: 'NPL', capital: 'Kathmandu', lat: 28.3949, lng: 84.1240 },
  { name: 'Mongolia', code: 'MNG', capital: 'Ulaanbaatar', lat: 46.8625, lng: 103.8467 },
  { name: 'Cazaquistão', code: 'KAZ', capital: 'Nur-Sultan', lat: 48.0196, lng: 66.9237 }
];

let stats = { inserted: 0, skipped: 0, failed: 0 };

async function conquistarPaisesExtras() {
  console.log('🌍 OPERAÇÃO PAÍSES EXTRAS INICIADA!');
  console.log('🎯 Completando dominação mundial...');
  console.log('='.repeat(50));
  
  for (const pais of PAISES_EXTRAS) {
    try {
      const { data: existing } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('country_code', pais.code)
        .eq('region_type', 'country')
        .single();
      
      if (existing) {
        console.log(`⏭️  ${pais.name} já dominado`);
        stats.skipped++;
        continue;
      }
      
      const { error } = await supabase
        .from('spiritual_regions')
        .insert({
          name: pais.name,
          region_type: 'country',
          country_code: pais.code,
          coordinates: { lat: pais.lat, lng: pais.lng },
          data_source: 'imported',
          status: 'approved'
        });
      
      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }
      
      console.log(`🚀 ✅ ${pais.name} CONQUISTADO!`);
      stats.inserted++;
      
    } catch (error) {
      console.error(`❌ ${pais.name}: ${error.message}`);
      stats.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  
  console.log('\n🎉 PAÍSES EXTRAS CONQUISTADOS!');
  console.log(`🌍 Novos: ${stats.inserted}, Existentes: ${stats.skipped}, Falhas: ${stats.failed}`);
}

conquistarPaisesExtras().catch(console.error); 