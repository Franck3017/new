import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MOVIE_GENRES } from '@/constants/genres';
import { 
  getMoviesByGenre, 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies 
} from '@/lib/api';
import { Movie } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SortByType = 'popularity' | 'rating' | 'date' | 'name';
export type QuickFilterType = 'live' | 'rated' | 'trending' | 'new';

export interface FilterStats {
  totalMovies: number;
  averageRating: number;
  genres: string[];
  years: number[];
}

export interface UseMoviesPageReturn {
  // Data
  genreData: Record<number, Movie[]>;
  filteredGenres: any[];
  filteredContent: Movie[];
  filterStats: FilterStats;
  filterHistory: string[];
  
  // State
  loading: Record<number, boolean>;
  initialLoading: boolean;
  isInitialLoad: boolean;
  searchQuery: string;
  viewFilter: string;
  quickFilters: string[];
  sortBy: SortByType;
  filteredContentLoading: boolean;
  showFilteredContent: boolean;
  isFilterExpanded: boolean;
  
  // Actions
  handleSearch: (query: string) => void;
  handleQuickFilter: (filter: QuickFilterType) => void;
  applyFilterFromHistory: (filter: string) => void;
  handleViewFilter: (filter: string) => void;
  handleSortBy: (sortType: SortByType) => void;
  toggleFilterExpanded: () => void;
  refreshCurrentFilters: () => void;
  clearAllFilters: () => void;
  clearSearch: () => void;
  clearQuickFilters: () => void;
  goBackToGenres: () => void;
  
  // Computed
  hasActiveFilters: boolean;
  searchResultsCount: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const removeDuplicates = (movies: Movie[]): Movie[] => {
  const seen = new Set();
  return movies.filter(movie => {
    if (seen.has(movie.id)) {
      return false;
    }
    seen.add(movie.id);
    return true;
  }).map(movie => ({
    ...movie,
    media_type: 'movie'
  }));
};

const sortContent = (content: Movie[], sortType: SortByType): Movie[] => {
  const sorted = [...content];
  
  switch (sortType) {
    case 'popularity':
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case 'rating':
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case 'date':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.release_date || '1900-01-01');
        const dateB = new Date(b.release_date || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      });
    case 'name':
      return sorted.sort((a, b) => {
        const nameA = (a.title || '').toLowerCase();
        const nameB = (b.title || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    default:
      return sorted;
  }
};

const calculateFilterStats = (movies: Movie[]): FilterStats => {
  if (movies.length === 0) {
    return { totalMovies: 0, averageRating: 0, genres: [], years: [] };
  }

  const ratings = movies.map(movie => movie.vote_average || 0).filter(rating => rating > 0);
  const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  
  const genres = Array.from(new Set(movies.flatMap(movie => (movie as any).genre_ids || [])));
  const years = Array.from(new Set(movies.map(movie => {
    const date = movie.release_date;
    return date ? new Date(date).getFullYear() : null;
  }).filter(year => year !== null))).sort((a, b) => b - a);

  return {
    totalMovies: movies.length,
    averageRating: Math.round(averageRating * 10) / 10,
    genres: genres.map(id => MOVIE_GENRES.find(g => g.id === id)?.name || '').filter(name => name),
    years: years as number[]
  };
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useMoviesPage = (): UseMoviesPageReturn => {
  const pathname = usePathname();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [genreData, setGenreData] = useState<Record<number, Movie[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estados para funcionalidades premium
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const [quickFilters, setQuickFilters] = useState<QuickFilterType[]>([]);
  const [filteredGenres, setFilteredGenres] = useState<any[]>([...MOVIE_GENRES]);

  // Estados para filtros rápidos mejorados
  const [filteredContent, setFilteredContent] = useState<Movie[]>([]);
  const [filteredContentLoading, setFilteredContentLoading] = useState(false);
  const [showFilteredContent, setShowFilteredContent] = useState(false);
  
  // Estados adicionales para funcionalidades premium
  const [sortBy, setSortBy] = useState<SortByType>('popularity');
  const [filterStats, setFilterStats] = useState<FilterStats>({ 
    totalMovies: 0, 
    averageRating: 0, 
    genres: [], 
    years: [] 
  });
  const [filterHistory, setFilterHistory] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Ref para evitar el loop infinito en el sorting
  const lastSortBy = useRef<SortByType>(sortBy);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const hasActiveFilters = Boolean(searchQuery || quickFilters.length > 0 || viewFilter !== 'all');
  const searchResultsCount = filteredGenres.length;

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickFilter = useCallback(async (filter: QuickFilterType) => {
    setQuickFilters(prev => {
      const newFilters = prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter];
      
      // Guardar en historial si es un nuevo filtro
      if (!prev.includes(filter)) {
        setFilterHistory(prevHistory => {
          const newHistory = [filter, ...prevHistory.filter(f => f !== filter)].slice(0, 5);
          return newHistory;
        });
      }
      
      // Si no hay filtros activos, mostrar contenido normal por géneros
      if (newFilters.length === 0) {
        setShowFilteredContent(false);
        setFilteredContent([]);
        setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
        return newFilters;
      }
      
      // Si hay filtros activos, cargar contenido filtrado
      loadFilteredContent(newFilters);
      return newFilters;
    });
  }, []);

  const applyFilterFromHistory = useCallback((filter: string) => {
    if (!quickFilters.includes(filter as QuickFilterType)) {
      handleQuickFilter(filter as QuickFilterType);
    }
  }, [quickFilters, handleQuickFilter]);

  const handleViewFilter = useCallback((filter: string) => {
    setViewFilter(filter);
  }, []);

  const handleSortBy = useCallback((sortType: SortByType) => {
    setSortBy(sortType);
    // Actualizar el contenido filtrado inmediatamente si existe
    if (filteredContent.length > 0) {
      const sorted = sortContent(filteredContent, sortType);
      setFilteredContent(sorted);
    }
  }, [filteredContent]);

  const toggleFilterExpanded = useCallback(() => {
    setIsFilterExpanded(prev => !prev);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setQuickFilters([]);
    setViewFilter('all');
    setShowFilteredContent(false);
    setFilteredContent([]);
    setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const clearQuickFilters = useCallback(() => {
    setQuickFilters([]);
    setShowFilteredContent(false);
    setFilteredContent([]);
    setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
  }, []);

  const goBackToGenres = useCallback(() => {
    clearQuickFilters();
  }, [clearQuickFilters]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  const fetchMoviesByGenre = useCallback(async (genreId: number) => {
    if (loading[genreId]) {
      return;
    }

    setLoading(prev => ({ ...prev, [genreId]: true }));

    try {
      const response = await getMoviesByGenre(genreId.toString(), 1);
      const movies = removeDuplicates(response.results || []);
      
      setGenreData(prev => ({
        ...prev,
        [genreId]: movies
      }));
    } catch (error) {
      console.error(`Error fetching movies for genre ${genreId}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [genreId]: false }));
    }
  }, [loading]);

  const loadFilteredContent = useCallback(async (filters: QuickFilterType[]) => {
    setFilteredContentLoading(true);
    setShowFilteredContent(true);
    
    try {
      const allMovies: Movie[] = [];
      
      // Cargar contenido para cada filtro activo
      for (const filter of filters) {
        let response;
        
        switch (filter) {
          case 'live':
            response = await getNowPlayingMovies(1);
            break;
          case 'rated':
            response = await getTopRatedMovies(1);
            break;
          case 'trending':
            response = await getPopularMovies(1);
            break;
          case 'new':
            response = await getUpcomingMovies(1);
            break;
          default:
            continue;
        }
        
        if (response?.results) {
          const movies = response.results.map((movie: any) => ({
            ...movie,
            media_type: 'movie'
          }));
          allMovies.push(...movies);
        }
      }
      
      // Eliminar duplicados y limitar a 30 películas
      const uniqueMovies = removeDuplicates(allMovies).slice(0, 30);
      
      // Ordenar contenido según el criterio seleccionado
      const sortedMovies = sortContent(uniqueMovies, sortBy);
      
      // Calcular estadísticas
      const stats = calculateFilterStats(sortedMovies);
      
      setFilteredContent(sortedMovies);
      setFilterStats(stats);
      
    } catch (error) {
      console.error('Error loading filtered content:', error);
      setFilteredContent([]);
      setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
    } finally {
      setFilteredContentLoading(false);
    }
  }, [sortBy]);

  const refreshCurrentFilters = useCallback(() => {
    if (quickFilters.length > 0) {
      loadFilteredContent(quickFilters);
    }
  }, [quickFilters, loadFilteredContent]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      // Cargar los primeros 8 géneros en paralelo
      const initialGenres = MOVIE_GENRES.slice(0, 8);
      const promises = initialGenres.map(genre => fetchMoviesByGenre(genre.id));
      await Promise.all(promises);

      // Cargar géneros restantes en segundo plano
      setTimeout(async () => {
        const remainingGenres = MOVIE_GENRES.slice(8);
        
        // Cargar en paralelo con límite de 3 a la vez
        for (let i = 0; i < remainingGenres.length; i += 3) {
          const batch = remainingGenres.slice(i, i + 3);
          const batchPromises = batch.map(genre => fetchMoviesByGenre(genre.id));
          await Promise.all(batchPromises);
        }
      }, 1000);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setInitialLoading(false);
      setIsInitialLoad(false);
    }
  }, [fetchMoviesByGenre]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredGenres([...MOVIE_GENRES]);
        return;
      }

      const searchTerm = searchQuery.toLowerCase();
      const filtered = MOVIE_GENRES.filter(genre => 
        genre.name.toLowerCase().includes(searchTerm) ||
        (genreData[genre.id] && genreData[genre.id].some(movie => 
          (movie.title || '').toLowerCase().includes(searchTerm)
        ))
      );
      setFilteredGenres(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, genreData]);

  // Efecto para actualizar ordenamiento cuando cambie (sin loop infinito)
  useEffect(() => {
    // Solo actualizar si el sortBy realmente cambió y hay contenido filtrado
    if (lastSortBy.current !== sortBy && filteredContent.length > 0) {
      const sorted = sortContent(filteredContent, sortBy);
      setFilteredContent(sorted);
      lastSortBy.current = sortBy;
    }
  }, [sortBy]); // Removido filteredContent de las dependencias

  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Data
    genreData,
    filteredGenres,
    filteredContent,
    filterStats,
    filterHistory,
    
    // State
    loading,
    initialLoading,
    isInitialLoad,
    searchQuery,
    viewFilter,
    quickFilters,
    sortBy,
    filteredContentLoading,
    showFilteredContent,
    isFilterExpanded,
    
    // Actions
    handleSearch,
    handleQuickFilter,
    applyFilterFromHistory,
    handleViewFilter,
    handleSortBy,
    toggleFilterExpanded,
    refreshCurrentFilters,
    clearAllFilters,
    clearSearch,
    clearQuickFilters,
    goBackToGenres,
    
    // Computed
    hasActiveFilters: Boolean(searchQuery) || quickFilters.length > 0 || viewFilter !== 'all',
    searchResultsCount,
  };
}; 