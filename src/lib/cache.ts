// Sistema de cache optimizado para TMDB API
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  maxAge: number; // Tiempo de vida en milisegundos
  maxSize: number; // Número máximo de entradas
  enablePersistence: boolean; // Si usar localStorage
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxAge: 15 * 60 * 1000, // 15 minutos por defecto
      maxSize: 100, // 100 entradas máximo
      enablePersistence: true,
      ...config
    };

    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }
  }

  // Generar clave de cache
  private generateKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${endpoint}|${sortedParams}`;
  }

  // Obtener datos del cache
  get<T>(endpoint: string, params: Record<string, any> = {}): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Guardar datos en cache
  set<T>(endpoint: string, params: Record<string, any> = {}, data: T): void {
    const key = this.generateKey(endpoint, params);
    const now = Date.now();

    // Limpiar cache si excede el tamaño máximo
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.maxAge
    };

    this.cache.set(key, entry);

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  // Limpiar entradas más antiguas
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Limpiar cache expirado
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear();
    if (this.config.enablePersistence) {
      localStorage.removeItem('tmdb_cache');
    }
  }

  // Guardar en localStorage
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('tmdb_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('No se pudo guardar el cache en localStorage:', error);
    }
  }

  // Cargar desde localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('tmdb_cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        
        // Limpiar entradas expiradas al cargar
        this.clearExpired();
      }
    } catch (error) {
      console.warn('No se pudo cargar el cache desde localStorage:', error);
    }
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // TODO: Implementar métricas de hit rate
    };
  }
}

// Instancias de cache para diferentes tipos de datos
export const movieCache = new APICache({ maxAge: 10 * 60 * 1000 }); // 10 minutos para películas
export const genreCache = new APICache({ maxAge: 60 * 60 * 1000 }); // 1 hora para géneros
export const personCache = new APICache({ maxAge: 30 * 60 * 1000 }); // 30 minutos para personas
export const searchCache = new APICache({ maxAge: 5 * 60 * 1000 }); // 5 minutos para búsquedas

// Limpiar cache expirado periódicamente
if (typeof window !== 'undefined') {
  setInterval(() => {
    movieCache.clearExpired();
    genreCache.clearExpired();
    personCache.clearExpired();
    searchCache.clearExpired();
  }, 60000); // Cada minuto
} 