// 🔍 MONITOR OSM API STATUS
interface OSMApiStatus {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  lastRequestTime: number;
  consecutiveFailures: number;
  circuitBreakerActive: boolean;
  averageResponseTime: number;
  errorHistory: Array<{ timestamp: number; error: string }>;
}

class OSMMonitor {
  private static instance: OSMMonitor;
  private status: OSMApiStatus = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimitedRequests: 0,
    lastRequestTime: 0,
    consecutiveFailures: 0,
    circuitBreakerActive: false,
    averageResponseTime: 0,
    errorHistory: []
  };
  
  private responseTimes: number[] = [];

  static getInstance(): OSMMonitor {
    if (!OSMMonitor.instance) {
      OSMMonitor.instance = new OSMMonitor();
    }
    return OSMMonitor.instance;
  }

  recordRequest() {
    this.status.totalRequests++;
    this.status.lastRequestTime = Date.now();
  }

  recordSuccess(responseTime: number) {
    this.status.successfulRequests++;
    this.status.consecutiveFailures = 0;
    this.responseTimes.push(responseTime);
    
    // Manter apenas os últimos 10 tempos de resposta
    if (this.responseTimes.length > 10) {
      this.responseTimes.shift();
    }
    
    // Calcular média
    this.status.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    
    console.log(`✅ OSM Success - Tempo: ${responseTime}ms, Média: ${Math.round(this.status.averageResponseTime)}ms`);
  }

  recordFailure(error: string) {
    this.status.failedRequests++;
    this.status.consecutiveFailures++;
    
    if (error.includes('429')) {
      this.status.rateLimitedRequests++;
    }
    
    // Adicionar ao histórico de erros
    this.status.errorHistory.push({
      timestamp: Date.now(),
      error
    });
    
    // Manter apenas os últimos 10 erros
    if (this.status.errorHistory.length > 10) {
      this.status.errorHistory.shift();
    }
    
    console.log(`❌ OSM Failure - Erro: ${error}, Falhas consecutivas: ${this.status.consecutiveFailures}`);
  }

  setCircuitBreakerStatus(active: boolean) {
    this.status.circuitBreakerActive = active;
    if (active) {
      console.log('🚨 Circuit Breaker ATIVO');
    } else {
      console.log('🔄 Circuit Breaker INATIVO');
    }
  }

  getStatus(): OSMApiStatus {
    return JSON.parse(JSON.stringify(this.status));
  }

  printReport() {
    const successRate = this.status.totalRequests > 0 
      ? Math.round((this.status.successfulRequests / this.status.totalRequests) * 100)
      : 0;
    
    console.log(`
📊 OSM API Status Report:
  Total Requests: ${this.status.totalRequests}
  Successful: ${this.status.successfulRequests} (${successRate}%)
  Failed: ${this.status.failedRequests}
  Rate Limited: ${this.status.rateLimitedRequests}
  Consecutive Failures: ${this.status.consecutiveFailures}
  Circuit Breaker: ${this.status.circuitBreakerActive ? 'ATIVO' : 'INATIVO'}
  Average Response Time: ${Math.round(this.status.averageResponseTime)}ms
  Recent Errors: ${this.status.errorHistory.length}
    `);
  }

  reset() {
    this.status = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      lastRequestTime: 0,
      consecutiveFailures: 0,
      circuitBreakerActive: false,
      averageResponseTime: 0,
      errorHistory: []
    };
    this.responseTimes = [];
    console.log('🔄 OSM Monitor resetado');
  }
}

export const osmMonitor = OSMMonitor.getInstance();

// 🎯 HELPER PARA DEBUGGING
export const logOSMDebugInfo = () => {
  osmMonitor.printReport();
  
  // Mostrar também informações do localStorage se houver
  const cacheInfo = localStorage.getItem('osm-debug-info');
  if (cacheInfo) {
    console.log('💾 Cache Info:', JSON.parse(cacheInfo));
  }
};

// 📱 DISPONIBILIZAR GLOBALMENTE PARA DEBUG
if (typeof window !== 'undefined') {
  (window as any).osmDebug = {
    monitor: osmMonitor,
    logInfo: logOSMDebugInfo,
    reset: () => osmMonitor.reset()
  };
} 