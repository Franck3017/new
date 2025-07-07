import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';

interface CategoryContentProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}

export const CategoryContent = ({
  movies,
  loading,
  error,
  viewMode,
  hasMore,
  onRetry,
  onLoadMore
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

  return (
    <>
      {/* Grid de películas */}
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

      {/* Skeletons de carga */}
      {loading && (
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

      {/* Botón cargar más */}
      {hasMore && !loading && movies.length > 0 && (
        <div className="text-center mt-12">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Cargar más películas
          </button>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No se encontraron películas que coincidan con tu búsqueda.</p>
        </div>
      )}
    </>
  );
}; 