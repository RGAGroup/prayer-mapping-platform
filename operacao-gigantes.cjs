// 🏛️ OPERAÇÃO GIGANTES EXPANDIDA - China e Rússia Completos
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🏛️ DADOS EXPANDIDOS DOS GIGANTES
const GIANT_STATES = {
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
    { name: 'Yaroslavl Oblast', capital: 'Yaroslavl', lat: 57.6261, lng: 39.8845 }
  ],
  'IND': [
    { name: 'Uttar Pradesh', capital: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Maharashtra', capital: 'Mumbai', lat: 19.7515, lng: 75.7139 },
    { name: 'Bihar', capital: 'Patna', lat: 25.0961, lng: 85.3131 },
    { name: 'West Bengal', capital: 'Kolkata', lat: 22.9868, lng: 87.8550 },
    { name: 'Madhya Pradesh', capital: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { name: 'Tamil Nadu', capital: 'Chennai', lat: 11.1271, lng: 78.6569 },
    { name: 'Rajasthan', capital: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Karnataka', capital: 'Bangalore', lat: 15.3173, lng: 75.7139 },
    { name: 'Gujarat', capital: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
    { name: 'Andhra Pradesh', capital: 'Hyderabad', lat: 15.9129, lng: 79.7400 }
  ],
  'CAN': [
    { name: 'Ontario', capital: 'Toronto', lat: 51.2538, lng: -85.3232 },
    { name: 'Quebec', capital: 'Quebec City', lat: 53.9303, lng: -73.5468 },
    { name: 'British Columbia', capital: 'Victoria', lat: 53.7267, lng: -127.6476 },
    { name: 'Alberta', capital: 'Edmonton', lat: 53.9333, lng: -116.5765 },
    { name: 'Manitoba', capital: 'Winnipeg', lat: 53.7609, lng: -98.8139 },
    { name: 'Saskatchewan', capital: 'Regina', lat: 52.9540, lng: -106.5348 }
  ],
  'AUS': [
    { name: 'New South Wales', capital: 'Sydney', lat: -31.2532, lng: 146.9211 },
    { name: 'Victoria', capital: 'Melbourne', lat: -37.4713, lng: 144.7852 },
    { name: 'Queensland', capital: 'Brisbane', lat: -27.9674, lng: 153.4256 },
    { name: 'Western Australia', capital: 'Perth', lat: -31.9505, lng: 115.8605 },
    { name: 'South Australia', capital: 'Adelaide', lat: -34.9285, lng: 138.6007 },
    { name: 'Tasmania', capital: 'Hobart', lat: -42.8821, lng: 147.3272 }
  ]
};

let stats = { states: { inserted: 0, skipped: 0, failed: 0 } };

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function conquistarGigantes() {
  console.log('🏛️ OPERAÇÃO GIGANTES INICIADA!');
  console.log('🎯 Conquistando estados dos países gigantes...');
  console.log('='.repeat(60));
  
  const { data: countries } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'country')
    .in('country_code', ['CHN', 'IND', 'CAN', 'AUS']);
  
  for (const country of countries || []) {
    const states = GIANT_STATES[country.country_code] || [];
    
    console.log(`\n🏛️ ${country.name}: ${states.length} estados`);
    
    for (const state of states) {
      try {
        const { data: existing } = await supabase
          .from('spiritual_regions')
          .select('id')
          .eq('name', state.name)
          .eq('parent_id', country.id)
          .eq('region_type', 'state')
          .single();
        
        if (existing) {
          console.log(`⏭️  ${state.name} já existe`);
          stats.states.skipped++;
          continue;
        }
        
        const { error } = await supabase
          .from('spiritual_regions')
          .insert({
            name: state.name,
            region_type: 'state',
            country_code: country.country_code,
            parent_id: country.id,
            coordinates: { lat: state.lat, lng: state.lng },
            data_source: 'imported',
            status: 'approved'
          });
        
        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }
        
        console.log(`🚀 ✅ ${state.name} CONQUISTADO!`);
        stats.states.inserted++;
        
      } catch (error) {
        console.error(`❌ ${state.name}: ${error.message}`);
        stats.states.failed++;
      }
      
      await delay(120);
    }
  }
  
  console.log('\n🎉 OPERAÇÃO GIGANTES COMPLETA!');
  console.log(`🏛️ Novos: ${stats.states.inserted}, Existentes: ${stats.states.skipped}, Falhas: ${stats.states.failed}`);
}

conquistarGigantes().catch(console.error);