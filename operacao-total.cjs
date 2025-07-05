// 🌍 OPERAÇÃO TOTAL - DOMINAÇÃO MUNDIAL COMPLETA (SEM CIDADES)
// Conquistando TODOS os países e estados do mundo!

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🌍 TODOS OS PAÍSES DO MUNDO (Expandido)
const WORLD_COUNTRIES = {
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
    { name: 'Dinamarca', code: 'DNK', capital: 'Copenhague', lat: 56.2639, lng: 9.5018 },
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
    { name: 'Rússia', code: 'RUS', capital: 'Moscou', lat: 61.5240, lng: 105.3188 }
  ],
  'Asia': [
    { name: 'China', code: 'CHN', capital: 'Pequim', lat: 35.8617, lng: 104.1954 },
    { name: 'Índia', code: 'IND', capital: 'Nova Delhi', lat: 20.5937, lng: 78.9629 },
    { name: 'Japão', code: 'JPN', capital: 'Tóquio', lat: 36.2048, lng: 138.2529 },
    { name: 'Coreia do Sul', code: 'KOR', capital: 'Seul', lat: 35.9078, lng: 127.7669 },
    { name: 'Coreia do Norte', code: 'PRK', capital: 'Pyongyang', lat: 40.3399, lng: 127.5101 },
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
    { name: 'Camboja', code: 'KHM', capital: 'Phnom Penh', lat: 12.5657, lng: 104.991 },
    { name: 'Laos', code: 'LAO', capital: 'Vientiane', lat: 19.8563, lng: 102.4955 },
    { name: 'Mongólia', code: 'MNG', capital: 'Ulaanbaatar', lat: 46.8625, lng: 103.8467 },
    { name: 'Nepal', code: 'NPL', capital: 'Kathmandu', lat: 28.3949, lng: 84.1240 },
    { name: 'Butão', code: 'BTN', capital: 'Thimphu', lat: 27.5142, lng: 90.4336 },
    { name: 'Afeganistão', code: 'AFG', capital: 'Cabul', lat: 33.9391, lng: 67.7100 },
    { name: 'Irã', code: 'IRN', capital: 'Teerã', lat: 32.4279, lng: 53.6880 },
    { name: 'Iraque', code: 'IRQ', capital: 'Bagdá', lat: 33.2232, lng: 43.6793 },
    { name: 'Síria', code: 'SYR', capital: 'Damasco', lat: 34.8021, lng: 38.9968 },
    { name: 'Jordânia', code: 'JOR', capital: 'Amã', lat: 30.5852, lng: 36.2384 },
    { name: 'Líbano', code: 'LBN', capital: 'Beirute', lat: 33.8547, lng: 35.8623 },
    { name: 'Israel', code: 'ISR', capital: 'Jerusalém', lat: 31.0461, lng: 34.8516 },
    { name: 'Palestina', code: 'PSE', capital: 'Ramallah', lat: 31.9073, lng: 35.2033 },
    { name: 'Turquia', code: 'TUR', capital: 'Ancara', lat: 38.9637, lng: 35.2433 },
    { name: 'Cazaquistão', code: 'KAZ', capital: 'Nur-Sultan', lat: 48.0196, lng: 66.9237 },
    { name: 'Uzbequistão', code: 'UZB', capital: 'Tashkent', lat: 41.3775, lng: 64.5853 }
  ],
  'Africa': [
    { name: 'Nigéria', code: 'NGA', capital: 'Abuja', lat: 9.082, lng: 8.6753 },
    { name: 'Etiópia', code: 'ETH', capital: 'Adis Abeba', lat: 9.145, lng: 40.4897 },
    { name: 'Egito', code: 'EGY', capital: 'Cairo', lat: 26.0975, lng: 31.1 },
    { name: 'África do Sul', code: 'ZAF', capital: 'Cidade do Cabo', lat: -30.5595, lng: 22.9375 },
    { name: 'Quênia', code: 'KEN', capital: 'Nairobi', lat: -0.0236, lng: 37.9062 },
    { name: 'Uganda', code: 'UGA', capital: 'Kampala', lat: 1.3733, lng: 32.2903 },
    { name: 'Tanzânia', code: 'TZA', capital: 'Dodoma', lat: -6.369, lng: 34.8888 },
    { name: 'Moçambique', code: 'MOZ', capital: 'Maputo', lat: -18.665, lng: 35.5296 },
    { name: 'Madagascar', code: 'MDG', capital: 'Antananarivo', lat: -18.8792, lng: 47.5079 },
    { name: 'Camarões', code: 'CMR', capital: 'Yaoundé', lat: 7.3697, lng: 12.3547 },
    { name: 'Costa do Marfim', code: 'CIV', capital: 'Yamoussoukro', lat: 7.5400, lng: -5.5471 },
    { name: 'Burkina Faso', code: 'BFA', capital: 'Ouagadougou', lat: 12.2383, lng: -1.5616 },
    { name: 'Mali', code: 'MLI', capital: 'Bamako', lat: 17.5707, lng: -3.9962 },
    { name: 'Niger', code: 'NER', capital: 'Niamey', lat: 17.6078, lng: 8.0817 },
    { name: 'Chade', code: 'TCD', capital: 'N\'Djamena', lat: 15.4542, lng: 18.7322 },
    { name: 'Sudão', code: 'SDN', capital: 'Cartum', lat: 12.8628, lng: 30.2176 },
    { name: 'Sudão do Sul', code: 'SSD', capital: 'Juba', lat: 6.8770, lng: 31.3070 },
    { name: 'República Democrática do Congo', code: 'COD', capital: 'Kinshasa', lat: -4.0383, lng: 21.7587 },
    { name: 'República do Congo', code: 'COG', capital: 'Brazzaville', lat: -0.2280, lng: 17.6544 },
    { name: 'República Centro-Africana', code: 'CAF', capital: 'Bangui', lat: 6.6111, lng: 20.9394 },
    { name: 'Gabão', code: 'GAB', capital: 'Libreville', lat: 0.4162, lng: 9.4673 },
    { name: 'Guiné Equatorial', code: 'GNQ', capital: 'Malabo', lat: 1.6508, lng: 10.2679 },
    { name: 'São Tomé e Príncipe', code: 'STP', capital: 'São Tomé', lat: 0.1864, lng: 6.6131 },
    { name: 'Angola', code: 'AGO', capital: 'Luanda', lat: -11.2027, lng: 17.8739 },
    { name: 'Zâmbia', code: 'ZMB', capital: 'Lusaka', lat: -13.1339, lng: 27.8493 },
    { name: 'Zimbábue', code: 'ZWE', capital: 'Harare', lat: -17.8252, lng: 31.0335 },
    { name: 'Botsuana', code: 'BWA', capital: 'Gaborone', lat: -22.3285, lng: 24.8486 },
    { name: 'Namíbia', code: 'NAM', capital: 'Windhoek', lat: -22.9576, lng: 18.4904 },
    { name: 'Lesoto', code: 'LSO', capital: 'Maseru', lat: -29.6100, lng: 28.2336 },
    { name: 'Suazilândia', code: 'SWZ', capital: 'Mbabane', lat: -26.5225, lng: 31.4659 },
    { name: 'Marrocos', code: 'MAR', capital: 'Rabat', lat: 31.7917, lng: -7.0926 },
    { name: 'Argélia', code: 'DZA', capital: 'Argel', lat: 28.0339, lng: 1.6596 },
    { name: 'Tunísia', code: 'TUN', capital: 'Tunis', lat: 33.8869, lng: 9.5375 },
    { name: 'Líbia', code: 'LBY', capital: 'Trípoli', lat: 26.3351, lng: 17.2283 },
    { name: 'Gana', code: 'GHA', capital: 'Acra', lat: 7.9465, lng: -1.0232 },
    { name: 'Senegal', code: 'SEN', capital: 'Dakar', lat: 14.4974, lng: -14.4524 },
    { name: 'Mauritânia', code: 'MRT', capital: 'Nouakchott', lat: 21.0079, lng: -10.9408 }
  ],
  'North America': [
    { name: 'Estados Unidos', code: 'USA', capital: 'Washington', lat: 39.8283, lng: -98.5795 },
    { name: 'Canadá', code: 'CAN', capital: 'Ottawa', lat: 56.1304, lng: -106.3468 },
    { name: 'México', code: 'MEX', capital: 'Cidade do México', lat: 23.6345, lng: -102.5528 },
    { name: 'Guatemala', code: 'GTM', capital: 'Cidade da Guatemala', lat: 15.7835, lng: -90.2308 },
    { name: 'Belize', code: 'BLZ', capital: 'Belmopan', lat: 17.1899, lng: -88.4976 },
    { name: 'El Salvador', code: 'SLV', capital: 'San Salvador', lat: 13.7942, lng: -88.8965 },
    { name: 'Honduras', code: 'HND', capital: 'Tegucigalpa', lat: 15.2000, lng: -86.2419 },
    { name: 'Nicarágua', code: 'NIC', capital: 'Manágua', lat: 12.8654, lng: -85.2072 },
    { name: 'Costa Rica', code: 'CRI', capital: 'San José', lat: 9.7489, lng: -83.7534 },
    { name: 'Panamá', code: 'PAN', capital: 'Cidade do Panamá', lat: 8.5380, lng: -80.7821 },
    { name: 'Cuba', code: 'CUB', capital: 'Havana', lat: 21.5218, lng: -77.7812 },
    { name: 'Jamaica', code: 'JAM', capital: 'Kingston', lat: 18.1096, lng: -77.2975 },
    { name: 'Haiti', code: 'HTI', capital: 'Porto Príncipe', lat: 18.9712, lng: -72.2852 },
    { name: 'República Dominicana', code: 'DOM', capital: 'Santo Domingo', lat: 18.7357, lng: -70.1627 },
    { name: 'Porto Rico', code: 'PRI', capital: 'San Juan', lat: 18.2208, lng: -66.5901 },
    { name: 'Trinidad e Tobago', code: 'TTO', capital: 'Port of Spain', lat: 10.6918, lng: -61.2225 },
    { name: 'Barbados', code: 'BRB', capital: 'Bridgetown', lat: 13.1939, lng: -59.5432 }
  ],
  'South America': [
    { name: 'Brasil', code: 'BRA', capital: 'Brasília', lat: -14.235, lng: -51.9253 },
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
    { name: 'Suriname', code: 'SUR', capital: 'Paramaribo', lat: 3.9193, lng: -56.0278 },
    { name: 'Guiana Francesa', code: 'GUF', capital: 'Caiena', lat: 3.9339, lng: -53.1258 }
  ],
  'Oceania': [
    { name: 'Austrália', code: 'AUS', capital: 'Canberra', lat: -25.2744, lng: 133.7751 },
    { name: 'Nova Zelândia', code: 'NZL', capital: 'Wellington', lat: -40.9006, lng: 174.886 },
    { name: 'Papua Nova Guiné', code: 'PNG', capital: 'Port Moresby', lat: -6.314, lng: 143.9555 },
    { name: 'Fiji', code: 'FJI', capital: 'Suva', lat: -16.7784, lng: 179.414 },
    { name: 'Ilhas Salomão', code: 'SLB', capital: 'Honiara', lat: -9.6457, lng: 160.1562 },
    { name: 'Vanuatu', code: 'VUT', capital: 'Port Vila', lat: -15.3767, lng: 166.9592 },
    { name: 'Samoa', code: 'WSM', capital: 'Apia', lat: -13.7590, lng: -172.1046 },
    { name: 'Tonga', code: 'TON', capital: 'Nuku\'alofa', lat: -21.1789, lng: -175.1982 },
    { name: 'Micronésia', code: 'FSM', capital: 'Palikir', lat: 7.4256, lng: 150.5508 },
    { name: 'Palau', code: 'PLW', capital: 'Ngerulmud', lat: 7.5000, lng: 134.5833 }
  ]
};

// 🏛️ ESTADOS PRINCIPAIS DOS GIGANTES (Expandido)
const WORLD_STATES = {
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
    { name: 'Siberian Federal District', capital: 'Novosibirsk', lat: 60.0000, lng: 100.0000 }
  ],
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
    { name: 'Guangxi Province', capital: 'Nanning', lat: 22.8170, lng: 108.3665 },
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
    { name: 'Inner Mongolia', capital: 'Hohhot', lat: 40.8414, lng: 111.7522 },
    { name: 'Xinjiang Region', capital: 'Ürümqi', lat: 43.7793, lng: 87.6005 },
    { name: 'Tibet Region', capital: 'Lhasa', lat: 29.6520, lng: 91.1721 },
    { name: 'Ningxia Region', capital: 'Yinchuan', lat: 38.4872, lng: 106.2309 },
    { name: 'Hainan Province', capital: 'Haikou', lat: 20.0458, lng: 110.1989 },
    { name: 'Hong Kong SAR', capital: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
    { name: 'Macau SAR', capital: 'Macau', lat: 22.1987, lng: 113.5439 },
    { name: 'Taiwan Province', capital: 'Taipei', lat: 25.0330, lng: 121.5654 },
    { name: 'Qinghai Province', capital: 'Xining', lat: 36.6231, lng: 101.7539 },
    { name: 'Gansu Province', capital: 'Lanzhou', lat: 36.0611, lng: 103.8343 }
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

// 📊 ESTATÍSTICAS
let stats = {
  countries: { inserted: 0, skipped: 0, failed: 0 },
  states: { inserted: 0, skipped: 0, failed: 0 }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function operacaoTotal() {
  console.log('🌍 OPERAÇÃO TOTAL INICIADA!');
  console.log('🚀 DOMINAÇÃO MUNDIAL COMPLETA (PAÍSES + ESTADOS)');
  console.log('⚠️  SEM CIDADES POR ENQUANTO');
  console.log('='.repeat(70));
  
  const startTime = Date.now();
  
  // FASE 1: DOMINAÇÃO DE PAÍSES
  console.log('\n📍 FASE 1: DOMINAÇÃO DE PAÍSES');
  await conquistarPaises();
  
  // FASE 2: DOMINAÇÃO DE ESTADOS
  console.log('\n📍 FASE 2: DOMINAÇÃO DE ESTADOS');
  await conquistarEstados();
  
  // RELATÓRIO FINAL
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  const totalInserted = stats.countries.inserted + stats.states.inserted;
  const totalSkipped = stats.countries.skipped + stats.states.skipped;
  const totalFailed = stats.countries.failed + stats.states.failed;
  
  console.log('\n🎉 OPERAÇÃO TOTAL COMPLETA!');
  console.log('='.repeat(70));
  console.log(`⏱️  Tempo total: ${totalTime}s`);
  console.log(`🌍 Países: ${stats.countries.inserted} novos, ${stats.countries.skipped} existentes, ${stats.countries.failed} falhas`);
  console.log(`🏛️ Estados: ${stats.states.inserted} novos, ${stats.states.skipped} existentes, ${stats.states.failed} falhas`);
  console.log(`📈 TOTAL: ${totalInserted} conquistas, ${totalSkipped} já dominados, ${totalFailed} falhas`);
  
  // STATUS FINAL
  await statusFinal();
}

async function conquistarPaises() {
  for (const [continent, countries] of Object.entries(WORLD_COUNTRIES)) {
    console.log(`\n🌎 CONQUISTANDO ${continent.toUpperCase()}...`);
    
    for (const country of countries) {
      try {
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
        console.error(`❌ ${country.name}: ${error.message}`);
        stats.countries.failed++;
      }
      
      await delay(150);
    }
  }
}

async function conquistarEstados() {
  const { data: countries } = await supabase
    .from('spiritual_regions')
    .select('id, name, country_code')
    .eq('region_type', 'country')
    .in('country_code', Object.keys(WORLD_STATES));
  
  for (const country of countries || []) {
    const states = WORLD_STATES[country.country_code] || [];
    
    if (states.length === 0) continue;
    
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
        
        console.log(`   🚀 ✅ ${state.name} CONQUISTADO!`);
        stats.states.inserted++;
        
      } catch (error) {
        console.error(`   ❌ ${state.name}: ${error.message}`);
        stats.states.failed++;
      }
      
      await delay(120);
    }
  }
}

async function statusFinal() {
  const { data: countries } = await supabase
    .from('spiritual_regions')
    .select('id')
    .eq('region_type', 'country');
  
  const { data: states } = await supabase
    .from('spiritual_regions')
    .select('id')
    .eq('region_type', 'state');
  
  const { data: cities } = await supabase
    .from('spiritual_regions')
    .select('id')
    .eq('region_type', 'city');
  
  const total = (countries?.length || 0) + (states?.length || 0) + (cities?.length || 0);
  
  console.log('\n🎯 IMPÉRIO ATALAIA FINAL:');
  console.log(`🌍 Países: ${countries?.length || 0}`);
  console.log(`🏛️ Estados: ${states?.length || 0}`);
  console.log(`🏙️ Cidades: ${cities?.length || 0}`);
  console.log(`📈 TOTAL: ${total} regiões dominadas!`);
  
  console.log('\n🌍 OPERAÇÃO TOTAL COMPLETA!');
  console.log('🙏 Atalaia Global Vision - Cobertura Mundial Ativa!');
  console.log('📋 Próximo passo: Adicionar cidades quando necessário');
}

operacaoTotal().catch(console.error); 