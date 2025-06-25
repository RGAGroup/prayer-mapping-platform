// 🔧 SISTEMA DE FALLBACK PARA LIMITAÇÕES DE LIMITES GEOGRÁFICOS
// Este arquivo contém estratégias alternativas quando a API Natural Earth apresenta problemas

export interface BoundaryFallbackConfig {
  enableSimplification: boolean;
  maxCoordinatesPerPolygon: number;
  fallbackToSimpleBounds: boolean;
  retryAttempts: number;
  timeoutMs: number;
}

export const DEFAULT_FALLBACK_CONFIG: BoundaryFallbackConfig = {
  enableSimplification: true,
  maxCoordinatesPerPolygon: 1000,
  fallbackToSimpleBounds: true,
  retryAttempts: 3,
  timeoutMs: 10000
};

// 🌍 DADOS DE FALLBACK PARA PAÍSES PROBLEMÁTICOS
export const COUNTRY_FALLBACK_BOUNDS = {
  // Países com geometrias muito complexas que podem falhar
  'Russia': {
    bounds: { north: 81.857361, south: 41.188862, east: -169.05, west: 19.66064 },
    center: { lat: 61.52401, lng: 105.318756 },
    simplified: true
  },
  'Canada': {
    bounds: { north: 83.23324, south: 41.676555, east: -52.636291, west: -141.00187 },
    center: { lat: 56.130366, lng: -106.346771 },
    simplified: true
  },
  'United States of America': {
    bounds: { north: 71.538800, south: 18.91619, east: -66.96466, west: -179.148909 },
    center: { lat: 39.50, lng: -98.35 },
    simplified: true
  },
  'Brazil': {
    bounds: { north: 5.271841, south: -33.750706, east: -28.835945, west: -73.982817 },
    center: { lat: -14.235004, lng: -51.92528 },
    simplified: false
  },
  'China': {
    bounds: { north: 53.56, south: 15.78, east: 134.77, west: 73.56 },
    center: { lat: 35.86166, lng: 104.195397 },
    simplified: true
  },
  'Australia': {
    bounds: { north: -9.142176, south: -54.777, east: 159.109219, west: 112.921114 },
    center: { lat: -25.274398, lng: 133.775136 },
    simplified: false
  }
};

// 🔧 SIMPLIFICAR COORDENADAS DE POLÍGONO COMPLEXO
export const simplifyPolygonCoordinates = (
  coordinates: [number, number][][], 
  maxPoints: number = 500
): [number, number][][] => {
  if (!coordinates || coordinates.length === 0) return coordinates;
  
  const ring = coordinates[0];
  if (!ring || ring.length <= maxPoints) return coordinates;
  
  console.log(`🔧 Simplificando polígono: ${ring.length} → ${maxPoints} pontos`);
  
  // Algoritmo simples de decimação: pegar pontos em intervalos regulares
  const step = Math.ceil(ring.length / maxPoints);
  const simplifiedRing: [number, number][] = [];
  
  for (let i = 0; i < ring.length; i += step) {
    simplifiedRing.push(ring[i]);
  }
  
  // Garantir que o polígono seja fechado
  if (simplifiedRing[0] !== simplifiedRing[simplifiedRing.length - 1]) {
    simplifiedRing.push(simplifiedRing[0]);
  }
  
  return [simplifiedRing];
};

// 🎯 CRIAR POLÍGONO SIMPLES BASEADO EM BOUNDS
export const createSimpleBoundsPolygon = (
  countryName: string
): [number, number][][] | null => {
  const bounds = COUNTRY_FALLBACK_BOUNDS[countryName as keyof typeof COUNTRY_FALLBACK_BOUNDS];
  if (!bounds) return null;
  
  const { north, south, east, west } = bounds.bounds;
  
  return [[
    [west, south],   // SW
    [east, south],   // SE  
    [east, north],   // NE
    [west, north],   // NW
    [west, south]    // Close
  ]];
};

// 🔄 TENTAR MÚLTIPLAS ESTRATÉGIAS DE CARREGAMENTO
export const loadBoundaryWithFallback = async (
  countryName: string,
  originalCoordinates: [number, number][][],
  config: BoundaryFallbackConfig = DEFAULT_FALLBACK_CONFIG
): Promise<[number, number][][] | null> => {
  
  // Estratégia 1: Usar coordenadas originais se não muito complexas
  if (originalCoordinates && originalCoordinates[0] && 
      originalCoordinates[0].length <= config.maxCoordinatesPerPolygon) {
    console.log(`✅ Usando coordenadas originais para ${countryName} (${originalCoordinates[0].length} pontos)`);
    return originalCoordinates;
  }
  
  // Estratégia 2: Simplificar coordenadas se muito complexas
  if (config.enableSimplification && originalCoordinates && originalCoordinates[0]) {
    try {
      const simplified = simplifyPolygonCoordinates(originalCoordinates, config.maxCoordinatesPerPolygon);
      console.log(`🔧 Coordenadas simplificadas para ${countryName}`);
      return simplified;
    } catch (err) {
      console.warn(`⚠️ Falha na simplificação para ${countryName}:`, err);
    }
  }
  
  // Estratégia 3: Usar bounds simples como último recurso
  if (config.fallbackToSimpleBounds) {
    const simpleBounds = createSimpleBoundsPolygon(countryName);
    if (simpleBounds) {
      console.log(`🔄 Usando bounds simples para ${countryName}`);
      return simpleBounds;
    }
  }
  
  console.error(`❌ Todas as estratégias falharam para ${countryName}`);
  return null;
};

// 🩺 DIAGNOSTICAR PROBLEMAS ESPECÍFICOS DE GEOMETRIA
export const diagnoseBoundaryIssues = (
  feature: any,
  countryName: string
): { issues: string[], canRender: boolean, recommendedAction: string } => {
  const issues: string[] = [];
  let canRender = true;
  let recommendedAction = 'render_normal';
  
  // Verificar se tem geometria
  if (!feature.geometry) {
    issues.push('Sem dados de geometria');
    canRender = false;
    recommendedAction = 'use_fallback_bounds';
    return { issues, canRender, recommendedAction };
  }
  
  // Verificar coordenadas
  if (!feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
    issues.push('Coordenadas vazias');
    canRender = false;
    recommendedAction = 'use_fallback_bounds';
    return { issues, canRender, recommendedAction };
  }
  
  // Analisar complexidade para diferentes tipos
  if (feature.geometry.type === 'MultiPolygon') {
    const polygonCount = feature.geometry.coordinates.length;
    const totalPoints = feature.geometry.coordinates.reduce((sum: number, polygon: any) => {
      return sum + (polygon[0]?.length || 0);
    }, 0);
    
    if (polygonCount > 50) {
      issues.push(`Muitos polígonos: ${polygonCount}`);
      recommendedAction = 'simplify_multipolygon';
    }
    
    if (totalPoints > 5000) {
      issues.push(`Muito complexo: ${totalPoints} pontos`);
      canRender = false;
      recommendedAction = 'use_fallback_bounds';
    } else if (totalPoints > 2000) {
      issues.push(`Complexidade alta: ${totalPoints} pontos`);
      recommendedAction = 'simplify_coordinates';
    }
    
  } else if (feature.geometry.type === 'Polygon') {
    const pointCount = feature.geometry.coordinates[0]?.length || 0;
    
    if (pointCount > 2000) {
      issues.push(`Polígono muito complexo: ${pointCount} pontos`);
      canRender = false;
      recommendedAction = 'use_fallback_bounds';
    } else if (pointCount > 1000) {
      issues.push(`Polígono complexo: ${pointCount} pontos`);
      recommendedAction = 'simplify_coordinates';
    }
  }
  
  // Verificar se é um país conhecido por problemas
  if (COUNTRY_FALLBACK_BOUNDS[countryName as keyof typeof COUNTRY_FALLBACK_BOUNDS]) {
    issues.push('País com geometria conhecidamente problemática');
    if (COUNTRY_FALLBACK_BOUNDS[countryName as keyof typeof COUNTRY_FALLBACK_BOUNDS].simplified) {
      recommendedAction = 'use_fallback_bounds';
    }
  }
  
  return { issues, canRender, recommendedAction };
};

// 📊 ESTATÍSTICAS DE DESEMPENHO DE RENDERIZAÇÃO
export interface RenderingStats {
  successfulRenders: number;
  failedRenders: number;
  simplifiedRenders: number;
  fallbackRenders: number;
  averageRenderTime: number;
  problematicCountries: string[];
}

export class BoundaryRenderingMonitor {
  private stats: RenderingStats = {
    successfulRenders: 0,
    failedRenders: 0,
    simplifiedRenders: 0,
    fallbackRenders: 0,
    averageRenderTime: 0,
    problematicCountries: []
  };
  
  private renderTimes: number[] = [];
  
  recordSuccess(renderTime: number) {
    this.stats.successfulRenders++;
    this.renderTimes.push(renderTime);
    this.updateAverageTime();
  }
  
  recordFailure(countryName: string) {
    this.stats.failedRenders++;
    if (!this.stats.problematicCountries.includes(countryName)) {
      this.stats.problematicCountries.push(countryName);
    }
  }
  
  recordSimplification(renderTime: number) {
    this.stats.simplifiedRenders++;
    this.renderTimes.push(renderTime);
    this.updateAverageTime();
  }
  
  recordFallback(countryName: string, renderTime: number) {
    this.stats.fallbackRenders++;
    this.renderTimes.push(renderTime);
    this.updateAverageTime();
    if (!this.stats.problematicCountries.includes(countryName)) {
      this.stats.problematicCountries.push(countryName);
    }
  }
  
  private updateAverageTime() {
    if (this.renderTimes.length > 0) {
      this.stats.averageRenderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    }
  }
  
  getStats(): RenderingStats {
    return { ...this.stats };
  }
  
  getSuccessRate(): number {
    const total = this.stats.successfulRenders + this.stats.failedRenders + 
                  this.stats.simplifiedRenders + this.stats.fallbackRenders;
    return total > 0 ? ((this.stats.successfulRenders + this.stats.simplifiedRenders) / total) * 100 : 0;
  }
}

// Instância global do monitor
export const boundaryMonitor = new BoundaryRenderingMonitor(); 