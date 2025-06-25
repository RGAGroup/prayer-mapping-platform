// 🌍 OPENSTREETMAP - FONTES DE DADOS VIA OVERPASS API
// Sistema unificado para consultar dados administrativos globais

export interface OSMDataSource {
  name: string;
  type: 'countries' | 'states' | 'municipalities' | 'continents';
  adminLevel: number;
  overpassQuery: string;
  description: string;
  pros: string[];
  cons: string[];
  zoomLevels: number[];
  cacheTTL: number; // Cache time-to-live em minutos
}

// 🔧 CONFIGURAÇÃO OVERPASS API - MAIS AGRESSIVA PARA EVITAR 429
export const OVERPASS_CONFIG = {
  // Servidores Overpass API públicos (com fallback)
  servers: [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter'
  ],
  
  // Configurações de timeout e limites
  timeout: 180, // segundos
  maxSize: 1073741824, // 1GB em bytes
  
  // Configurações de rate limiting - MUITO MAIS CONSERVADOR
  rateLimitDelay: 15000, // 15 segundos entre requests (era 5 segundos)
  maxRetries: 2, // Máximo 2 tentativas
  
  // Configurações para evitar 429
  backoffMultiplier: 3, // Multiplicador mais agressivo
  maxBackoffDelay: 60000, // Máximo 60 segundos de espera
  
  // Rate limiting global para prevenir requests simultâneos
  globalRateLimit: true,
  maxConcurrentRequests: 1 // Apenas 1 request por vez
};

// 🌍 FONTES OPENSTREETMAP POR NÍVEL ADMINISTRATIVO
export const OSM_SOURCES: OSMDataSource[] = [
  // 🌍 CONTINENTES (Zoom 1-3) - Agrupamento de países admin_level=2
  {
    name: 'OSM Countries for Continents',
    type: 'continents',
    adminLevel: 2,
    overpassQuery: `
      [out:json][timeout:180];
      (
        relation[admin_level=2][boundary=administrative][name];
      );
      out geom;
    `,
    description: 'Países OSM admin_level=2 (agrupados por continente)',
    pros: ['Dados atualizados', 'Cobertura global', 'Fronteiras oficiais', 'Metadados ricos'],
    cons: ['Requer agrupamento por continente', 'Processamento adicional'],
    zoomLevels: [1, 2, 3],
    cacheTTL: 1440 // 24 horas
  },

  // 🏳️ PAÍSES (Zoom 4-6) - admin_level=2
  {
    name: 'OSM Countries',
    type: 'countries',
    adminLevel: 2,
    overpassQuery: `
      [out:json][timeout:180];
      (
        relation[admin_level=2][boundary=administrative][name];
      );
      out geom;
    `,
    description: 'Países do mundo OSM admin_level=2',
    pros: ['Dados oficiais OSM', 'Atualizações em tempo real', 'Fronteiras precisas', 'Metadados completos'],
    cons: ['Consulta pode ser lenta', 'Dependente da Overpass API'],
    zoomLevels: [4, 5, 6],
    cacheTTL: 720 // 12 horas
  },

  // 🏛️ ESTADOS/PROVÍNCIAS (Zoom 7-9) - admin_level=4
  {
    name: 'OSM States/Provinces',
    type: 'states',
    adminLevel: 4,
    overpassQuery: `
      [out:json][timeout:180];
      (
        relation[admin_level=4][boundary=administrative][name];
      );
      out geom;
    `,
    description: 'Estados e províncias OSM admin_level=4',
    pros: ['Divisões administrativas reais', 'Cobertura global', 'Dados comunitários', 'Atualizações frequentes'],
    cons: ['Volume de dados grande', 'Qualidade varia por região'],
    zoomLevels: [7, 8, 9],
    cacheTTL: 360 // 6 horas
  },

  // 🏙️ MUNICÍPIOS/CIDADES (Zoom 10+) - admin_level=8
  {
    name: 'OSM Municipalities/Cities',
    type: 'municipalities',
    adminLevel: 8,
    overpassQuery: `
      [out:json][timeout:180];
      (
        relation[admin_level=8][boundary=administrative][name];
      );
      out geom;
    `,
    description: 'Municípios e cidades OSM admin_level=8',
    pros: ['Cobertura global de municípios', 'Dados detalhados', 'Comunidade ativa', 'Fronteiras reais'],
    cons: ['Volume muito grande', 'Consultas lentas', 'Necessita paginação'],
    zoomLevels: [10, 11, 12, 13, 14, 15],
    cacheTTL: 180 // 3 horas
  }
];

// 🎯 CONSULTAS OTIMIZADAS POR BOUNDING BOX
export const getOSMQueryWithBBox = (
  adminLevel: number, 
  bbox: { south: number; west: number; north: number; east: number }
): string => {
  return `
    [out:json][timeout:180];
    (
      relation[admin_level=${adminLevel}][boundary=administrative][name](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out geom;
  `;
};

// 🌍 CONSULTAS REGIONAIS ESPECÍFICAS
export const getRegionalOSMQuery = (
  adminLevel: number,
  countryCode?: string,
  region?: string
): string => {
  let areaFilter = '';
  
  if (countryCode) {
    areaFilter = `area["ISO3166-1"="${countryCode}"];`;
  } else if (region) {
    areaFilter = `area[name="${region}"];`;
  }

  return `
    [out:json][timeout:180];
    ${areaFilter}
    (
      relation[admin_level=${adminLevel}][boundary=administrative][name]${areaFilter ? '(area)' : ''};
    );
    out geom;
  `;
};

// 🔄 SISTEMA DE FALLBACK PARA OVERPASS API
export const OVERPASS_FALLBACK_QUERIES = {
  // Se admin_level específico falhar, tentar níveis próximos
  fallbackLevels: {
    2: [2], // Países: apenas admin_level=2
    4: [4, 3, 5], // Estados: tentar 4, depois 3, depois 5
    8: [8, 7, 9, 6] // Municípios: tentar 8, depois 7, 9, 6
  },
  
  // Consultas simplificadas para fallback
  simplifiedQueries: {
    countries: `
      [out:json][timeout:60];
      (
        relation[admin_level=2][name];
      );
      out geom;
    `,
    
    states: `
      [out:json][timeout:60];
      (
        relation[admin_level=4][name];
      );
      out geom;
    `,
    
    municipalities: `
      [out:json][timeout:60];
      (
        relation[admin_level=8][name];
      );
      out geom;
    `
  }
};

// 🎯 OBTER FONTE OSM POR ZOOM LEVEL
export const getOSMSourceByZoomLevel = (zoomLevel: number): OSMDataSource => {
  if (zoomLevel <= 3) {
    return OSM_SOURCES[0]; // Continentes
  } else if (zoomLevel <= 6) {
    return OSM_SOURCES[1]; // Países
  } else if (zoomLevel <= 9) {
    return OSM_SOURCES[2]; // Estados
  } else {
    return OSM_SOURCES[3]; // Municípios
  }
};

// 🌍 MAPEAMENTO DE CONTINENTES PARA OSM
export const OSM_CONTINENT_MAPPING = {
  'South America': {
    name_pt: 'América do Sul',
    name_en: 'South America',
    countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname', 'French Guiana'],
    isoCodes: ['BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF']
  },
  'North America': {
    name_pt: 'América do Norte',
    name_en: 'North America', 
    countries: ['United States', 'Canada', 'Mexico', 'Guatemala', 'Cuba', 'Haiti', 'Dominican Republic', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama'],
    isoCodes: ['US', 'CA', 'MX', 'GT', 'CU', 'HT', 'DO', 'HN', 'NI', 'CR', 'PA']
  },
  'Europe': {
    name_pt: 'Europa',
    name_en: 'Europe',
    countries: ['Germany', 'France', 'Spain', 'Italy', 'United Kingdom', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Greece', 'Portugal'],
    isoCodes: ['DE', 'FR', 'ES', 'IT', 'GB', 'PL', 'RO', 'NL', 'BE', 'GR', 'PT']
  },
  'Africa': {
    name_pt: 'África',
    name_en: 'Africa',
    countries: ['Nigeria', 'Ethiopia', 'Egypt', 'South Africa', 'Kenya', 'Uganda', 'Algeria', 'Sudan', 'Morocco', 'Angola'],
    isoCodes: ['NG', 'ET', 'EG', 'ZA', 'KE', 'UG', 'DZ', 'SD', 'MA', 'AO']
  },
  'Asia': {
    name_pt: 'Ásia',
    name_en: 'Asia',
    countries: ['China', 'India', 'Indonesia', 'Pakistan', 'Bangladesh', 'Japan', 'Philippines', 'Vietnam', 'Turkey', 'Iran'],
    isoCodes: ['CN', 'IN', 'ID', 'PK', 'BD', 'JP', 'PH', 'VN', 'TR', 'IR']
  },
  'Oceania': {
    name_pt: 'Oceania',
    name_en: 'Oceania',
    countries: ['Australia', 'Papua New Guinea', 'New Zealand', 'Fiji', 'Solomon Islands'],
    isoCodes: ['AU', 'PG', 'NZ', 'FJ', 'SB']
  }
};

// 🔧 UTILIDADES OSM
export const getOSMFeatureName = (feature: any): string => {
  const props = feature.properties || {};
  return props.name || 
         props['name:en'] || 
         props['name:pt'] || 
         props.official_name ||
         props.short_name ||
         'Região Desconhecida';
};

export const getOSMFeatureContinent = (feature: any): string => {
  const name = getOSMFeatureName(feature);
  const props = feature.properties || {};
  
  // Tentar usar ISO code primeiro
  if (props['ISO3166-1'] || props.iso_code) {
    const isoCode = props['ISO3166-1'] || props.iso_code;
    for (const [continentCode, continent] of Object.entries(OSM_CONTINENT_MAPPING)) {
      if (continent.isoCodes.includes(isoCode)) {
        return continent.name_pt;
      }
    }
  }
  
  // Fallback: usar nome do país
  for (const [continentCode, continent] of Object.entries(OSM_CONTINENT_MAPPING)) {
    if (continent.countries.some(country => 
      name.toLowerCase().includes(country.toLowerCase()) ||
      country.toLowerCase().includes(name.toLowerCase())
    )) {
      return continent.name_pt;
    }
  }
  
  return 'Desconhecido';
};

// 📊 PERFORMANCE E CACHE
export const logOSMPerformance = (sourceName: string, loadTime: number, dataSize: number, featureCount: number) => {
  console.log(`📊 Performance OSM - ${sourceName}:`, {
    loadTime: `${Math.round(loadTime)}ms`,
    dataSize: `${(dataSize / 1024).toFixed(2)}KB`,
    features: featureCount,
    efficiency: `${(featureCount / (loadTime / 1000)).toFixed(2)} features/sec`
  });
};

// ✅ VALIDAÇÃO OVERPASS RESPONSE
export const validateOverpassData = (data: any): boolean => {
  return data && 
         Array.isArray(data.elements) && 
         data.elements.length > 0;
};

// 🎯 CONVERSÃO OVERPASS PARA GEOJSON
export const convertOverpassToGeoJSON = (overpassData: any): any => {
  if (!validateOverpassData(overpassData)) {
    throw new Error('Dados Overpass inválidos');
  }

  const features = overpassData.elements
    .filter((element: any) => element.type === 'relation' && element.members)
    .map((relation: any) => ({
      type: 'Feature',
      properties: {
        id: relation.id,
        admin_level: relation.tags?.admin_level,
        name: relation.tags?.name,
        'name:en': relation.tags?.['name:en'],
        'name:pt': relation.tags?.['name:pt'],
        'ISO3166-1': relation.tags?.['ISO3166-1'],
        boundary: relation.tags?.boundary,
        type: relation.tags?.type,
        population: relation.tags?.population,
        ...relation.tags
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [] // Será processado posteriormente
      }
    }));

  return {
    type: 'FeatureCollection',
    features
  };
}; 