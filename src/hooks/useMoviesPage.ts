import { useState, useEffect, useCallback } from 'react';
import { MOVIE_GENRES } from '@/constants/genres';
import { 
  getMoviesByGenre, 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies 
} from '@/lib/api';
import { Movie } from '@/types';

export interface MoviesPageState {
  genreData: Record<number, Movie[]>;
  loading: Record<number, boolean>;
  initialLoading: boolean;
  isInitialLoad: boolean;
  searchQuery: string;
  viewFilter: string;
  quickFilters: string[];
  filteredGenres: Array<typeof MOVIE_GENRES[0]>;
  filteredContent: Movie[];
  filteredContentLoading: boolean;
  showFilteredContent: boolean;
  sortBy: 'popularity' | 'rating' | 'date' | 'name';
  filterStats: {
    totalMovies: number;
    averageRating: number;
    genres: string[];
    years: number[];
  };
  filterHistory: string[];
  isFilterExpanded: boolean;
}

export interface MoviesPageActions {
  setSearchQuery: (query: string) => void;
  setViewFilter: (filter: string) => void;
  handleQuickFilter: (filter: string) => Promise<void>;
  applyFilterFromHistory: (filter: string) => void;
  setSortBy: (sort: 'popularity' | 'rating' | 'date' | 'name') => void;
  setIsFilterExpanded: (expanded: boolean) => void;
  refreshCurrentFilters: () => Promise<void>;
  fetchMoviesByGenre: (genreId: number) => Promise<void>;
}

export const useMoviesPage = (): [MoviesPageState, MoviesPageActions] => {
  const [genreData, setGenreData] = useState<Record<number, Movie[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estados para funcionalidades premium
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [filteredGenres, setFilteredGenres] = useState([...MOVIE_GENRES]);

  // Nuevos estados para filtros rápidos mejorados
  const [filteredContent, setFilteredContent] = useState<Movie[]>([]);
  const [filteredContentLoading, setFilteredContentLoading] = useState(false);
  const [showFilteredContent, setShowFilteredContent] = useState(false);
  
  // Estados adicionales para funcionalidades premium
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date' | 'name'>('popularity');
  const [filterStats, setFilterStats] = useState<{
    totalMovies: number;
    averageRating: number;
    genres: string[];
    years: number[];
  }>({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
  const [filterHistory, setFilterHistory] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Función para eliminar duplicados y procesar datos de películas
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

  // Función para filtros rápidos mejorada
  const handleQuickFilter = async (filter: string) => {
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
  };

  // Función para aplicar filtro desde historial
  const applyFilterFromHistory = (filter: string) => {
    if (!quickFilters.includes(filter)) {
      handleQuickFilter(filter);
    }
  };

  // Función para ordenar contenido
  const sortContent = (content: Movie[], sortType: typeof sortBy) => {
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

  // Función para calcular estadísticas del filtro
  const calculateFilterStats = (movies: Movie[]) => {
    if (movies.length === 0) {
      return { totalMovies: 0, averageRating: 0, genres: [], years: [] };
    }

    const ratings = movies.map(movie => movie.vote_average || 0).filter(rating => rating > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    const genres = Array.from(new Set(movies.flatMap(movie => (movie as any).genre_ids || []))).map(String);
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

  // Función para cargar contenido filtrado mejorada
  const loadFilteredContent = async (filters: string[]) => {
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
      
      // Eliminar duplicados y ordenar
      const uniqueMovies = removeDuplicates(allMovies);
      const sortedMovies = sortContent(uniqueMovies, sortBy);
      
      setFilteredContent(sortedMovies);
      setFilterStats(calculateFilterStats(sortedMovies));
    } catch (error) {
      console.error('Error loading filtered content:', error);
    } finally {
      setFilteredContentLoading(false);
    }
  };

  const fetchMoviesByGenre = async (genreId: number) => {
    if (loading[genreId] || genreData[genreId]?.length > 0) {
      return;
    }

    setLoading(prev => ({ ...prev, [genreId]: true }));

    try {
      const response = await getMoviesByGenre(genreId, 1);
      if (response?.results) {
        const movies = response.results.map((movie: any) => ({
          ...movie,
          media_type: 'movie'
        }));
        
        setGenreData(prev => ({
          ...prev,
          [genreId]: removeDuplicates(movies)
        }));
      }
    } catch (error) {
      console.error(`Error fetching movies for genre ${genreId}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [genreId]: false }));
    }
  };

  const refreshCurrentFilters = async () => {
    if (quickFilters.length > 0) {
      await loadFilteredContent(quickFilters);
    }
  };

  // Efecto para cargar géneros iniciales
  useEffect(() => {
    const loadInitialGenres = async () => {
      setInitialLoading(true);
      try {
        // Cargar los primeros 6 géneros en paralelo
        const initialGenres = MOVIE_GENRES.slice(0, 6);
        await Promise.all(initialGenres.map(genre => fetchMoviesByGenre(genre.id)));
      } catch (error) {
        console.error('Error loading initial genres:', error);
      } finally {
        setInitialLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadInitialGenres();
  }, []);

  // Efecto para actualizar contenido filtrado cuando cambie el ordenamiento
  useEffect(() => {
    if (showFilteredContent && filteredContent.length > 0) {
      const sortedContent = sortContent(filteredContent, sortBy);
      setFilteredContent(sortedContent);
      setFilterStats(calculateFilterStats(sortedContent));
    }
  }, [sortBy]);

  const state: MoviesPageState = {
    genreData,
    loading,
    initialLoading,
    isInitialLoad,
    searchQuery,
    viewFilter,
    quickFilters,
    filteredGenres,
    filteredContent,
    filteredContentLoading,
    showFilteredContent,
    sortBy,
    filterStats,
    filterHistory,
    isFilterExpanded
  };

  const actions: MoviesPageActions = {
    setSearchQuery,
    setViewFilter,
    handleQuickFilter,
    applyFilterFromHistory,
    setSortBy,
    setIsFilterExpanded,
    refreshCurrentFilters,
    fetchMoviesByGenre
  };

  return [state, actions];
}; 