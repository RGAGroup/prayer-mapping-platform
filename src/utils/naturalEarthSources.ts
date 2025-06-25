// Fontes de dados da Natural Earth e outras APIs geográficas confiáveis

export interface DataSource {
  name: string;
  type: 'countries' | 'states' | 'cities' | 'continents' | 'municipalities';
  resolution: '10m' | '50m' | '110m';
  url: string;
  description: string;
  pros: string[];
  cons: string[];
  zoomLevels: number[];
  region?: string; // Para fontes específicas de região
}

// 🌍 NATURAL EARTH - FONTES OFICIAIS UNIFICADAS
// Usando apenas APIs oficiais da Natural Earth para eliminar conflitos

export const NATURAL_EARTH_SOURCES: DataSource[] = [
  // 🌍 CONTINENTES (Zoom 1-3)
  {
    name: 'Natural Earth Continents',
    type: 'continents',
    resolution: '110m',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    description: 'Países Natural Earth 110m (agrupados por continente)',
    pros: ['Oficial Natural Earth', 'Leve', 'Rápido', 'Confiável'],
    cons: ['Precisa agrupar por continente'],
    zoomLevels: [1, 2, 3]
  },
  
  // 🏳️ PAÍSES (Zoom 4-6)
  {
    name: 'Natural Earth Countries',
    type: 'countries',
    resolution: '50m',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
    description: 'Países do mundo Natural Earth 50m',
    pros: ['Oficial Natural Earth', 'Boa resolução', 'Metadados completos', 'Fronteiras precisas'],
    cons: ['Arquivo médio'],
    zoomLevels: [4, 5, 6]
  },
  
  // 🏛️ ESTADOS/PROVÍNCIAS (Zoom 7-9)
  {
    name: 'Natural Earth States',
    type: 'states',
    resolution: '50m',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson',
    description: 'Estados e províncias Natural Earth 50m',
    pros: ['Oficial Natural Earth', 'Divisões administrativas reais', 'Cobertura global', 'Dados precisos'],
    cons: ['Arquivo grande'],
    zoomLevels: [7, 8, 9]
  },
  
  // 🏙️ CIDADES (Zoom 10+)
  {
    name: 'Natural Earth Cities',
    type: 'cities',
    resolution: '50m',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_populated_places.geojson',
    description: 'Cidades populadas Natural Earth 50m',
    pros: ['Oficial Natural Earth', 'Cidades importantes', 'Dados populacionais', 'Cobertura global'],
    cons: ['Pontos (convertidos para polígonos pequenos)'],
    zoomLevels: [10, 11, 12, 13, 14, 15]
  }
];

// 🇧🇷 FONTES ESPECÍFICAS POR REGIÃO
// Complementam a Natural Earth com dados mais detalhados por país

export const REGIONAL_SOURCES: DataSource[] = [
  // 🏛️ MUNICÍPIOS BRASILEIROS (Zoom 10+)
  {
    name: 'IBGE Brazilian Municipalities',
    type: 'municipalities',
    resolution: '50m',
    url: 'https://raw.githubusercontent.com/ggondim/ibge-cidades-com-poligonos/main/municipios-poligonos.json',
    description: 'Municípios brasileiros IBGE com polígonos (5.567 municípios)',
    pros: ['Oficial IBGE', 'Polígonos reais', 'Cobertura completa do Brasil', 'Dados atualizados'],
    cons: ['Apenas Brasil', 'Arquivo grande (polígonos complexos)'],
    zoomLevels: [10, 11, 12, 13, 14, 15],
    region: 'Brazil'
  }
];

// 🎯 OBTER FONTE POR ZOOM LEVEL E REGIÃO
export const getSourceByZoomLevel = (zoomLevel: number, region?: string): DataSource => {
  // Para zoom alto (10+) e região Brasil, usar municípios IBGE
  if (zoomLevel >= 10 && region === 'Brazil') {
    return REGIONAL_SOURCES[0]; // Municípios brasileiros
  }
  
  // Caso contrário, usar Natural Earth
  if (zoomLevel <= 3) {
    return NATURAL_EARTH_SOURCES[0]; // Continentes
  } else if (zoomLevel <= 6) {
    return NATURAL_EARTH_SOURCES[1]; // Países
  } else if (zoomLevel <= 9) {
    return NATURAL_EARTH_SOURCES[2]; // Estados
  } else {
    return NATURAL_EARTH_SOURCES[3]; // Cidades
  }
};

// 🔍 DETECTAR REGIÃO ATUAL
export const detectCurrentRegion = (mapCenter: { lat: number; lng: number }): string | undefined => {
  // Coordenadas aproximadas do Brasil
  if (mapCenter.lat >= -35 && mapCenter.lat <= 5 && 
      mapCenter.lng >= -75 && mapCenter.lng <= -30) {
    return 'Brazil';
  }
  
  // Adicionar outras regiões conforme necessário
  return undefined;
};

// 🌍 AGRUPAMENTO DE CONTINENTES
export const CONTINENT_GROUPS = {
  'South America': {
    name_pt: 'América do Sul',
    countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname', 'French Guiana']
  },
  'North America': {
    name_pt: 'América do Norte', 
    countries: ['United States of America', 'Canada', 'Mexico', 'Guatemala', 'Cuba', 'Haiti', 'Dominican Republic', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama']
  },
  'Europe': {
    name_pt: 'Europa',
    countries: ['Germany', 'France', 'Spain', 'Italy', 'United Kingdom', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Greece', 'Portugal', 'Czech Republic', 'Hungary', 'Sweden', 'Belarus', 'Austria', 'Switzerland', 'Bulgaria', 'Serbia', 'Denmark', 'Finland', 'Slovakia', 'Norway', 'Ireland', 'Bosnia and Herzegovina', 'Croatia', 'Albania', 'Lithuania', 'Slovenia', 'Latvia', 'Estonia', 'North Macedonia', 'Moldova', 'Luxembourg', 'Malta', 'Iceland']
  },
  'Africa': {
    name_pt: 'África',
    countries: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe']
  },
  'Asia': {
    name_pt: 'Ásia',
    countries: ['China', 'India', 'Indonesia', 'Pakistan', 'Bangladesh', 'Japan', 'Philippines', 'Vietnam', 'Turkey', 'Iran', 'Thailand', 'Myanmar', 'South Korea', 'Iraq', 'Afghanistan', 'Uzbekistan', 'Malaysia', 'Nepal', 'Yemen', 'North Korea', 'Sri Lanka', 'Kazakhstan', 'Cambodia', 'Jordan', 'Azerbaijan', 'Tajikistan', 'Israel', 'Laos', 'Singapore', 'Lebanon', 'Kyrgyzstan', 'Turkmenistan', 'Syria', 'Armenia', 'Mongolia', 'Georgia', 'Kuwait', 'Qatar', 'Bahrain', 'Brunei', 'Bhutan', 'Maldives']
  },
  'Oceania': {
    name_pt: 'Oceania',
    countries: ['Australia', 'Papua New Guinea', 'New Zealand', 'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa', 'Micronesia', 'Tonga', 'Kiribati', 'Palau', 'Marshall Islands', 'Tuvalu', 'Nauru']
  }
};

// 🔧 UTILIDADES NATURAL EARTH
export const getFeatureName = (feature: any): string => {
  return feature.properties?.NAME || 
         feature.properties?.NAME_EN ||
         feature.properties?.ADMIN ||
         feature.properties?.name ||
         feature.properties?.NAME_PT ||
         'Região Desconhecida';
};

export const getFeatureContinent = (feature: any): string => {
  const name = getFeatureName(feature);
  
  for (const [continentCode, continent] of Object.entries(CONTINENT_GROUPS)) {
    if (continent.countries.some(country => 
      name.toLowerCase().includes(country.toLowerCase()) ||
      country.toLowerCase().includes(name.toLowerCase())
    )) {
      return continent.name_pt;
    }
  }
  
  return 'Desconhecido';
};

// 📊 PERFORMANCE TRACKING
export const logDataSourcePerformance = (sourceName: string, loadTime: number, dataSize: number) => {
  console.log(`📊 Performance Natural Earth - ${sourceName}:`, {
    loadTime: `${Math.round(loadTime)}ms`,
    dataSize: `${(dataSize / 1024).toFixed(2)}KB`,
    efficiency: `${(dataSize / loadTime).toFixed(2)} bytes/ms`
  });
};

// ✅ VALIDAÇÃO GEOJSON
export const validateGeoJSONData = (data: any): boolean => {
  return data && 
         data.type === 'FeatureCollection' && 
         Array.isArray(data.features) && 
         data.features.length > 0;
};

// 🎯 FILTROS POR REGIÃO
export const REGION_FILTERS = {
  'south_america': {
    name: 'América do Sul',
    countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname', 'French Guiana'],
    bounds: {
      north: 12.4,
      south: -56.1,
      east: -34.7,
      west: -81.3
    }
  },
  'north_america': {
    name: 'América do Norte',
    countries: ['United States', 'Canada', 'Mexico'],
    bounds: {
      north: 71.5,
      south: 12.8,
      east: -52.6,
      west: -168.1
    }
  },
  'europe': {
    name: 'Europa',
    countries: ['Germany', 'France', 'Spain', 'Italy', 'United Kingdom', 'Poland', 'Netherlands', 'Belgium', 'Portugal', 'Greece'],
    bounds: {
      north: 71.0,
      south: 34.8,
      east: 40.0,
      west: -24.5
    }
  }
};

// 🔧 UTILIDADES
export const simplifyFeatureName = (feature: any): string => {
  return feature.properties?.NAME || 
         feature.properties?.NAME_EN ||
         feature.properties?.ADMIN ||
         feature.properties?.name ||
         'Região Desconhecida';
}; 