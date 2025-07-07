import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/types';
import { useNotifications } from '@/components/Notification';

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

export const useCategoryMovies = ({ config, category }: UseCategoryMoviesProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  
  const { showError } = useNotifications();

  // Función para eliminar duplicados basada en ID
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
      media_type: config?.mediaType || 'movie' // Usar el tipo de medio de la configuración
    }));
  };

  // Función para cargar películas
  const loadMovies = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!config) return;
    
    try {
      setLoading(true);
      const response = await config.apiFunction(pageNum);
      
      // Verificar que la respuesta tenga la estructura correcta
      if (!response || !response.results || !Array.isArray(response.results)) {
        setError('Formato de respuesta inválido');
        return;
      }
      
      const newMovies = response.results;
      
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(pageNum < (response.total_pages || 1));
      }
      
      if (append) {
        setMovies(prev => removeDuplicates([...prev, ...newMovies]));
      } else {
        setMovies(removeDuplicates(newMovies));
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las películas';
      setError(errorMessage);
      showError('Error al cargar películas', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [config, showError]);

  // Cargar películas iniciales
  useEffect(() => {
    if (config) {
      setPage(1);
      setHasMore(true);
      loadMovies(1, false);
    }
  }, [category, loadMovies]);

  // Filtrar y ordenar películas
  useEffect(() => {
    // Verificar que movies sea un array
    if (!Array.isArray(movies)) {
      setFilteredMovies([]);
      return;
    }

    let filtered = [...movies]; // Crear una copia del array
    
    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(movie => {
        const title = movie.title || movie.name || '';
        const overview = movie.overview || '';
        const query = searchQuery.toLowerCase();
        
        return title.toLowerCase().includes(query) || overview.toLowerCase().includes(query);
      });
    }
    
    // Ordenar
    filtered.sort((a, b) => {
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
          // Handle both movie release_date and TV series first_air_date
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
    
    setFilteredMovies(removeDuplicates(filtered));
  }, [movies, searchQuery, sortBy, sortOrder]);

  // Cargar más películas
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMovies(nextPage, true);
    }
  };

  // Reintentar carga
  const retry = () => {
    loadMovies(1, false);
  };

  return {
    // Estado
    movies,
    filteredMovies,
    loading,
    error,
    hasMore,
    sortBy,
    sortOrder,
    searchQuery,
    
    // Acciones
    setSortBy,
    setSortOrder,
    setSearchQuery,
    loadMore,
    retry,
  };
}; 