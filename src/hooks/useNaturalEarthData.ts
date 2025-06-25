import { useState, useEffect } from 'react';
import { 
  NATURAL_EARTH_SOURCES, 
  getSourceByZoomLevel, 
  CONTINENT_GROUPS, 
  getFeatureName, 
  getFeatureContinent,
  logDataSourcePerformance, 
  validateGeoJSONData 
} from '@/utils/naturalEarthSources';

// 🎯 TIPOS SIMPLIFICADOS
interface ProcessedBoundary {
  name: string;
  type: string;
  coordinates: [number, number][][];
  properties: {
    name: string;
    name_en?: string;
    continent?: string;
    [key: string]: any;
  };
}

interface UseNaturalEarthDataProps {
  zoom: number;
}

// 🌍 HOOK PRINCIPAL - APENAS NATURAL EARTH
export const useNaturalEarthData = ({ zoom }: UseNaturalEarthDataProps) => {
  const [boundaries, setBoundaries] = useState<ProcessedBoundary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetType, setDatasetType] = useState<string>('');

  // 🔄 CARREGAR COM SISTEMA DE FALLBACK
  const loadWithFallback = async (source: any, zoomLevel: number): Promise<any | null> => {
    // URLs de fallback para cada tipo
    const fallbackUrls: { [key: string]: string[] } = {
      'continents': [
        source.url, // URL original
        'https://cdn.jsdelivr.net/npm/world-atlas@3/countries-110m.json',
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
      ],
      'countries': [
        source.url, // URL original
        'https://cdn.jsdelivr.net/npm/world-atlas@3/countries-50m.json',
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
      ],
      'states': [
        source.url, // URL original
        'https://cdn.jsdelivr.net/npm/world-atlas@3/countries-50m.json' // Fallback para países
      ],
      'cities': [
        source.url, // URL original
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson' // Fallback para países
      ]
    };

    const urls = fallbackUrls[source.type] || [source.url];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const isOriginal = i === 0;
      
      try {
        console.log(`📡 Tentativa ${i + 1}/${urls.length}: ${isOriginal ? source.name : `Fallback ${i}`}`);
        
        const startTime = performance.now();
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        const dataSize = new Blob([responseText]).size;
        const geoJsonData = JSON.parse(responseText);
        
        const loadTime = performance.now() - startTime;
        
        if (isOriginal) {
          logDataSourcePerformance(source.name, loadTime, dataSize);
        } else {
          console.log(`📊 Fallback ${i} - ${Math.round(loadTime)}ms, ${(dataSize / 1024).toFixed(2)}KB`);
        }
        
        if (!validateGeoJSONData(geoJsonData)) {
          throw new Error('Dados GeoJSON inválidos');
        }
        
        console.log(`✅ ${isOriginal ? 'Fonte original' : `Fallback ${i}`} funcionou: ${geoJsonData.features.length} features`);
        return geoJsonData;
        
      } catch (err) {
        console.warn(`⚠️ Tentativa ${i + 1} falhou:`, err);
        if (i === urls.length - 1) {
          console.error(`❌ Todas as ${urls.length} tentativas falharam para ${source.type}`);
        }
      }
    }
    
    return null;
  };

  // 🎯 CARREGAR DADOS NATURAL EARTH
  const loadNaturalEarthData = async (zoomLevel: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const source = getSourceByZoomLevel(zoomLevel);
      setDatasetType(source.type);
      
      console.log(`🌍 Carregando Natural Earth - ${source.name} (Zoom ${zoomLevel})`);
      
      // CASO ESPECIAL: CONTINENTES
      if (source.type === 'continents') {
        const continentData = await loadContinentData();
        setBoundaries(continentData);
        setIsLoading(false);
        return;
      }
      
      // CARREGAR DADOS COM SISTEMA DE FALLBACK
      const geoJsonData = await loadWithFallback(source, zoomLevel);
      
      if (!geoJsonData) {
        throw new Error('Todas as fontes falharam');
      }
      
      console.log(`✅ Natural Earth carregado: ${geoJsonData.features.length} features`);
      
      // PROCESSAR DADOS
      const processedData = processNaturalEarthData(geoJsonData, source.type);
      setBoundaries(processedData);
      
    } catch (err) {
      console.error('❌ Erro ao carregar Natural Earth:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setBoundaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 CLASSIFICAR PAÍS POR NOME (FALLBACK)
  const classifyByCountryName = (countryName: string): string => {
    const name = countryName.toLowerCase();
    
    // América do Sul
    if (['brazil', 'argentina', 'chile', 'peru', 'colombia', 'venezuela', 'ecuador', 'bolivia', 'paraguay', 'uruguay', 'guyana', 'suriname', 'french guiana'].some(c => name.includes(c))) {
      return 'América do Sul';
    }
    
    // América do Norte
    if (['united states', 'canada', 'mexico', 'guatemala', 'belize', 'costa rica', 'panama', 'honduras', 'nicaragua', 'el salvador', 'cuba', 'haiti', 'dominican republic', 'jamaica', 'trinidad', 'barbados', 'bahamas'].some(c => name.includes(c))) {
      return 'América do Norte';
    }
    
    // Europa
    if (['germany', 'france', 'spain', 'italy', 'united kingdom', 'poland', 'romania', 'netherlands', 'belgium', 'greece', 'portugal', 'czech', 'hungary', 'sweden', 'austria', 'switzerland', 'bulgaria', 'serbia', 'denmark', 'finland', 'slovakia', 'norway', 'ireland', 'bosnia', 'croatia', 'albania', 'lithuania', 'slovenia', 'latvia', 'estonia', 'macedonia', 'moldova', 'luxembourg', 'malta', 'iceland', 'montenegro', 'belarus', 'ukraine', 'russia'].some(c => name.includes(c))) {
      return 'Europa';
    }
    
    // África
    if (['south africa', 'nigeria', 'egypt', 'ethiopia', 'kenya', 'uganda', 'algeria', 'sudan', 'morocco', 'angola', 'ghana', 'mozambique', 'madagascar', 'cameroon', 'ivory coast', 'burkina faso', 'mali', 'malawi', 'zambia', 'senegal', 'somalia', 'chad', 'zimbabwe', 'guinea', 'rwanda', 'benin', 'tunisia', 'burundi', 'togo', 'sierra leone', 'libya', 'liberia', 'central african', 'mauritania', 'eritrea', 'gambia', 'botswana', 'namibia', 'gabon', 'lesotho', 'guinea-bissau', 'equatorial guinea', 'mauritius', 'swaziland', 'djibouti', 'comoros', 'cape verde', 'sao tome'].some(c => name.includes(c))) {
      return 'África';
    }
    
    // Ásia
    if (['china', 'india', 'indonesia', 'pakistan', 'bangladesh', 'japan', 'philippines', 'vietnam', 'turkey', 'iran', 'thailand', 'myanmar', 'south korea', 'iraq', 'afghanistan', 'uzbekistan', 'malaysia', 'nepal', 'yemen', 'north korea', 'sri lanka', 'kazakhstan', 'cambodia', 'jordan', 'azerbaijan', 'tajikistan', 'israel', 'laos', 'singapore', 'lebanon', 'kyrgyzstan', 'turkmenistan', 'syria', 'armenia', 'mongolia', 'georgia', 'kuwait', 'qatar', 'bahrain', 'brunei', 'bhutan', 'maldives', 'oman', 'palestine', 'saudi arabia'].some(c => name.includes(c))) {
      return 'Ásia';
    }
    
    // Oceania
    if (['australia', 'new zealand', 'papua new guinea', 'fiji', 'solomon islands', 'vanuatu', 'samoa', 'micronesia', 'tonga', 'kiribati', 'palau', 'marshall islands', 'tuvalu', 'nauru'].some(c => name.includes(c))) {
      return 'Oceania';
    }
    
    return 'Desconhecido';
  };

  // 🌍 DADOS DE CONTINENTES (AGRUPADOS A PARTIR DOS PAÍSES)
  const loadContinentData = async (): Promise<ProcessedBoundary[]> => {
    console.log('🌍 Criando continentes a partir de 177 países Natural Earth...');
    
    try {
      // Carregar países Natural Earth 110m para agrupar por continente
      const response = await fetch(NATURAL_EARTH_SOURCES[0].url);
      if (!response.ok) throw new Error('Erro ao carregar países para continentes');
      
      const geoJsonData = await response.json();
      if (!validateGeoJSONData(geoJsonData)) throw new Error('Dados inválidos');
      
      console.log(`📊 Processando ${geoJsonData.features.length} países para criar continentes...`);
      
      // Agrupar países por continente usando propriedade CONTINENT
      const continentBoundaries: { [key: string]: any[] } = {};
      
      // Primeiro, vamos analisar todas as propriedades disponíveis
      console.log('🔍 Analisando propriedades dos países para classificação...');
      const sampleFeature = geoJsonData.features[0];
      if (sampleFeature?.properties) {
        console.log('📋 Propriedades disponíveis:', Object.keys(sampleFeature.properties));
      }
      
      geoJsonData.features.forEach((feature: any, index: number) => {
        const countryName = getFeatureName(feature);
        
        // Usar múltiplas propriedades para classificar continente
        let continent = feature.properties?.CONTINENT || 
                       feature.properties?.continent ||
                       feature.properties?.REGION_WB ||
                       feature.properties?.SUBREGION ||
                       getFeatureContinent(feature);
        
        // Mapear variações de nomes para português
        const continentMap: { [key: string]: string } = {
          // Nomes padrão
          'South America': 'América do Sul',
          'North America': 'América do Norte', 
          'Europe': 'Europa',
          'Africa': 'África',
          'Asia': 'Ásia',
          'Oceania': 'Oceania',
          'Antarctica': 'Antártida',
          
          // Variações do World Bank
          'Latin America & Caribbean': 'América do Sul',
          'Europe & Central Asia': 'Europa',
          'Sub-Saharan Africa': 'África',
          'Middle East & North Africa': 'África',
          'East Asia & Pacific': 'Ásia',
          'South Asia': 'Ásia',
          
          // Variações de sub-regiões
          'Northern America': 'América do Norte',
          'Central America': 'América do Norte',
          'Caribbean': 'América do Norte',
          'Southern America': 'América do Sul',
          'Northern Europe': 'Europa',
          'Western Europe': 'Europa',
          'Eastern Europe': 'Europa',
          'Southern Europe': 'Europa',
          'Northern Africa': 'África',
          'Western Africa': 'África',
          'Eastern Africa': 'África',
          'Middle Africa': 'África',
          'Southern Africa': 'África',
          'Western Asia': 'Ásia',
          'Central Asia': 'Ásia',
          'Eastern Asia': 'Ásia',
          'South-Eastern Asia': 'Ásia',
          'Southern Asia': 'Ásia',
          'Australia and New Zealand': 'Oceania',
          'Melanesia': 'Oceania',
          'Micronesia': 'Oceania',
          'Polynesia': 'Oceania'
        };
        
        continent = continentMap[continent] || continent;
        
        // Se ainda não classificou, tentar por nome do país
        if (!continent || continent === 'Desconhecido' || continent === continent.toLowerCase()) {
          continent = classifyByCountryName(countryName);
        }
        
        if (continent && continent !== 'Desconhecido') {
          if (!continentBoundaries[continent]) {
            continentBoundaries[continent] = [];
          }
          continentBoundaries[continent].push(feature);
          
          if (continentBoundaries[continent].length <= 5) {
            console.log(`📍 ${continent}: ${countryName}`);
          }
        } else {
          console.warn(`⚠️ País não classificado: ${countryName} (propriedades: ${JSON.stringify(feature.properties)})`);
        }
      });
      
      // Mostrar resumo da classificação
      const totalCountries = geoJsonData.features.length;
      const classifiedCountries = Object.values(continentBoundaries).reduce((acc, countries) => acc + countries.length, 0);
      const unclassifiedCount = totalCountries - classifiedCountries;
      
      console.log(`📊 Classificação completa:`);
      console.log(`   Total países: ${totalCountries}`);
      console.log(`   Classificados: ${classifiedCountries}`);
      console.log(`   Não classificados: ${unclassifiedCount}`);
      
      Object.entries(continentBoundaries).forEach(([continent, countries]) => {
        console.log(`   ${continent}: ${countries.length} países`);
      });
      
      // Criar continentes usando geometrias reais dos países (não quadrados!)
      const continents: ProcessedBoundary[] = [];
      
      Object.entries(continentBoundaries).forEach(([continentName, countries]) => {
        if (countries.length > 0) {
          console.log(`🌍 Criando continente real: ${continentName} (${countries.length} países)`);
          
          // Coletar todas as coordenadas dos países do continente
          const allCoordinates: [number, number][][] = [];
          
          countries.forEach(country => {
            const processedCountry = processFeatureGeometry(country, 'country');
            if (processedCountry && processedCountry.coordinates) {
              // Adicionar todas as coordenadas do país
              allCoordinates.push(...processedCountry.coordinates);
            }
          });
          
          if (allCoordinates.length > 0) {
            // Usar as geometrias reais dos países como continente
            continents.push({
              name: continentName,
              type: 'continent',
              coordinates: allCoordinates, // Múltiplos polígonos dos países
              properties: {
                name: continentName,
                name_en: continentName,
                continent: continentName,
                countries: countries.length,
                polygons: allCoordinates.length
              }
            });
            
            console.log(`✅ ${continentName}: ${countries.length} países, ${allCoordinates.length} polígonos reais`);
          }
        }
      });
      
      console.log(`🎉 Continentes criados: ${continents.length}`);
      continents.forEach(c => console.log(`  - ${c.name}: ${c.properties.countries} países`));
      
      return continents;
      
    } catch (error) {
      console.error('❌ Erro ao criar continentes:', error);
      return [];
    }
  };

  // 🔄 PROCESSAR DADOS NATURAL EARTH
  const processNaturalEarthData = (geoJsonData: any, dataType: string): ProcessedBoundary[] => {
    console.log(`🔄 Processando ${geoJsonData.features.length} features Natural Earth (${dataType})`);
    
    const processed: ProcessedBoundary[] = [];

    geoJsonData.features.forEach((feature: any) => {
      const processedFeature = processFeatureGeometry(feature, dataType);
      if (processedFeature) {
        processed.push(processedFeature);
      }
    });

    console.log(`🎉 Natural Earth processado: ${processed.length} regiões válidas`);
    return processed;
  };

  // 🔧 PROCESSAR GEOMETRIA DE FEATURE (COM VALIDAÇÃO ROBUSTA)
  const processFeatureGeometry = (feature: any, dataType: string): ProcessedBoundary | null => {
    try {
      const name = getFeatureName(feature);
      
      // 🧊 FILTRO PARA ANTÁRTIDA - DESABILITAR TEMPORARIAMENTE
      if (name && (
        name.toLowerCase().includes('antarctica') || 
        name.toLowerCase().includes('antártica') ||
        name.toLowerCase().includes('antarctic')
      )) {
        console.log('🧊 Antártida filtrada e removida dos dados');
        return null;
      }
      
      if (!feature.geometry || !feature.geometry.coordinates) {
        console.warn('⚠️ Feature sem geometria:', name);
        return null;
      }

      let coordinates: [number, number][][];

      // Processar diferentes tipos de geometria
      if (feature.geometry.type === 'Polygon') {
        coordinates = feature.geometry.coordinates;
        
        // Validar coordenadas do polígono
        if (!validatePolygonCoordinates(coordinates, name)) {
          return null;
        }
        
      } else if (feature.geometry.type === 'MultiPolygon') {
        // Para MultiPolygon, pegar todos os polígonos válidos
        const multiCoords = feature.geometry.coordinates;
        if (multiCoords.length === 0) {
          console.warn('⚠️ MultiPolygon vazio:', name);
          return null;
        }
        
        // Validar e filtrar polígonos válidos
        const validPolygons = multiCoords.filter((polygon: any) => {
          return polygon && polygon.length > 0 && validatePolygonCoordinates(polygon, name);
        });
        
        if (validPolygons.length === 0) {
          console.warn('⚠️ Nenhum polígono válido em MultiPolygon:', name);
          return null;
        }
        
        // Usar o maior polígono válido
        coordinates = validPolygons.reduce((largest: any, current: any) => {
          return current[0].length > largest[0].length ? current : largest;
        });
        
        console.log(`🗺️ MultiPolygon ${name}: ${validPolygons.length} polígonos válidos, usando o maior (${coordinates[0].length} pontos)`);
        
      } else if (feature.geometry.type === 'Point') {
        // Para cidades - criar pequeno polígono baseado na população
        const [lng, lat] = feature.geometry.coordinates;
        
        // Validar coordenadas do ponto
        if (typeof lng !== 'number' || typeof lat !== 'number' || 
            lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          console.warn('⚠️ Coordenadas de ponto inválidas:', name, lng, lat);
          return null;
        }
        
        // Tamanho baseado na população da cidade
        const population = feature.properties?.POP_MAX || feature.properties?.population || 0;
        let size = 0.02; // Tamanho padrão
        
        if (population > 10000000) size = 0.15;      // Megacidades
        else if (population > 5000000) size = 0.12;  // Grandes cidades
        else if (population > 1000000) size = 0.08;  // Cidades grandes
        else if (population > 500000) size = 0.05;   // Cidades médias
        else if (population > 100000) size = 0.03;   // Cidades pequenas
        
        coordinates = [[
          [lng - size, lat - size],
          [lng + size, lat - size],
          [lng + size, lat + size],
          [lng - size, lat + size],
          [lng - size, lat - size]
        ]];
        
        // Log para debug de cidades grandes
        if (population > 1000000) {
          console.log(`🏙️ Cidade grande: ${name} (${population.toLocaleString()} hab.) - Tamanho: ${size}°`);
        }
      } else {
        console.warn('⚠️ Tipo de geometria não suportado:', feature.geometry.type, 'para:', name);
        return null;
      }

      return {
        name,
        type: dataType,
        coordinates,
        properties: {
          name,
          name_en: feature.properties?.NAME_EN || name,
          continent: getFeatureContinent(feature),
          geometryType: feature.geometry.type,
          coordinateCount: coordinates[0]?.length || 0,
          ...feature.properties
        }
      };

    } catch (err) {
      console.error('❌ Erro ao processar feature:', err);
      return null;
    }
  };

  // 🔍 VALIDAR COORDENADAS DE POLÍGONO
  const validatePolygonCoordinates = (coordinates: any, countryName: string): boolean => {
    try {
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        console.warn(`⚠️ ${countryName}: Coordenadas não são array válido`);
        return false;
      }
      
      const ring = coordinates[0]; // Primeiro anel (exterior)
      if (!Array.isArray(ring) || ring.length < 4) {
        console.warn(`⚠️ ${countryName}: Anel exterior inválido (${ring?.length || 0} pontos)`);
        return false;
      }
      
      // Verificar se coordenadas são válidas
      let validCoords = 0;
      for (const coord of ring) {
        if (Array.isArray(coord) && coord.length >= 2) {
          const [lng, lat] = coord;
          if (typeof lng === 'number' && typeof lat === 'number' &&
              lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
            validCoords++;
          }
        }
      }
      
      const validPercent = (validCoords / ring.length) * 100;
      if (validPercent < 80) {
        console.warn(`⚠️ ${countryName}: Apenas ${validPercent.toFixed(1)}% das coordenadas são válidas (${validCoords}/${ring.length})`);
        return false;
      }
      
      if (validPercent < 100) {
        console.log(`⚠️ ${countryName}: ${validPercent.toFixed(1)}% coordenadas válidas (${validCoords}/${ring.length}) - usando mesmo assim`);
      }
      
      return true;
      
    } catch (err) {
      console.error(`❌ Erro ao validar coordenadas de ${countryName}:`, err);
      return false;
    }
  };

  // 🚀 EFEITO PRINCIPAL
  useEffect(() => {
    loadNaturalEarthData(zoom);
  }, [zoom]);

  return {
    boundaries,
    isLoading,
    error,
    datasetType,
    reload: () => loadNaturalEarthData(zoom)
  };
}; 