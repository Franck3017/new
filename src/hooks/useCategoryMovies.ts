import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Movie } from '@/types';
import { useNotifications } from '@/components/Notification';
import { useDebounce } from './useDebounce';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CategoryConfig {
  title: string;
  description: string;
  apiFunction: (page: number) => Promise<{ results: Movie[]; total_pages: number }>;
  mediaType: 'movie' | 'tv';
}

interface UseCategoryMoviesProps {
  config: CategoryConfig | null;
  category: string;
}

interface MovieState {
  movies: Movie[];
  filteredMovies: Movie[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

interface SearchState {
  query: string;
  debouncedQuery: string;
  isLoading: boolean;
}

interface SortState {
  by: 'popularity' | 'rating' | 'date';
  order: 'asc' | 'desc';
}

interface UseCategoryMoviesReturn extends MovieState, SearchState, SortState {
  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'popularity' | 'rating' | 'date') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  loadMore: () => void;
  retry: () => void;
  refresh: () => void;
  
  // Computed
  totalMovies: number;
  filteredCount: number;
  isSearching: boolean;
  hasActiveFilters: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Remove duplicate movies based on ID and add media type
 */
const removeDuplicates = (movies: Movie[], mediaType: 'movie' | 'tv'): Movie[] => {
  const seen = new Set<number>();
  return movies
    .filter(movie => {
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    })
    .map(movie => ({
      ...movie,
      media_type: mediaType
    }));
};

/**
 * Filter movies based on search query
 */
const filterMoviesByQuery = (movies: Movie[], query: string): Movie[] => {
  if (!query.trim()) return movies;
  
  const searchTerm = query.toLowerCase().trim();
  
  return movies.filter(movie => {
    const title = movie.title || movie.name || '';
    const overview = movie.overview || '';
    
    return title.toLowerCase().includes(searchTerm) || 
           overview.toLowerCase().includes(searchTerm);
  });
};

/**
 * Sort movies based on criteria and order
 */
const sortMovies = (movies: Movie[], sortBy: SortState['by'], sortOrder: SortState['order']): Movie[] => {
  return [...movies].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'popularity':
        aValue = a.popularity || 0;
        bValue = b.popularity || 0;
        break;
      case 'rating':
        aValue = a.vote_average || 0;
        bValue = b.vote_average || 0;
        break;
      case 'date':
        const aDate = a.release_date || a.first_air_date || '';
        const bDate = b.release_date || b.first_air_date || '';
        aValue = new Date(aDate).getTime();
        bValue = new Date(bDate).getTime();
        break;
      default:
        aValue = a.popularity || 0;
        bValue = b.popularity || 0;
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useCategoryMovies = ({ config, category }: UseCategoryMoviesProps): UseCategoryMoviesReturn => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [movieState, setMovieState] = useState<MovieState>({
    movies: [],
    filteredMovies: [],
    loading: true,
    error: null,
    hasMore: true,
    currentPage: 1
  });
  
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    debouncedQuery: '',
    isLoading: false
  });
  
  const [sortState, setSortState] = useState<SortState>({
    by: 'popularity',
    order: 'desc'
  });
  
  // ============================================================================
  // REFS & HOOKS
  // ============================================================================
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showError, showSuccess } = useNotifications();
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchState.query, 300);
  
  // Update debounced query in state
  useEffect(() => {
    setSearchState(prev => ({ ...prev, debouncedQuery: debouncedSearchQuery }));
  }, [debouncedSearchQuery]);
  
  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  
  /**
   * Load movies from API with proper error handling and abort controller
   */
  const loadMovies = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!config) return;
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      setMovieState(prev => ({ ...prev, loading: true, error: null }));
      setSearchState(prev => ({ ...prev, isLoading: true }));
      
      const response = await config.apiFunction(pageNum);
      
      // Validate response structure
      if (!response?.results || !Array.isArray(response.results)) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const newMovies = response.results;
      const processedMovies = removeDuplicates(newMovies, config.mediaType);
      
      setMovieState(prev => {
        const updatedMovies = append 
          ? removeDuplicates([...prev.movies, ...processedMovies], config.mediaType)
          : processedMovies;
          
        return {
          ...prev,
          movies: updatedMovies,
          hasMore: pageNum < (response.total_pages || 1),
          currentPage: pageNum,
          loading: false
        };
      });
      
      setSearchState(prev => ({ ...prev, isLoading: false }));
      
      // Show success message for first load
      if (pageNum === 1 && !append) {
        showSuccess('Categoría cargada', `${processedMovies.length} elementos cargados`);
      }
      
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos';
      
      setMovieState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      setSearchState(prev => ({ ...prev, isLoading: false }));
      
      showError('Error de carga', errorMessage);
    }
  }, [config, showError, showSuccess]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Load initial data when category or config changes
  useEffect(() => {
    if (config) {
      setMovieState(prev => ({ 
        ...prev, 
        currentPage: 1, 
        hasMore: true,
        error: null 
      }));
      setSearchState(prev => ({ ...prev, query: '' }));
      loadMovies(1, false);
    }
    
    // Cleanup function to abort requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [category, config, loadMovies]);
  
  // Filter and sort movies when dependencies change
  const filteredAndSortedMovies = useMemo(() => {
    const { movies } = movieState;
    const { debouncedQuery } = searchState;
    const { by: sortBy, order: sortOrder } = sortState;
    
    if (!Array.isArray(movies)) return [];
    
    let processed = [...movies];
    
    // Apply search filter
    processed = filterMoviesByQuery(processed, debouncedQuery);
    
    // Apply sorting
    processed = sortMovies(processed, sortBy, sortOrder);
    
    return processed;
  }, [movieState.movies, searchState.debouncedQuery, sortState.by, sortState.order]);
  
  // Update filtered movies when computed result changes
  useEffect(() => {
    setMovieState(prev => ({ ...prev, filteredMovies: filteredAndSortedMovies }));
  }, [filteredAndSortedMovies]);
  
  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================
  
  const setSearchQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);
  
  const setSortBy = useCallback((sortBy: SortState['by']) => {
    setSortState(prev => ({ ...prev, by: sortBy }));
  }, []);
  
  const setSortOrder = useCallback((order: SortState['order']) => {
    setSortState(prev => ({ ...prev, order }));
  }, []);
  
  const loadMore = useCallback(() => {
    const { loading, hasMore, currentPage } = movieState;
    const { isLoading } = searchState;
    const { debouncedQuery } = searchState;
    
    // Don't load more if:
    // - Currently loading
    // - No more pages
    // - Searching (to avoid conflicts)
    if (loading || isLoading || !hasMore || debouncedQuery.trim()) {
      return;
    }
    
    const nextPage = currentPage + 1;
    loadMovies(nextPage, true);
  }, [movieState, searchState, loadMovies]);
  
  const retry = useCallback(() => {
    loadMovies(1, false);
  }, [loadMovies]);
  
  const refresh = useCallback(() => {
    setMovieState(prev => ({ ...prev, currentPage: 1, hasMore: true }));
    loadMovies(1, false);
  }, [loadMovies]);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const totalMovies = movieState.movies.length;
  const filteredCount = movieState.filteredMovies.length;
  const isSearching = Boolean(searchState.debouncedQuery.trim());
  const hasActiveFilters = isSearching || sortState.by !== 'popularity' || sortState.order !== 'desc';
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Movie State
    movies: movieState.movies,
    filteredMovies: movieState.filteredMovies,
    loading: movieState.loading,
    error: movieState.error,
    hasMore: movieState.hasMore,
    currentPage: movieState.currentPage,
    
    // Search State
    query: searchState.query,
    debouncedQuery: searchState.debouncedQuery,
    isLoading: searchState.isLoading,
    
    // Sort State
    by: sortState.by,
    order: sortState.order,
    
    // Actions
    setSearchQuery,
    setSortBy,
    setSortOrder,
    loadMore,
    retry,
    refresh,
    
    // Computed
    totalMovies,
    filteredCount,
    isSearching,
    hasActiveFilters,
  };
}; 