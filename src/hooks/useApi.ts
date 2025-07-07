import { useState, useEffect, useRef } from 'react';
import { apiClient, ApiResponse } from '@/utils/api';
import { CACHE_CONFIG } from '@/constants/api';

// Tipos para el estado de la API
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

// Configuración para el hook
export interface UseApiOptions<T = any> {
  enabled?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

// Cache simple en memoria
const apiCache = new Map<string, { data: any; timestamp: number }>();

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): ApiState<T> & { refetch: () => Promise<void> } {
  const {
    enabled = true,
    cacheKey,
    cacheDuration = CACHE_CONFIG.DURATION,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null
  });

  const loadingRef = useRef(false);

  const fetchData = async (forceRefresh = false) => {
    // Evitar llamadas duplicadas
    if (loadingRef.current) return;

    // Verificar caché si no es un refresh forzado
    if (cacheKey && !forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setState({
          data: cached.data,
          loading: false,
          error: null,
          status: 200
        });
        return;
      }
    }

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Guardar en caché si se especifica una clave
      if (cacheKey) {
        apiCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
        status: response.status
      });

      onSuccess?.(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        status: 500
      });

      onError?.(errorMessage);
    } finally {
      loadingRef.current = false;
    }
  };

  const refetch = () => fetchData(true);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled]);

  return { ...state, refetch };
}

// Hook específico para películas
export function useMovies(category: 'popular' | 'top_rated' | 'now_playing', page = 1) {
  const getApiCall = () => {
    switch (category) {
      case 'popular':
        return apiClient.getPopularMovies(page);
      case 'top_rated':
        return apiClient.getTopRatedMovies(page);
      case 'now_playing':
        return apiClient.getNowPlayingMovies(page);
      default:
        return apiClient.getPopularMovies(page);
    }
  };

  return useApi(getApiCall, {
    cacheKey: `movies-${category}-${page}`,
    enabled: true
  });
}

// Hook específico para detalles de película
export function useMovieDetails(id: string) {
  return useApi(() => apiClient.getMovieDetails(id), {
    cacheKey: `movie-${id}`,
    enabled: !!id
  });
}

// Hook específico para búsqueda
export function useMovieSearch(query: string, page = 1) {
  return useApi(() => apiClient.searchMovies(query, page), {
    cacheKey: `search-${query}-${page}`,
    enabled: !!query.trim(),
    cacheDuration: 2 * 60 * 1000 // 2 minutos para búsquedas
  });
}

// Hook específico para personas
export function usePersonDetails(id: string) {
  return useApi(() => apiClient.getPersonDetails(id), {
    cacheKey: `person-${id}`,
    enabled: !!id
  });
}

// Hook específico para créditos de persona
export function usePersonCredits(id: string) {
  return useApi(() => apiClient.getPersonCredits(id), {
    cacheKey: `person-credits-${id}`,
    enabled: !!id
  });
}

// Hook específico para imágenes de persona
export function usePersonImages(id: string) {
  return useApi(() => apiClient.getPersonImages(id), {
    cacheKey: `person-images-${id}`,
    enabled: !!id
  });
} 