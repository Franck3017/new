import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  enablePersistence?: boolean; // Enable localStorage persistence
  persistenceKey?: string; // Key for localStorage
}

interface UseAdvancedCacheReturn<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  clear: () => void;
  size: number;
  keys: string[];
  stats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

export function useAdvancedCache<T>(options: CacheOptions = {}): UseAdvancedCacheReturn<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    enablePersistence = false,
    persistenceKey = 'app-cache'
  } = options;

  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const [stats, setStats] = useState({ hits: 0, misses: 0, hitRate: 0 });
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const statsRef = useRef({ hits: 0, misses: 0 });

  // Cargar cache desde localStorage si está habilitado
  useEffect(() => {
    if (enablePersistence) {
      try {
        const stored = localStorage.getItem(persistenceKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const newCache = new Map();
          
          Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
            // Verificar si la entrada no ha expirado
            if (Date.now() - entry.timestamp < entry.ttl) {
              newCache.set(key, entry);
            }
          });
          
          cacheRef.current = newCache;
          setCache(newCache);
        }
      } catch (error) {
        console.warn('Error loading cache from localStorage:', error);
      }
    }
  }, [enablePersistence, persistenceKey]);

  // Guardar cache en localStorage cuando cambie
  useEffect(() => {
    if (enablePersistence && cache.size > 0) {
      try {
        const cacheObject = Object.fromEntries(cache);
        localStorage.setItem(persistenceKey, JSON.stringify(cacheObject));
      } catch (error) {
        console.warn('Error saving cache to localStorage:', error);
      }
    }
  }, [cache, enablePersistence, persistenceKey]);

  // Limpiar entradas expiradas
  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const newCache = new Map(cacheRef.current);
    let hasChanges = false;

    for (const [key, entry] of newCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        newCache.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      cacheRef.current = newCache;
      setCache(newCache);
    }
  }, []);

  // Limpiar entradas menos usadas si se excede el tamaño máximo
  const evictLRU = useCallback(() => {
    if (cacheRef.current.size <= maxSize) return;

    const entries = Array.from(cacheRef.current.entries());
    entries.sort((a, b) => {
      // Ordenar por último acceso y luego por número de accesos
      if (a[1].lastAccessed !== b[1].lastAccessed) {
        return a[1].lastAccessed - b[1].lastAccessed;
      }
      return a[1].accessCount - b[1].accessCount;
    });

    const newCache = new Map();
    const keepCount = Math.floor(maxSize * 0.8); // Mantener 80% de las entradas
    
    entries.slice(-keepCount).forEach(([key, entry]) => {
      newCache.set(key, entry);
    });

    cacheRef.current = newCache;
    setCache(newCache);
  }, [maxSize]);

  // Obtener valor del cache
  const get = useCallback((key: string): T | null => {
    cleanupExpired();
    
    const entry = cacheRef.current.get(key);
    if (!entry) {
      statsRef.current.misses++;
      setStats(prev => ({
        ...prev,
        misses: statsRef.current.misses,
        hitRate: statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses)
      }));
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    statsRef.current.hits++;
    setStats(prev => ({
      ...prev,
      hits: statsRef.current.hits,
      hitRate: statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses)
    }));

    return entry.data;
  }, [cleanupExpired]);

  // Establecer valor en el cache
  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    const newCache = new Map(cacheRef.current);
    newCache.set(key, entry);
    
    cacheRef.current = newCache;
    setCache(newCache);

    evictLRU();
  }, [ttl, evictLRU]);

  // Verificar si existe una clave
  const has = useCallback((key: string): boolean => {
    cleanupExpired();
    return cacheRef.current.has(key);
  }, [cleanupExpired]);

  // Eliminar entrada del cache
  const deleteEntry = useCallback((key: string) => {
    const newCache = new Map(cacheRef.current);
    newCache.delete(key);
    cacheRef.current = newCache;
    setCache(newCache);
  }, []);

  // Limpiar todo el cache
  const clear = useCallback(() => {
    cacheRef.current = new Map();
    setCache(new Map());
    setStats({ hits: 0, misses: 0, hitRate: 0 });
    statsRef.current = { hits: 0, misses: 0 };
  }, []);

  return {
    get,
    set,
    has,
    delete: deleteEntry,
    clear,
    size: cache.size,
    keys: Array.from(cache.keys()),
    stats
  };
}

// Hook especializado para cache de API
export function useAPICache<T>(options: CacheOptions = {}) {
  const cache = useAdvancedCache<T>({
    ttl: 10 * 60 * 1000, // 10 minutos para API calls
    maxSize: 50,
    enablePersistence: true,
    persistenceKey: 'api-cache',
    ...options
  });

  // Función para cachear llamadas a API
  const cacheAPI = useCallback(async (
    key: string,
    apiCall: () => Promise<T>,
    customTtl?: number
  ): Promise<T> => {
    // Verificar cache primero
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    // Hacer llamada a API
    const data = await apiCall();
    
    // Guardar en cache
    cache.set(key, data, customTtl);
    
    return data;
  }, [cache]);

  return {
    ...cache,
    cacheAPI
  };
}

// Hook para cache de imágenes
export function useImageCache(options: CacheOptions = {}) {
  const cache = useAdvancedCache<string>({
    ttl: 60 * 60 * 1000, // 1 hora para imágenes
    maxSize: 200,
    enablePersistence: false, // No persistir URLs de imágenes
    ...options
  });

  // Preload imagen
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (cache.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        cache.set(src, src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [cache]);

  return {
    ...cache,
    preloadImage
  };
} 