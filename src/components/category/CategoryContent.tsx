import { Movie } from '@/types';
import MovieCard from '@/components/features/movies/MovieCard';
import MovieCardSkeleton from '@/components/features/movies/MovieCardSkeleton';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import { FiSearch } from 'react-icons/fi';

interface CategoryContentProps {
  movies: Movie[];
  loading: boolean;
  searchLoading?: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  searchQuery?: string;
  totalMovies?: number;
}

export const CategoryContent = ({
  movies,
  loading,
  searchLoading = false,
  error,
  viewMode,
  hasMore,
  onRetry,
  onLoadMore,
  searchQuery = '',
  totalMovies = 0
}: CategoryContentProps) => {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Determinar si mostrar el estado de carga
  const showLoading = loading && movies.length === 0;
  const showSearchLoading = searchLoading && movies.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;
  const isFiltered = hasSearchQuery && totalMovies > 0 && movies.length !== totalMovies;

  return (
    <>
      {/* Scroll infinito con grid de películas */}
      <InfiniteScroll
        onLoadMore={onLoadMore}
        hasMore={hasMore && !hasSearchQuery} // No cargar más si hay búsqueda activa
        loading={loading && !hasSearchQuery} // No mostrar loading durante búsqueda
        threshold={0.8}
      >
        {/* Información de resultados */}
        {hasSearchQuery && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-3 text-sm">
              <FiSearch className="text-blue-400 h-4 w-4" />
              <span className="text-gray-300">
                Resultados para &quot;{searchQuery}&quot;: 
                <span className="text-blue-400 font-medium ml-1">
                  {movies.length} {movies.length === 1 ? 'película' : 'películas'}
                </span>
                {isFiltered && (
                  <span className="text-gray-500 ml-2">
                    (de {totalMovies} total)
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
            : 'grid-cols-1'
        }`}>
          {movies.map((movie, index) => (
            <MovieCard
              key={`${movie.id}-${index}`}
              movie={movie}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Skeletons de carga inicial */}
        {showLoading && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 10 }).map((_, index) => (
              <MovieCardSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Indicador de búsqueda en progreso */}
        {showSearchLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span>Filtrando resultados...</span>
            </div>
          </div>
        )}
      </InfiniteScroll>

      {/* Sin resultados */}
      {!loading && !searchLoading && movies.length === 0 && (
        <div className="text-center py-12">
          {hasSearchQuery ? (
            <div className="space-y-4">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-300">
                No se encontraron resultados
              </h3>
              <p className="text-gray-400 text-lg">
                No hay películas que coincidan con &quot;{searchQuery}&quot;
              </p>
              <div className="text-sm text-gray-500 mt-4">
                <p>Intenta con:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Palabras diferentes o sinónimos</li>
                  <li>• Términos más generales</li>
                  <li>• Verificar la ortografía</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-300">
                No hay películas disponibles
              </h3>
              <p className="text-gray-400 text-lg">
                No se encontraron películas en esta categoría.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}; 