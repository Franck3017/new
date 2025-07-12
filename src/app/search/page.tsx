'use client';

import { useState, useEffect, use } from 'react';
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import InfiniteScroll from "@/components/InfiniteScroll";
import { searchMovies } from "@/lib/api";
import { Movie } from "@/types";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import { FiSearch, FiTrendingUp } from 'react-icons/fi';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  
  const { notifications, showSuccess, showError } = useNotifications();
  
  const query = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query : "";

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

  const fetchSearchResults = async (searchQuery: string, pageNum: number = 1, reset: boolean = false) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      const response = await searchMovies(searchQuery);
      const newMovies = response.results;
      
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
        showSuccess(
          'Búsqueda completada', 
          `Se encontraron ${newMovies.length} películas para "${searchQuery}"`
        );
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      showError('Error en la búsqueda', 'No se pudieron cargar los resultados. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
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
        showSuccess(
          'Búsqueda completada', 
          `Buscando resultados para "${query}"`
        );
      }
    } else {
      setMovies([]);
      setTotalResults(0);
    }
  }, [query]);

  // Marcar que ya no es la búsqueda inicial después del primer render
  useEffect(() => {
    if (query && isInitialSearch) {
      setIsInitialSearch(false);
    }
  }, [query, isInitialSearch]);

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
                
              </div>
            </div>

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
                  No hay películas que coincidan con &quot;{query}&quot;. 
                  Intenta con otros términos de búsqueda.
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
