// Configuración de optimizaciones de rendimiento

// Configuración de cache
export const CACHE_CONFIG = {
  // Tiempos de vida en milisegundos
  MOVIES: 10 * 60 * 1000, // 10 minutos
  GENRES: 60 * 60 * 1000, // 1 hora
  PEOPLE: 30 * 60 * 1000, // 30 minutos
  SEARCH: 5 * 60 * 1000,  // 5 minutos
  DETAILS: 15 * 60 * 1000, // 15 minutos
  
  // Tamaños máximos
  MAX_ENTRIES: 100,
  
  // Persistencia
  ENABLE_PERSISTENCE: true
};

// Configuración de debounce/throttle
export const TIMING_CONFIG = {
  SEARCH_DEBOUNCE: 300,    // ms
  SCROLL_THROTTLE: 100,    // ms
  API_THROTTLE: 1000,      // ms
  RETRY_DELAY: 1000,       // ms
  MAX_RETRIES: 3
};

// Configuración de carga
export const LOADING_CONFIG = {
  BATCH_SIZE: 6,           // Elementos por lote
  INITIAL_LOAD: 12,        // Elementos iniciales
  LAZY_LOAD_THRESHOLD: 100, // px antes del final
  SKELETON_COUNT: 6        // Skeletons a mostrar
};

// Configuración de imágenes
export const IMAGE_CONFIG = {
  QUALITY: 85,             // Calidad de imagen (0-100)
  FORMAT: 'webp',          // Formato preferido
  SIZES: {
    THUMBNAIL: 'w185',
    POSTER: 'w500',
    BACKDROP: 'w1280',
    ORIGINAL: 'original'
  },
  LAZY_LOADING: true,
  PLACEHOLDER_BLUR: true
};

// Configuración de API
export const API_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  TIMEOUT: 10000,          // ms
  MAX_CONCURRENT: 3,       // Máximo de llamadas concurrentes
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 40,
    BURST_LIMIT: 10
  }
};

// Métricas de rendimiento
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  // Registrar tiempo de carga
  recordLoadTime(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }

  // Obtener métricas
  getMetrics(operation: string): { avg: number; min: number; max: number; count: number } {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { avg, min, max, count: times.length };
  }

  // Obtener todas las métricas
  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    for (const [operation] of this.metrics) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  // Limpiar métricas
  clear(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }

  // Obtener tiempo de ejecución total
  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// Utilidades de optimización
export const PerformanceUtils = {
  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize function
  memoize<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Lazy load function
  lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
    let cached: T | null = null;
    let loading: Promise<T> | null = null;

    return async () => {
      if (cached) return cached;
      if (loading) return loading;

      loading = loader().then(result => {
        cached = result;
        loading = null;
        return result;
      });

      return loading;
    };
  },

  // Intersection Observer wrapper
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });
  },

  // Preload image
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Batch processing
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      // Pequeña pausa entre lotes para no sobrecargar
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
};

// Configuración de monitoreo
export const MONITORING_CONFIG = {
  ENABLE_METRICS: process.env.NODE_ENV === 'development',
  LOG_LEVEL: 'warn', // 'debug' | 'info' | 'warn' | 'error'
  SEND_ANALYTICS: false,
  PERFORMANCE_BUDGET: {
    FIRST_CONTENTFUL_PAINT: 2000, // ms
    LARGEST_CONTENTFUL_PAINT: 4000, // ms
    FIRST_INPUT_DELAY: 100, // ms
    CUMULATIVE_LAYOUT_SHIFT: 0.1
  }
};

// Exportar instancia de métricas
export const performanceMetrics = PerformanceMetrics.getInstance(); 