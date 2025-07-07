'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import InfiniteScroll from "@/components/InfiniteScroll";
import { searchMovies } from "@/lib/api";
import { Movie } from "@/types";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import { FiFilter, FiX, FiSearch, FiTrendingUp } from 'react-icons/fi';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  
  const { notifications, showSuccess, showError } = useNotifications();
  
  const query = typeof searchParams.query === 'string' ? searchParams.query : "";
  const year = typeof searchParams.year === 'string' ? searchParams.year : "";
  const genre = typeof searchParams.genre === 'string' ? searchParams.genre : "";
  const rating = typeof searchParams.rating === 'string' ? searchParams.rating : "";
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : "relevance";

  const [filters, setFilters] = useState({
    year: year,
    genre: genre,
    rating: rating,
    sortBy: sort
  });

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
  }, [query, filters]);

  // Marcar que ya no es la búsqueda inicial después del primer render
  useEffect(() => {
    if (query && isInitialSearch) {
      setIsInitialSearch(false);
    }
  }, [query, isInitialSearch]);

  const clearFilters = () => {
    setFilters({
      year: '',
      genre: '',
      rating: '',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = filters.year || filters.genre || filters.rating || filters.sortBy !== 'relevance';

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
                <p className="text-gray-300">
                  {totalResults > 0 
                    ? `${totalResults} resultado${totalResults !== 1 ? 's' : ''} para "${query}"`
                    : 'No se encontraron resultados'
                  }
                </p>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                  >
                    <FiX className="h-4 w-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <FiFilter className="h-4 w-4" />
                Filtros
              </button>
            </div>

            {/* Filtros avanzados */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Año</label>
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Cualquier año</option>
                      {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Género</label>
                    <select
                      value={filters.genre}
                      onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                      className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Cualquier género</option>
                      <option value="28">Acción</option>
                      <option value="12">Aventura</option>
                      <option value="16">Animación</option>
                      <option value="35">Comedia</option>
                      <option value="80">Crimen</option>
                      <option value="99">Documental</option>
                      <option value="18">Drama</option>
                      <option value="10751">Familiar</option>
                      <option value="14">Fantasía</option>
                      <option value="36">Historia</option>
                      <option value="27">Terror</option>
                      <option value="10402">Música</option>
                      <option value="9648">Misterio</option>
                      <option value="10749">Romance</option>
                      <option value="878">Ciencia ficción</option>
                      <option value="10770">Película de TV</option>
                      <option value="53">Suspense</option>
                      <option value="10752">Guerra</option>
                      <option value="37">Western</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rating mínimo</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Cualquier rating</option>
                      <option value="9">9+</option>
                      <option value="8">8+</option>
                      <option value="7">7+</option>
                      <option value="6">6+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ordenar por</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="relevance">Relevancia</option>
                      <option value="popularity">Popularidad</option>
                      <option value="rating">Rating</option>
                      <option value="date">Fecha</option>
                    </select>
                  </div>
                </div>
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
