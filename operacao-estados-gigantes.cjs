// 🏛️ OPERAÇÃO ESTADOS GIGANTES - China e Rússia
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

const ESTADOS_GIGANTES = {
  'CHN': [
    { name: 'Beijing Municipality', capital: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: 'Shanghai Municipality', capital: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: 'Tianjin Municipality', capital: 'Tianjin', lat: 39.1422, lng: 117.1767 },
    { name: 'Chongqing Municipality', capital: 'Chongqing', lat: 29.4316, lng: 106.9123 },
    { name: 'Guangdong Province', capital: 'Guangzhou', lat: 23.3790, lng: 113.7633 },
    { name: 'Sichuan Province', capital: 'Chengdu', lat: 30.5723, lng: 104.0665 },
    { name: 'Henan Province', capital: 'Zhengzhou', lat: 34.7937, lng: 113.5000 },
    { name: 'Shandong Province', capital: 'Jinan', lat: 36.6512, lng: 117.1201 },
    { name: 'Hebei Province', capital: 'Shijiazhuang', lat: 38.0428, lng: 114.5149 },
    { name: 'Hunan Province', capital: 'Changsha', lat: 28.2282, lng: 112.9388 },
    { name: 'Anhui Province', capital: 'Hefei', lat: 31.8612, lng: 117.2844 },
    { name: 'Hubei Province', capital: 'Wuhan', lat: 30.5928, lng: 114.3055 },
    { name: 'Guangxi Region', capital: 'Nanning', lat: 22.8170, lng: 108.3665 },
    { name: 'Jiangsu Province', capital: 'Nanjing', lat: 32.0603, lng: 118.7969 },
    { name: 'Zhejiang Province', capital: 'Hangzhou', lat: 30.2741, lng: 120.1551 },
    { name: 'Liaoning Province', capital: 'Shenyang', lat: 41.8057, lng: 123.4315 },
    { name: 'Shanxi Province', capital: 'Taiyuan', lat: 37.8706, lng: 112.5489 },
    { name: 'Shaanxi Province', capital: 'Xi\'an', lat: 34.3416, lng: 108.9398 },
    { name: 'Jilin Province', capital: 'Changchun', lat: 43.8171, lng: 125.3235 },
    { name: 'Fujian Province', capital: 'Fuzhou', lat: 26.0745, lng: 119.2965 },
    { name: 'Guizhou Province', capital: 'Guiyang', lat: 26.6470, lng: 106.6302 },
    { name: 'Jiangxi Province', capital: 'Nanchang', lat: 28.6820, lng: 115.8579 },
    { name: 'Yunnan Province', capital: 'Kunming', lat: 25.0389, lng: 102.7183 },
    { name: 'Heilongjiang Province', capital: 'Harbin', lat: 45.8038, lng: 126.5349 },
    { name: 'Inner Mongolia Region', capital: 'Hohhot', lat: 40.8414, lng: 111.7522 },
    { name: 'Gansu Province', capital: 'Lanzhou', lat: 36.0611, lng: 103.8343 },
    { name: 'Xinjiang Region', capital: 'Ürümqi', lat: 43.7793, lng: 87.6005 },
    { name: 'Tibet Region', capital: 'Lhasa', lat: 29.6520, lng: 91.1721 },
    { name: 'Ningxia Region', capital: 'Yinchuan', lat: 38.4872, lng: 106.2309 },
    { name: 'Hainan Province', capital: 'Haikou', lat: 20.0458, lng: 110.1989 },
    { name: 'Hong Kong SAR', capital: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
    { name: 'Macau SAR', capital: 'Macau', lat: 22.1987, lng: 113.5439 },
    { name: 'Taiwan Province', capital: 'Taipei', lat: 25.0330, lng: 121.5654 },
    { name: 'Qinghai Province', capital: 'Xining', lat: 36.6231, lng: 101.7539 }
  ],
  'RUS': [
    { name: 'Moscow Oblast', capital: 'Moscow', lat: 55.7558, lng: 37.6176 },
    { name: 'Saint Petersburg', capital: 'Saint Petersburg', lat: 59.9311, lng: 30.3609 },
    { name: 'Novosibirsk Oblast', capital: 'Novosibirsk', lat: 55.0084, lng: 82.9357 },
    { name: 'Yekaterinburg Oblast', capital: 'Yekaterinburg', lat: 56.8431, lng: 60.6454 },
    { name: 'Nizhny Novgorod Oblast', capital: 'Nizhny Novgorod', lat: 56.2965, lng: 43.9361 },
    { name: 'Tatarstan Republic', capital: 'Kazan', lat: 55.8304, lng: 49.0661 },
    { name: 'Chelyabinsk Oblast', capital: 'Chelyabinsk', lat: 55.1644, lng: 61.4368 },
    { name: 'Omsk Oblast', capital: 'Omsk', lat: 54.9885, lng: 73.3242 },
    { name: 'Samara Oblast', capital: 'Samara', lat: 53.2001, lng: 50.1500 },
    { name: 'Rostov Oblast', capital: 'Rostov-on-Don', lat: 47.2357, lng: 39.7015 },
    { name: 'Bashkortostan Republic', capital: 'Ufa', lat: 54.7388, lng: 55.9721 },
    { name: 'Krasnoyarsk Krai', capital: 'Krasnoyarsk', lat: 56.0184, lng: 92.8672 },
    { name: 'Perm Krai', capital: 'Perm', lat: 58.0105, lng: 56.2502 },
    { name: 'Voronezh Oblast', capital: 'Voronezh', lat: 51.6720, lng: 39.1843 },
    { name: 'Volgograd Oblast', capital: 'Volgograd', lat: 48.7080, lng: 44.5133 },
    { name: 'Krasnodar Krai', capital: 'Krasnodar', lat: 45.0355, lng: 38.9753 },
    { name: 'Saratov Oblast', capital: 'Saratov', lat: 51.5924, lng: 46.0348 },
    { name: 'Tyumen Oblast', capital: 'Tyumen', lat: 57.1522, lng: 65.5272 },
    { name: 'Kaliningrad Oblast', capital: 'Kaliningrad', lat: 54.7104, lng: 20.4522 },
    { name: 'Irkutsk Oblast', capital: 'Irkutsk', lat: 52.2978, lng: 104.2964 },
    { name: 'Primorsky Krai', capital: 'Vladivostok', lat: 43.1332, lng: 131.9113 },
    { name: 'Stavropol Krai', capital: 'Stavropol', lat: 45.0428, lng: 41.9734 },
    { name: 'Kemerovo Oblast', capital: 'Kemerovo', lat: 55.3331, lng: 86.0831 },
    { name: 'Tula Oblast', capital: 'Tula', lat: 54.1961, lng: 37.6182 },
    { name: 'Yaroslavl Oblast', capital: 'Yaroslavl', lat: 57.6261, lng: 39.8845 },
    { name: 'Altai Republic', capital: 'Gorno-Altaysk', lat: 51.9581, lng: 85.9603 },
    { name: 'Sakhalin Oblast', capital: 'Yuzhno-Sakhalinsk', lat: 46.9588, lng: 142.7386 },
    { name: 'Kamchatka Krai', capital: 'Petropavlovsk-Kamchatsky', lat: 53.0167, lng: 158.6500 },
    { name: 'Chukotka Autonomous Okrug', capital: 'Anadyr', lat: 64.7353, lng: 177.5130 },
    { name: 'Yakutia Republic', capital: 'Yakutsk', lat: 62.0397, lng: 129.7322 }
  ],
  'DEU': [
    { name: 'Baden-Württemberg', capital: 'Stuttgart', lat: 48.6616, lng: 9.3501 },
    { name: 'Bayern', capital: 'München', lat: 48.7904, lng: 11.4979 },
    { name: 'Berlin', capital: 'Berlin', lat: 52.5244, lng: 13.4105 },
    { name: 'Brandenburg', capital: 'Potsdam', lat: 52.4009, lng: 12.9849 },
    { name: 'Bremen', capital: 'Bremen', lat: 53.1355, lng: 8.7890 },
    { name: 'Hamburg', capital: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    { name: 'Hessen', capital: 'Wiesbaden', lat: 50.0782, lng: 8.2397 },
    { name: 'Mecklenburg-Vorpommern', capital: 'Schwerin', lat: 53.6355, lng: 11.4010 },
    { name: 'Niedersachsen', capital: 'Hannover', lat: 52.3744, lng: 9.7386 },
    { name: 'Nordrhein-Westfalen', capital: 'Düsseldorf', lat: 51.2254, lng: 6.7763 },
    { name: 'Rheinland-Pfalz', capital: 'Mainz', lat: 49.9897, lng: 8.2730 },
    { name: 'Saarland', capital: 'Saarbrücken', lat: 49.2401, lng: 6.9969 },
    { name: 'Sachsen', capital: 'Dresden', lat: 51.0834, lng: 13.4424 },
    { name: 'Sachsen-Anhalt', capital: 'Magdeburg', lat: 52.1315, lng: 11.6399 },
    { name: 'Schleswig-Holstein', capital: 'Kiel', lat: 54.3233, lng: 10.1228 },
    { name: 'Thüringen', capital: 'Erfurt', lat: 50.9848, lng: 11.0299 }
  ],
  'FRA': [
    { name: 'Île-de-France', capital: 'Paris', lat: 48.8499, lng: 2.6370 },
    { name: 'Auvergne-Rhône-Alpes', capital: 'Lyon', lat: 45.7485, lng: 4.8467 },
    { name: 'Nouvelle-Aquitaine', capital: 'Bordeaux', lat: 44.8404, lng: -0.5805 },
    { name: 'Occitanie', capital: 'Toulouse', lat: 43.6045, lng: 1.4442 },
    { name: 'Hauts-de-France', capital: 'Lille', lat: 50.6292, lng: 3.0573 },
    { name: 'Grand Est', capital: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
    { name: 'Provence-Alpes-Côte d\'Azur', capital: 'Marseille', lat: 43.9352, lng: 6.0679 },
    { name: 'Pays de la Loire', capital: 'Nantes', lat: 47.2184, lng: -1.5536 },
    { name: 'Bretagne', capital: 'Rennes', lat: 48.1113, lng: -1.6800 },
    { name: 'Normandie', capital: 'Rouen', lat: 49.4938, lng: 1.0624 },
    { name: 'Bourgogne-Franche-Comté', capital: 'Dijon', lat: 47.3215, lng: 5.0415 },
    { name: 'Centre-Val de Loire', capital: 'Orléans', lat: 47.9029, lng: 1.9093 },
    { name: 'Corse', capital: 'Ajaccio', lat: 41.9190, lng: 8.7384 }
  ]
};

let stats = { inserted: 0, skipped: 0, failed: 0 };

async function conquistarEstadosGigantes() {
  console.log('🏛️ OPERAÇÃO ESTADOS GIGANTES!');
  console.log('🎯 China, Rússia, Alemanha, França...');
  console.log('='.repeat(50));
  
  const { data: countries } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'country')
    .in('country_code', Object.keys(ESTADOS_GIGANTES));
  
  for (const country of countries || []) {
    const estados = ESTADOS_GIGANTES[country.country_code] || [];
    
    console.log(`\n🏛️ ${country.name}: ${estados.length} estados/províncias`);
    
    for (const estado of estados) {
      try {
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', estado.name)
          .eq('parent_id', country.id)
          .eq('region_type', 'state')
          .single();
        
        if (existing) {
          console.log(`⏭️  ${estado.name} já existe`);
          stats.skipped++;
          continue;
        }
        
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: estado.name,
            region_type: 'state',
            country_code: country.country_code,
            parent_id: country.id,
            coordinates: { lat: estado.lat, lng: estado.lng },
            data_source: 'imported',
            status: 'approved'
          });
        
        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }
        
        console.log(`   🚀 ✅ ${estado.name} CONQUISTADO!`);
        stats.inserted++;
        
      } catch (error) {
        console.error(`   ❌ ${estado.name}: ${error.message}`);
        stats.failed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n🎉 ESTADOS GIGANTES CONQUISTADOS!');
  console.log(`🏛️ Novos: ${stats.inserted}, Existentes: ${stats.skipped}, Falhas: ${stats.failed}`);
}

conquistarEstadosGigantes().catch(console.error); 