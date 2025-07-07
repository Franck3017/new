import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedAPIOptions {
  debounceMs?: number;
  throttleMs?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useOptimizedAPI<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseOptimizedAPIOptions = {}
) {
  const {
    debounceMs = 300,
    throttleMs = 1000,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const throttleRef = useRef<{ lastCall: number; pending: boolean }>({ lastCall: 0, pending: false });
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función para limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Función para hacer la llamada a la API
  const executeAPICall = useCallback(async (...args: any[]) => {
    // Cancelar llamada anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall(...args);
      
      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      });

      retryCountRef.current = 0; // Reset retry count on success
      return result;
    } catch (error: any) {
      // Si es un error de abort, no hacer nada
      if (error.name === 'AbortError') {
        return;
      }

      // Intentar retry si no se han agotado los intentos
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        setTimeout(() => {
          executeAPICall(...args);
        }, retryDelay);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error desconocido'
      }));

      retryCountRef.current = 0; // Reset retry count
      throw error;
    }
  }, [apiCall, retryAttempts, retryDelay]);

  // Función con debounce
  const callWithDebounce = useCallback((...args: any[]) => {
    clearTimeouts();
    
    debounceRef.current = setTimeout(() => {
      executeAPICall(...args);
    }, debounceMs);
  }, [executeAPICall, debounceMs, clearTimeouts]);

  // Función con throttle
  const callWithThrottle = useCallback((...args: any[]) => {
    const now = Date.now();
    
    if (now - throttleRef.current.lastCall < throttleMs) {
      if (!throttleRef.current.pending) {
        throttleRef.current.pending = true;
        setTimeout(() => {
          throttleRef.current.pending = false;
          executeAPICall(...args);
        }, throttleMs - (now - throttleRef.current.lastCall));
      }
      return;
    }

    throttleRef.current.lastCall = now;
    executeAPICall(...args);
  }, [executeAPICall, throttleMs]);

  // Función directa sin optimizaciones
  const callDirect = useCallback((...args: any[]) => {
    return executeAPICall(...args);
  }, [executeAPICall]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      clearTimeouts();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [clearTimeouts]);

  return {
    ...state,
    callWithDebounce,
    callWithThrottle,
    callDirect,
    retry: () => {
      if (state.data) {
        executeAPICall();
      }
    }
  };
}

// Hook especializado para búsquedas
export function useSearchAPI<T>(
  apiCall: (query: string, ...args: any[]) => Promise<T>,
  options: UseOptimizedAPIOptions = {}
) {
  const searchHook = useOptimizedAPI(apiCall, {
    debounceMs: 500, // Debounce más largo para búsquedas
    ...options
  });

  const search = useCallback((query: string, ...args: any[]) => {
    if (!query.trim()) {
      searchHook.callDirect(query, ...args);
      return;
    }
    searchHook.callWithDebounce(query, ...args);
  }, [searchHook]);

  return {
    ...searchHook,
    search
  };
}

// Hook especializado para carga de listas con paginación
export function useListAPI<T extends { results: any[]; total_pages?: number }>(
  apiCall: (page: number, ...args: any[]) => Promise<T>,
  options: UseOptimizedAPIOptions = {}
) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<T['results']>([]);

  const listHook = useOptimizedAPI(apiCall, {
    throttleMs: 2000, // Throttle para evitar demasiadas llamadas
    ...options
  });

  const loadPage = useCallback(async (pageNum: number, append = false) => {
    try {
      const result = await listHook.callDirect(pageNum);
      
      if (result && result.results) {
        const newData = result.results;
        
        if (append) {
          setAllData(prev => [...prev, ...newData]);
        } else {
          setAllData(newData);
        }

        setHasMore(pageNum < (result.total_pages || 1));
        setPage(pageNum);
      }

      return result;
    } catch (error) {
      console.error('Error loading page:', error);
      throw error;
    }
  }, [listHook]);

  const loadNextPage = useCallback(() => {
    if (hasMore && !listHook.loading) {
      return loadPage(page + 1, true);
    }
  }, [hasMore, listHook.loading, page, loadPage]);

  const refresh = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
    return loadPage(1, false);
  }, [loadPage]);

  return {
    ...listHook,
    data: allData,
    page,
    hasMore,
    loadPage,
    loadNextPage,
    refresh
  };
} 