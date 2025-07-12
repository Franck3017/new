import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getOnAirTVShows,
  getAiringTodayTVShows
} from "@/lib/api";
import { Movie } from "@/types";
import { useNotifications } from "@/components/Notification";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CategoryType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'popularTV' | 'topRatedTV' | 'onAirTV' | 'airingTodayTV';
export type MediaType = 'movie' | 'tv';

export interface HomePageState {
  // Movies state
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  nowPlayingMovies: Movie[];
  upcomingMovies: Movie[];
  
  // TV Shows state
  popularTVShows: Movie[];
  topRatedTVShows: Movie[];
  onAirTVShows: Movie[];
  airingTodayTVShows: Movie[];
  
  // UI state
  initialLoading: boolean;
  activeSection: CategoryType;
  isInitialLoad: boolean;
}

export interface CategoryLoadingState {
  [key: string]: {
    loading: boolean;
    error: string | null;
    retryCount: number;
    lastAttempt: number;
  };
}

export interface CategoryConfig {
  key: CategoryType;
  title: string;
  mediaType: MediaType;
  apiFunction: (page: number) => Promise<any>;
  priority: number; // Prioridad de carga (1 = más alta)
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_CONFIGS: Record<CategoryType, CategoryConfig> = {
  popular: {
    key: 'popular',
    title: 'Películas Populares',
    mediaType: 'movie',
    apiFunction: getPopularMovies,
    priority: 1
  },
  top_rated: {
    key: 'top_rated',
    title: 'Mejor Valoradas',
    mediaType: 'movie',
    apiFunction: getTopRatedMovies,
    priority: 2
  },
  now_playing: {
    key: 'now_playing',
    title: 'Actualmente en Cines',
    mediaType: 'movie',
    apiFunction: getNowPlayingMovies,
    priority: 3
  },
  upcoming: {
    key: 'upcoming',
    title: 'Próximas Películas',
    mediaType: 'movie',
    apiFunction: getUpcomingMovies,
    priority: 4
  },
  popularTV: {
    key: 'popularTV',
    title: 'Series de TV Populares',
    mediaType: 'tv',
    apiFunction: getPopularTVShows,
    priority: 5
  },
  topRatedTV: {
    key: 'topRatedTV',
    title: 'Series de TV Mejor Valoradas',
    mediaType: 'tv',
    apiFunction: getTopRatedTVShows,
    priority: 6
  },
  onAirTV: {
    key: 'onAirTV',
    title: 'Series Actualmente en Emisión',
    mediaType: 'tv',
    apiFunction: getOnAirTVShows,
    priority: 7
  },
  airingTodayTV: {
    key: 'airingTodayTV',
    title: 'Series que se Emiten Hoy',
    mediaType: 'tv',
    apiFunction: getAiringTodayTVShows,
    priority: 8
  }
};

const INITIAL_STATE: HomePageState = {
  popularMovies: [],
  topRatedMovies: [],
  nowPlayingMovies: [],
  upcomingMovies: [],
  popularTVShows: [],
  topRatedTVShows: [],
  onAirTVShows: [],
  airingTodayTVShows: [],
  initialLoading: true,
  activeSection: 'popular',
  isInitialLoad: true
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 segundos
const REQUEST_TIMEOUT = 15000; // 15 segundos

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Elimina duplicados de películas basándose en el ID
 */
const removeDuplicates = (movies: Movie[], mediaType: MediaType): Movie[] => {
  const seen = new Set<number>();
  return movies
    .filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    })
    .map(movie => ({
      ...movie,
      media_type: mediaType
    }));
};

/**
 * Obtiene la clave del estado correspondiente a una categoría
 */
const getStateKeyForCategory = (category: CategoryType): keyof HomePageState => {
  const stateKeyMap: Record<CategoryType, keyof HomePageState> = {
    popular: 'popularMovies',
    top_rated: 'topRatedMovies',
    now_playing: 'nowPlayingMovies',
    upcoming: 'upcomingMovies',
    popularTV: 'popularTVShows',
    topRatedTV: 'topRatedTVShows',
    onAirTV: 'onAirTVShows',
    airingTodayTV: 'airingTodayTVShows'
  };
  
  return stateKeyMap[category];
};

/**
 * Verifica si hay datos disponibles en el estado
 */
const hasDataInState = (state: HomePageState): boolean => {
  return Object.values(state).some(value => 
    Array.isArray(value) && value.length > 0
  );
};

/**
 * Función de delay para reintentos
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Función con timeout para peticiones
 */
const fetchWithTimeout = async (apiFunction: () => Promise<any>, timeout: number): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const result = await apiFunction();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useHomePage = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<HomePageState>(INITIAL_STATE);
  const [loadingStates, setLoadingStates] = useState<CategoryLoadingState>({});
  const { showError, showSuccess } = useNotifications();
  
  // Refs para control de peticiones
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ============================================================================
  // STATE UPDATERS
  // ============================================================================

  /**
   * Actualiza el estado de una categoría específica
   */
  const updateCategoryState = useCallback((category: CategoryType, newMovies: Movie[], mediaType: MediaType) => {
    const deduplicatedMovies = removeDuplicates(newMovies, mediaType);
    const stateKey = getStateKeyForCategory(category);
    
    setState(prev => ({
      ...prev,
      [stateKey]: deduplicatedMovies
    }));
  }, []);

  /**
   * Actualiza el estado de carga de una categoría
   */
  const updateCategoryLoadingState = useCallback((category: CategoryType, updates: Partial<CategoryLoadingState[string]>) => {
    setLoadingStates(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      }
    }));
  }, []);

  /**
   * Actualiza el estado de carga general
   */
  const updateLoadingState = useCallback((isLoading: boolean, isInitialLoad?: boolean) => {
    setState(prev => ({
      ...prev,
      initialLoading: isLoading,
      ...(isInitialLoad !== undefined && { isInitialLoad })
    }));
  }, []);

  /**
   * Actualiza la sección activa
   */
  const setActiveSection = useCallback((section: CategoryType) => {
    setState(prev => ({ ...prev, activeSection: section }));
  }, []);

  // ============================================================================
  // API OPERATIONS
  // ============================================================================

  /**
   * Obtiene datos de una categoría específica con reintentos
   */
  const fetchCategoryData = useCallback(async (category: CategoryType, page: number = 1, retryAttempt: number = 0): Promise<boolean> => {
    const config = CATEGORY_CONFIGS[category];
    if (!config) {
      console.error(`Configuración no encontrada para la categoría: ${category}`);
      return false;
    }

    // Cancelar petición anterior si existe
    const existingController = abortControllersRef.current.get(category);
    if (existingController) {
      existingController.abort();
    }

    // Crear nuevo controlador
    const controller = new AbortController();
    abortControllersRef.current.set(category, controller);

    // Limpiar timeout de reintento anterior
    const existingTimeout = retryTimeoutsRef.current.get(category);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      retryTimeoutsRef.current.delete(category);
    }

    // Actualizar estado de carga
    updateCategoryLoadingState(category, {
      loading: true,
      error: null,
      retryCount: retryAttempt,
      lastAttempt: Date.now()
    });

    try {
      console.log(`Fetching ${category} data (attempt ${retryAttempt + 1})`);
      
      const response = await fetchWithTimeout(
        () => config.apiFunction(page),
        REQUEST_TIMEOUT
      );

      // Verificar si la petición fue cancelada
      if (controller.signal.aborted) {
        console.log(`${category} request was aborted`);
        return false;
      }

      // Validar respuesta
      if (!response?.results || !Array.isArray(response.results)) {
        throw new Error('Formato de respuesta inválido');
      }

      const newMovies = response.results;
      
      // Actualizar el estado con los nuevos datos
      updateCategoryState(category, newMovies, config.mediaType);
      
      // Limpiar estado de error si existía
      updateCategoryLoadingState(category, {
        loading: false,
        error: null
      });

      console.log(`Successfully loaded ${newMovies.length} items for ${category}`);
      return true;

    } catch (error) {
      // Verificar si la petición fue cancelada
      if (controller.signal.aborted) {
        console.log(`${category} request was aborted`);
        return false;
      }

      console.error(`Error fetching ${category} data (attempt ${retryAttempt + 1}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Intentar reintento si no se ha excedido el límite
      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying ${category} in ${RETRY_DELAY}ms...`);
        
        const retryTimeout = setTimeout(() => {
          fetchCategoryData(category, page, retryAttempt + 1);
        }, RETRY_DELAY);
        
        retryTimeoutsRef.current.set(category, retryTimeout);
        
        updateCategoryLoadingState(category, {
          loading: false,
          error: `Reintentando... (${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})`
        });
        
        return false;
      }

      // Si se agotaron los reintentos, marcar como error
      updateCategoryLoadingState(category, {
        loading: false,
        error: errorMessage
      });

      showError(
        'Error al cargar datos', 
        `No se pudieron cargar los datos de ${config.title}. ${errorMessage}`
      );

      return false;
    } finally {
      // Limpiar controlador
      abortControllersRef.current.delete(category);
    }
  }, [updateCategoryState, updateCategoryLoadingState, showError]);

  /**
   * Carga datos iniciales de todas las categorías con prioridad
   */
  const loadInitialData = useCallback(async () => {
    updateLoadingState(true);
    
    try {
      // Ordenar categorías por prioridad
      const categories: CategoryType[] = Object.keys(CATEGORY_CONFIGS) as CategoryType[];
      const sortedCategories = categories.sort((a, b) => 
        CATEGORY_CONFIGS[a].priority - CATEGORY_CONFIGS[b].priority
      );

      console.log('Loading categories in order:', sortedCategories);

      // Cargar categorías en paralelo pero con límite de concurrencia
      const concurrencyLimit = 3; // Máximo 3 peticiones simultáneas
      const results: boolean[] = [];

      for (let i = 0; i < sortedCategories.length; i += concurrencyLimit) {
        const batch = sortedCategories.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(category => fetchCategoryData(category, 1, 0));
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Pequeña pausa entre lotes para evitar sobrecarga
        if (i + concurrencyLimit < sortedCategories.length) {
          await delay(500);
        }
      }

      const successCount = results.filter(Boolean).length;
      const totalCount = sortedCategories.length;

      console.log(`Initial load completed: ${successCount}/${totalCount} categories loaded successfully`);

      if (successCount > 0) {
        showSuccess(
          'Página cargada', 
          `${successCount} de ${totalCount} secciones cargadas correctamente`
        );
      }

    } catch (error) {
      console.error('Error in loadInitialData:', error);
      showError(
        'Error al cargar datos iniciales', 
        'Algunas secciones no se pudieron cargar. Inténtalo de nuevo.'
      );
    } finally {
      updateLoadingState(false, false);
    }
  }, [fetchCategoryData, updateLoadingState, showError, showSuccess]);

  /**
   * Carga más datos de una categoría específica
   */
  const loadMoreData = useCallback((category: CategoryType, page: number) => {
    fetchCategoryData(category, page, 0);
  }, [fetchCategoryData]);

  /**
   * Reintenta cargar una categoría específica
   */
  const retryCategory = useCallback((category: CategoryType) => {
    const currentState = loadingStates[category];
    if (currentState?.loading) return;
    
    fetchCategoryData(category, 1, 0);
  }, [fetchCategoryData, loadingStates]);

  /**
   * Reintenta cargar todas las categorías fallidas
   */
  const retryFailedCategories = useCallback(() => {
    const failedCategories = Object.entries(loadingStates)
      .filter(([_, state]) => state.error && !state.loading)
      .map(([category]) => category as CategoryType);

    if (failedCategories.length > 0) {
      console.log('Retrying failed categories:', failedCategories);
      failedCategories.forEach(category => retryCategory(category));
    }
  }, [loadingStates, retryCategory]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadInitialData();

    // Cleanup function
    return () => {
      // Cancelar todas las peticiones pendientes
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
      
      // Limpiar todos los timeouts de reintento
      retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      retryTimeoutsRef.current.clear();
    };
  }, [loadInitialData]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const computedValues = {
    isLoading: state.initialLoading,
    hasData: !state.initialLoading && hasDataInState(state),
    totalMovies: Object.values(state)
      .filter(value => Array.isArray(value))
      .reduce((total, array) => total + (array as Movie[]).length, 0),
    categoriesWithData: Object.keys(CATEGORY_CONFIGS).filter(category => {
      const stateKey = getStateKeyForCategory(category as CategoryType);
      return state[stateKey] && (state[stateKey] as Movie[]).length > 0;
    }).length,
    failedCategories: Object.entries(loadingStates)
      .filter(([_, state]) => state.error && !state.loading)
      .map(([category]) => category as CategoryType),
    loadingCategories: Object.entries(loadingStates)
      .filter(([_, state]) => state.loading)
      .map(([category]) => category as CategoryType)
  };

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // State
    ...state,
    
    // Loading states
    loadingStates,
    
    // Actions
    setActiveSection,
    loadMoreData,
    loadInitialData,
    fetchCategoryData,
    retryCategory,
    retryFailedCategories,
    
    // Computed values
    ...computedValues,
    
    // Utilities
    categoryConfigs: CATEGORY_CONFIGS,
    getCategoryConfig: (category: CategoryType) => CATEGORY_CONFIGS[category]
  };
}; 