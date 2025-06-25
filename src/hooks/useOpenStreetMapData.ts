import { useState, useEffect } from 'react';
import { 
  OSM_SOURCES,
  OVERPASS_CONFIG,
  getOSMSourceByZoomLevel,
  getOSMQueryWithBBox,
  getRegionalOSMQuery,
  OVERPASS_FALLBACK_QUERIES,
  OSM_CONTINENT_MAPPING,
  getOSMFeatureName,
  getOSMFeatureContinent,
  logOSMPerformance,
  validateOverpassData,
  convertOverpassToGeoJSON
} from '@/utils/openStreetMapSources';
import { osmMonitor } from '@/utils/osmMonitor';

// 🎯 TIPOS PARA OPENSTREETMAP
interface ProcessedOSMBoundary {
  name: string;
  type: string;
  coordinates: [number, number][][];
  properties: {
    name: string;
    name_en?: string;
    name_pt?: string;
    continent?: string;
    admin_level?: number;
    'ISO3166-1'?: string;
    population?: string;
    [key: string]: any;
  };
}

interface UseOpenStreetMapDataProps {
  zoom: number;
  mapBounds?: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  region?: string;
  countryCode?: string;
}

// 🌍 CACHE LOCAL PARA OTIMIZAÇÃO
const osmDataCache = new Map<string, {
  data: ProcessedOSMBoundary[];
  timestamp: number;
  ttl: number;
}>();

// 🌍 HOOK PRINCIPAL - OPENSTREETMAP VIA OVERPASS API
// 🔒 FILA GLOBAL DE REQUESTS PARA PREVENIR REQUESTS SIMULTÂNEOS
class GlobalRequestQueue {
  private static instance: GlobalRequestQueue;
  private queue: Array<() => Promise<any>> = [];
  private isProcessing: boolean = false;
  private lastRequestTime: number = 0;
  private consecutiveFailures: number = 0;
  private isCircuitBreakerOpen: boolean = false;
  private circuitBreakerResetTime: number = 0;

  static getInstance(): GlobalRequestQueue {
    if (!GlobalRequestQueue.instance) {
      GlobalRequestQueue.instance = new GlobalRequestQueue();
    }
    return GlobalRequestQueue.instance;
  }

  // 🚨 CIRCUIT BREAKER PARA EVITAR SPAM DE REQUESTS FALHADOS
  private checkCircuitBreaker(): boolean {
    const now = Date.now();
    
    // Se circuit breaker está aberto, verificar se é hora de tentar novamente
    if (this.isCircuitBreakerOpen) {
      if (now > this.circuitBreakerResetTime) {
        console.log('🔄 Circuit breaker: tentando novamente após cool-down');
        this.isCircuitBreakerOpen = false;
        this.consecutiveFailures = 0;
        return false;
      }
      console.log('⛔ Circuit breaker ativo: bloqueando requests OSM');
      return true;
    }
    
    // Se muitas falhas consecutivas, abrir circuit breaker
    if (this.consecutiveFailures >= 3) {
      this.isCircuitBreakerOpen = true;
      this.circuitBreakerResetTime = now + (5 * 60 * 1000); // 5 minutos
      console.log('🚨 Circuit breaker ativado: muitas falhas consecutivas');
      return true;
    }
    
    return false;
  }

  private recordSuccess() {
    this.consecutiveFailures = 0;
    osmMonitor.setCircuitBreakerStatus(false);
  }

  private recordFailure() {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= 3) {
      osmMonitor.setCircuitBreakerStatus(true);
    }
  }

  async enqueue<T>(requestFunction: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Verificar circuit breaker
      if (this.checkCircuitBreaker()) {
        reject(new Error('Circuit breaker ativo: OSM temporariamente desabilitado'));
        return;
      }

      this.queue.push(async () => {
        try {
          // Aplicar rate limiting global
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < OVERPASS_CONFIG.rateLimitDelay) {
            const waitTime = OVERPASS_CONFIG.rateLimitDelay - timeSinceLastRequest;
            console.log(`⏳ Rate limiting global: aguardando ${waitTime}ms...`);
            await new Promise(res => setTimeout(res, waitTime));
          }
          
          this.lastRequestTime = Date.now();
          const result = await requestFunction();
          this.recordSuccess(); // Marcar sucesso
          resolve(result);
        } catch (error) {
          this.recordFailure(); // Marcar falha
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const requestFunction = this.queue.shift()!;
      try {
        await requestFunction();
      } catch (error) {
        console.error('❌ Erro na fila de requests:', error);
      }
    }
    
    this.isProcessing = false;
  }
}

export const useOpenStreetMapData = ({ 
  zoom, 
  mapBounds, 
  region, 
  countryCode 
}: UseOpenStreetMapDataProps) => {
  const [boundaries, setBoundaries] = useState<ProcessedOSMBoundary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetType, setDatasetType] = useState<string>('');
  const requestQueue = GlobalRequestQueue.getInstance();

  // 🔄 SISTEMA DE RATE LIMITING REMOVIDO - AGORA USAMOS A FILA GLOBAL

  // 🎯 VERIFICAR CACHE
  const getCachedData = (cacheKey: string): ProcessedOSMBoundary[] | null => {
    const cached = osmDataCache.get(cacheKey);
    
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > cached.ttl * 60 * 1000;
      
      if (!isExpired) {
        console.log(`📦 Cache hit: ${cacheKey}`);
        return cached.data;
      } else {
        console.log(`⏰ Cache expirado: ${cacheKey}`);
        osmDataCache.delete(cacheKey);
      }
    }
    
    return null;
  };

  // 💾 SALVAR NO CACHE
  const setCachedData = (cacheKey: string, data: ProcessedOSMBoundary[], ttl: number) => {
    osmDataCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`💾 Dados salvos no cache: ${cacheKey} (TTL: ${ttl}min)`);
  };

  // 🔄 CONSULTAR OVERPASS API COM FALLBACK - USANDO FILA GLOBAL
  const queryOverpassAPI = async (query: string, retryCount = 0): Promise<any> => {
    return requestQueue.enqueue(async () => {
      const serverIndex = retryCount % OVERPASS_CONFIG.servers.length;
      const server = OVERPASS_CONFIG.servers[serverIndex];
      
      console.log(`📡 Consultando Overpass API (tentativa ${retryCount + 1}): ${server}`);
      osmMonitor.recordRequest();
      
      try {
        const startTime = performance.now();
        const response = await fetch(server, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`
        });

        if (!response.ok) {
          // Para erro 429, usar backoff exponencial
          if (response.status === 429) {
            const backoffDelay = Math.min(
              OVERPASS_CONFIG.rateLimitDelay * Math.pow(OVERPASS_CONFIG.backoffMultiplier, retryCount),
              OVERPASS_CONFIG.maxBackoffDelay
            );
            throw new Error(`HTTP 429: Rate limit exceeded. Backoff: ${backoffDelay}ms`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        const dataSize = new Blob([responseText]).size;
        const overpassData = JSON.parse(responseText);
        
        const loadTime = performance.now() - startTime;
        
        if (!validateOverpassData(overpassData)) {
          throw new Error('Resposta Overpass inválida');
        }

        logOSMPerformance(`Overpass API`, loadTime, dataSize, overpassData.elements.length);
        osmMonitor.recordSuccess(loadTime);
        
        return overpassData;
        
      } catch (err) {
        console.warn(`⚠️ Tentativa ${retryCount + 1} falhou:`, err);
        osmMonitor.recordFailure(err instanceof Error ? err.message : 'Erro desconhecido');
        
        if (retryCount < OVERPASS_CONFIG.maxRetries - 1) {
          // Calcular delay com backoff exponencial para erro 429
          let waitTime = OVERPASS_CONFIG.rateLimitDelay;
          
          if (err instanceof Error && err.message.includes('429')) {
            waitTime = Math.min(
              OVERPASS_CONFIG.rateLimitDelay * Math.pow(OVERPASS_CONFIG.backoffMultiplier, retryCount + 1),
              OVERPASS_CONFIG.maxBackoffDelay
            );
            console.log(`🚨 Rate limit detectado! Aguardando ${waitTime}ms antes de tentar novamente...`);
          } else {
            console.log(`🔄 Tentando novamente em ${waitTime}ms...`);
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return queryOverpassAPI(query, retryCount + 1);
        }
        
        throw new Error(`Todas as ${OVERPASS_CONFIG.maxRetries} tentativas falharam: ${err}`);
      }
    });
  };

  // 🌍 CARREGAR DADOS CONTINENTAIS (AGRUPADOS)
  const loadContinentData = async (): Promise<ProcessedOSMBoundary[]> => {
    console.log('🌍 Criando continentes a partir de países OSM...');
    
    const cacheKey = 'osm-continents';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      // Consultar países OSM admin_level=2
      const source = OSM_SOURCES[1]; // Countries
      const overpassData = await queryOverpassAPI(source.overpassQuery);
      const geoJsonData = convertOverpassToGeoJSON(overpassData);
      
      console.log(`📊 Processando ${geoJsonData.features.length} países OSM para criar continentes...`);
      
      // Agrupar países por continente
      const continentBoundaries: { [key: string]: any[] } = {};
      
      geoJsonData.features.forEach((feature: any) => {
        const continent = getOSMFeatureContinent(feature);
        
        if (continent !== 'Desconhecido') {
          if (!continentBoundaries[continent]) {
            continentBoundaries[continent] = [];
          }
          continentBoundaries[continent].push(feature);
        }
      });
      
      // Converter para formato processado
      const processedContinents: ProcessedOSMBoundary[] = Object.entries(continentBoundaries).map(([continentName, countries]) => ({
        name: continentName,
        type: 'continent',
        coordinates: [], // Será processado posteriormente se necessário
        properties: {
          name: continentName,
          name_en: continentName,
          continent: continentName,
          countries: countries.length,
          admin_level: 1
        }
      }));
      
      console.log(`✅ ${processedContinents.length} continentes criados com ${geoJsonData.features.length} países`);
      
      setCachedData(cacheKey, processedContinents, OSM_SOURCES[0].cacheTTL);
      return processedContinents;
      
    } catch (err) {
      console.error('❌ Erro ao carregar continentes OSM:', err);
      throw err;
    }
  };

  // 🎯 CARREGAR DADOS OSM PRINCIPAIS
  const loadOSMData = async (zoomLevel: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const source = getOSMSourceByZoomLevel(zoomLevel);
      setDatasetType(source.type);
      
      // Gerar chave de cache baseada nos parâmetros
      const cacheKey = `osm-${source.type}-${zoomLevel}-${mapBounds ? 
        `${mapBounds.south},${mapBounds.west},${mapBounds.north},${mapBounds.east}` : 
        'global'}-${region || ''}-${countryCode || ''}`;
      
      // Verificar cache primeiro
      const cached = getCachedData(cacheKey);
      if (cached) {
        setBoundaries(cached);
        setIsLoading(false);
        return;
      }
      
      console.log(`🌍 Carregando OSM - ${source.name} (Zoom ${zoomLevel})`);
      
      // CASO ESPECIAL: CONTINENTES
      if (source.type === 'continents') {
        const continentData = await loadContinentData();
        setBoundaries(continentData);
        setIsLoading(false);
        return;
      }
      
      // Determinar query a usar
      let query = source.overpassQuery;
      
      // Otimizar com bounding box se disponível
      if (mapBounds && zoomLevel >= 7) {
        query = getOSMQueryWithBBox(source.adminLevel, mapBounds);
        console.log(`🎯 Usando consulta otimizada por bounding box`);
      }
      
      // Otimizar por região/país se especificado
      if (countryCode || region) {
        query = getRegionalOSMQuery(source.adminLevel, countryCode, region);
        console.log(`🌍 Usando consulta regional: ${countryCode || region}`);
      }
      
      // Executar consulta
      const overpassData = await queryOverpassAPI(query);
      const geoJsonData = convertOverpassToGeoJSON(overpassData);
      
      console.log(`✅ OSM carregado: ${geoJsonData.features.length} features`);
      
      // Processar dados
      const processedData = processOSMData(geoJsonData, source.type);
      setBoundaries(processedData);
      
      // Salvar no cache
      setCachedData(cacheKey, processedData, source.cacheTTL);
      
    } catch (err) {
      console.error('❌ Erro ao carregar OSM:', err);
      
      // Verificar se é um erro de circuit breaker
      if (err instanceof Error && err.message.includes('Circuit breaker ativo')) {
        console.log('⛔ OSM temporariamente desabilitado pelo circuit breaker');
        setError('OSM temporariamente indisponível - usando apenas Natural Earth');
        setBoundaries([]);
        setIsLoading(false);
        return;
      }
      
      // Tentar fallback apenas se não for rate limit
      if (!(err instanceof Error && err.message.includes('429'))) {
        try {
          console.log('🔄 Tentando consulta simplificada...');
          const fallbackData = await tryFallbackQuery(zoomLevel);
          setBoundaries(fallbackData);
          setIsLoading(false);
          return;
        } catch (fallbackErr) {
          console.error('❌ Fallback também falhou:', fallbackErr);
        }
      }
      
      // Para erros 429, apenas log e continue com Natural Earth
      if (err instanceof Error && err.message.includes('429')) {
        console.log('⚠️ OSM rate limited - aplicação continuará apenas com Natural Earth');
        setError('OSM rate limited - usando apenas Natural Earth');
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
      
      setBoundaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 CONSULTA DE FALLBACK SIMPLIFICADA
  const tryFallbackQuery = async (zoomLevel: number): Promise<ProcessedOSMBoundary[]> => {
    const source = getOSMSourceByZoomLevel(zoomLevel);
    
    let fallbackQuery = '';
    
    switch (source.type) {
      case 'countries':
        fallbackQuery = OVERPASS_FALLBACK_QUERIES.simplifiedQueries.countries;
        break;
      case 'states':
        fallbackQuery = OVERPASS_FALLBACK_QUERIES.simplifiedQueries.states;
        break;
      case 'municipalities':
        fallbackQuery = OVERPASS_FALLBACK_QUERIES.simplifiedQueries.municipalities;
        break;
      default:
        throw new Error('Sem fallback disponível para este tipo');
    }
    
    const overpassData = await queryOverpassAPI(fallbackQuery);
    const geoJsonData = convertOverpassToGeoJSON(overpassData);
    
    return processOSMData(geoJsonData, source.type);
  };

  // 🔧 PROCESSAR DADOS OSM
  const processOSMData = (geoJsonData: any, dataType: string): ProcessedOSMBoundary[] => {
    console.log(`🔧 Processando ${geoJsonData.features.length} features OSM (${dataType})...`);
    
    const processed: ProcessedOSMBoundary[] = [];
    
    geoJsonData.features.forEach((feature: any, index: number) => {
      try {
        const processedFeature = processOSMFeature(feature, dataType);
        if (processedFeature) {
          processed.push(processedFeature);
        }
      } catch (err) {
        console.warn(`⚠️ Erro ao processar feature ${index}:`, err);
      }
    });
    
    console.log(`✅ ${processed.length}/${geoJsonData.features.length} features processadas`);
    return processed;
  };

  // 🔧 PROCESSAR FEATURE INDIVIDUAL OSM
  const processOSMFeature = (feature: any, dataType: string): ProcessedOSMBoundary | null => {
    const name = getOSMFeatureName(feature);
    
    if (!name || name === 'Região Desconhecida') {
      return null;
    }
    
    // Para municípios, filtrar apenas os relevantes (com população ou área significativa)
    if (dataType === 'municipalities') {
      const population = parseInt(feature.properties?.population || '0');
      const isCapital = feature.properties?.capital === 'yes';
      const isCity = feature.properties?.place === 'city';
      
      // Filtrar apenas municípios importantes
      if (population < 5000 && !isCapital && !isCity) {
        return null;
      }
    }
    
    return {
      name,
      type: dataType.slice(0, -1), // Remove 's' do final
      coordinates: [], // Geometria será processada conforme necessário
      properties: {
        name,
        name_en: feature.properties?.['name:en'],
        name_pt: feature.properties?.['name:pt'],
        continent: getOSMFeatureContinent(feature),
        admin_level: parseInt(feature.properties?.admin_level || '0'),
        'ISO3166-1': feature.properties?.['ISO3166-1'],
        population: feature.properties?.population,
        ...feature.properties
      }
    };
  };

  // 🔄 EFFECT PRINCIPAL
  useEffect(() => {
    if (zoom > 0) {
      loadOSMData(zoom);
    }
  }, [zoom, mapBounds, region, countryCode]);

  return {
    boundaries,
    isLoading,
    error,
    datasetType,
    // Utilitários
    clearCache: () => {
      osmDataCache.clear();
      console.log('🧹 Cache OSM limpo');
    },
    getCacheInfo: () => {
      const cacheEntries = Array.from(osmDataCache.entries()).map(([key, value]) => ({
        key,
        size: value.data.length,
        age: Math.round((Date.now() - value.timestamp) / 1000 / 60), // minutos
        ttl: value.ttl
      }));
      
      return {
        totalEntries: osmDataCache.size,
        entries: cacheEntries
      };
    }
  };
}; 