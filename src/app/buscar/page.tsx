'use client';

import { useState, useEffect, use } from 'react';
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import InfiniteScroll from "@/components/InfiniteScroll";
import { searchMovies, searchMoviesAdvanced } from "@/lib/api";
import { Movie } from "@/types";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import { FiSearch, FiTrendingUp, FiFilter, FiX } from 'react-icons/fi';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface SearchFilters {
  year: string;
  genre: string;
  rating: string;
  sortBy: string;
  includeAdult: boolean;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // Desenvolver searchParams usando React.use()
  const resolvedSearchParams = use(searchParams) as { [key: string]: string | string[] | undefined };
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    year: '',
    genre: '',
    rating: '',
    sortBy: 'relevance',
    includeAdult: false
  });
  
  const { notifications, showSuccess, showError } = useNotifications();
  
  const query = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query : "";
  
  // Extraer filtros de los parámetros de URL
  const urlYear = typeof resolvedSearchParams.year === 'string' ? resolvedSearchParams.year : "";
  const urlGenre = typeof resolvedSearchParams.genre === 'string' ? resolvedSearchParams.genre : "";
  const urlRating = typeof resolvedSearchParams.rating === 'string' ? resolvedSearchParams.rating : "";
  const urlSortBy = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : "relevance";
  const urlIncludeAdult = typeof resolvedSearchParams.include_adult === 'string' ? resolvedSearchParams.include_adult === 'true' : false;

  // Actualizar filtros activos cuando cambian los parámetros de URL
  useEffect(() => {
    setActiveFilters({
      year: urlYear,
      genre: urlGenre,
      rating: urlRating,
      sortBy: urlSortBy,
      includeAdult: urlIncludeAdult
    });
  }, [urlYear, urlGenre, urlRating, urlSortBy, urlIncludeAdult]);

  // Función para eliminar duplicados basada en ID
  const removeDuplicates = (movies: Movie[]): Movie[] => {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  };

  // Función para obtener el nombre del género
  const getGenreName = (genreId: string): string => {
    const genreMap: Record<string, string> = {
      '28': 'Acción',
      '12': 'Aventura',
      '16': 'Animación',
      '35': 'Comedia',
      '80': 'Crimen',
      '99': 'Documental',
      '18': 'Drama',
      '10751': 'Familiar',
      '14': 'Fantasía',
      '36': 'Historia',
      '27': 'Terror',
      '10402': 'Música',
      '9648': 'Misterio',
      '10749': 'Romance',
      '878': 'Ciencia ficción',
      '10770': 'Película de TV',
      '53': 'Suspense',
      '10752': 'Guerra',
      '37': 'Western'
    };
    return genreMap[genreId] || genreId;
  };

  // Función para obtener el nombre del ordenamiento
  const getSortName = (sortBy: string): string => {
    const sortMap: Record<string, string> = {
      'relevance': 'Relevancia',
      'popularity.desc': 'Popularidad',
      'vote_average.desc': 'Rating',
      'release_date.desc': 'Fecha',
      'title.asc': 'Título A-Z'
    };
    return sortMap[sortBy] || sortBy;
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    const newUrl = params.toString() ? `/buscar?${params.toString()}` : '/buscar';
    window.history.pushState({}, '', newUrl);
    setActiveFilters({
      year: '',
      genre: '',
      rating: '',
      sortBy: 'relevance',
      includeAdult: false
    });
  };

  const fetchSearchResults = async (searchQuery: string, pageNum: number = 1, reset: boolean = false) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      // Determinar si usar búsqueda básica o avanzada
      const hasAdvancedFilters = activeFilters.year || activeFilters.genre || activeFilters.rating || 
                                (activeFilters.sortBy && activeFilters.sortBy !== 'relevance');

      let response;
      
      if (hasAdvancedFilters) {
        // Usar búsqueda avanzada con filtros
        response = await searchMoviesAdvanced(searchQuery, pageNum, activeFilters);
      } else {
        // Usar búsqueda básica
        response = await searchMovies(searchQuery, pageNum, {
          include_adult: activeFilters.includeAdult
        });
      }
      let newMovies = response.results;
      
      // Aplicar filtros adicionales en el cliente si es necesario
      if (hasAdvancedFilters) {
        newMovies = newMovies.filter((movie: Movie) => {
          // Filtro por año
          if (activeFilters.year && movie.release_date) {
            const movieYear = new Date(movie.release_date).getFullYear().toString();
            if (movieYear !== activeFilters.year) return false;
          }
          
          // Filtro por rating
          if (activeFilters.rating && movie.vote_average) {
            if (movie.vote_average < parseFloat(activeFilters.rating)) return false;
          }
          
          // Filtro por género (si la película tiene géneros)
          if (activeFilters.genre) {
            const genreIds = (movie as any).genre_ids || movie.genres?.map(g => g.id) || [];
            if (!genreIds.includes(parseInt(activeFilters.genre))) return false;
          }
          
          return true;
        });
      }
      
      if (reset) {
        setMovies(removeDuplicates(newMovies));
        setPage(1);
      } else {
        setMovies(prev => removeDuplicates([...prev, ...newMovies]));
      }
      
      setTotalResults(response.total_results || 0);
      setHasMore(pageNum < (response.total_pages || 1));
      
      // Solo mostrar toast si no es la búsqueda inicial
      if (pageNum === 1 && !isInitialSearch) {
        const filterText = getActiveFiltersText();
        showSuccess(
          'Búsqueda completada', 
          `Se encontraron ${newMovies.length} películas para "${searchQuery}"${filterText}`
        );
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      showError('Error en la búsqueda', 'No se pudieron cargar los resultados. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener texto de filtros activos
  const getActiveFiltersText = (): string => {
    const activeFiltersList = [];
    
    if (activeFilters.year) activeFiltersList.push(`año ${activeFilters.year}`);
    if (activeFilters.genre) activeFiltersList.push(`género ${getGenreName(activeFilters.genre)}`);
    if (activeFilters.rating) activeFiltersList.push(`rating ${activeFilters.rating}+`);
    if (activeFilters.sortBy !== 'relevance') activeFiltersList.push(`ordenado por ${getSortName(activeFilters.sortBy)}`);
    
    return activeFiltersList.length > 0 ? ` (${activeFiltersList.join(', ')})` : '';
  };

  const loadMore = async () => {
    if (loading || !hasMore || !query) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchSearchResults(query, nextPage, false);
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults(query, 1, true);
      // Mostrar toast solo después de la primera búsqueda
      if (!isInitialSearch) {
        const filterText = getActiveFiltersText();
        showSuccess(
          'Búsqueda completada', 
          `Buscando resultados para "${query}"${filterText}`
        );
      }
    } else {
      setMovies([]);
      setTotalResults(0);
    }
  }, [query, activeFilters]);

  // Marcar que ya no es la búsqueda inicial después del primer render
  useEffect(() => {
    if (query && isInitialSearch) {
      setIsInitialSearch(false);
    }
  }, [query, isInitialSearch]);

  // Contar filtros activos
  const activeFiltersCount = Object.values(activeFilters).filter(value => 
    value !== '' && value !== 'relevance' && value !== false
  ).length;

  return (
    <>
      <div className="container mx-auto p-4 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Filtros y resultados */}
        {query && (
          <div className="mb-6">
            {/* Información de resultados */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-300 text-sm sm:text-base">
                  {totalResults > 0 
                    ? `${totalResults} resultado${totalResults !== 1 ? 's' : ''} para "${query}"`
                    : 'No se encontraron resultados'
                  }
                </p>
                
                {/* Mostrar filtros activos */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <FiFilter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                      aria-label="Limpiar filtros"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles de filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.year && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    Año: {activeFilters.year}
                  </span>
                )}
                {activeFilters.genre && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                    Género: {getGenreName(activeFilters.genre)}
                  </span>
                )}
                {activeFilters.rating && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                    Rating: {activeFilters.rating}+
                  </span>
                )}
                {activeFilters.sortBy !== 'relevance' && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    Orden: {getSortName(activeFilters.sortBy)}
                  </span>
                )}
                {activeFilters.includeAdult && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                    +18
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        {query && (
          <div>
            {loading && movies.length === 0 ? (
              // Skeleton loading para carga inicial
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : movies.length > 0 ? (
              // Resultados con infinite scroll
              <InfiniteScroll
                onLoadMore={loadMore}
                hasMore={hasMore}
                loading={loading}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {movies.map((movie: Movie) => (
                    <MovieCard key={`search-${movie.id}`} movie={movie} />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              // Sin resultados
              <div className="text-center py-16">
                <FiTrendingUp className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-400">
                  No hay películas que coincidan con &quot;{query}&quot;{getActiveFiltersText()}. 
                  Intenta con otros términos de búsqueda o ajusta los filtros.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado inicial */}
        {!query && (
          <div className="text-center py-16">
            <FiSearch className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Busca películas</h3>
            <p className="text-gray-400">
              Usa la barra de búsqueda para encontrar tus películas favoritas
            </p>
          </div>
        )}
      </div>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />
    </>
  );
}
