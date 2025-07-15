interface MovieCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  showRating?: boolean;
  showYear?: boolean;
  showGenres?: boolean;
}

interface MovieCardSkeletonGridProps {
  count?: number;
  viewMode?: 'grid' | 'list';
  showRating?: boolean;
  showYear?: boolean;
  showGenres?: boolean;
}

const MovieCardSkeleton = ({ 
  viewMode = 'grid', 
  showRating = true, 
  showYear = true, 
  showGenres = true 
}: MovieCardSkeletonProps) => {
  return (
    <div className={`relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 group hover:bg-gray-800/70 transition-all duration-300 ${
      viewMode === 'list' ? 'flex' : 'hover:scale-105'
    }`}>
      {/* Skeleton para la imagen */}
      <div className={`relative overflow-hidden ${
        viewMode === 'grid' ? 'w-full h-[450px] sm:h-[500px] lg:h-[550px]' : 'w-24 h-36 sm:w-32 sm:h-48 flex-shrink-0'
      }`}>
        {/* Fondo base con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700"></div>
        
        {/* Overlay superior */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
        
        {/* Efecto de shimmer mejorado */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Badges flotantes */}
        {showRating && viewMode === 'grid' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="w-3 h-3 bg-yellow-400/50 rounded-full animate-pulse"></div>
            <div className="w-8 h-3 bg-gray-600 rounded animate-pulse"></div>
          </div>
        )}
        
        {/* Badge de año */}
        {showYear && viewMode === 'grid' && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="w-8 h-3 bg-gray-600 rounded animate-pulse"></div>
          </div>
        )}
        
        {/* Botón de play centrado */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-sm animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Skeleton para el contenido */}
      <div className={`p-4 sm:p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
        {/* Título */}
        <div className="space-y-3">
          <div className="h-5 sm:h-6 bg-gray-700 rounded-lg w-4/5 animate-pulse"></div>
          {viewMode === 'list' && (
            <div className="h-4 bg-gray-700 rounded-lg w-full animate-pulse"></div>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="mt-3 sm:mt-4 space-y-2">
          {/* Rating y año en línea */}
          <div className="flex items-center gap-3">
            {showRating && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400/50 rounded-full animate-pulse"></div>
                <div className="w-8 h-3 bg-gray-700 rounded animate-pulse"></div>
              </div>
            )}
            {showYear && (
              <div className="w-12 h-3 bg-gray-700 rounded animate-pulse"></div>
            )}
          </div>
          
          {/* Géneros */}
          {showGenres && (
            <div className="flex flex-wrap gap-2">
              <div className="w-16 h-6 bg-gray-700/50 rounded-lg animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-700/50 rounded-lg animate-pulse"></div>
              <div className="w-14 h-6 bg-gray-700/50 rounded-lg animate-pulse"></div>
            </div>
          )}
          
          {/* Descripción (solo en list view) */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Botones de acción (solo en grid view) */}
        {viewMode === 'grid' && (
          <div className="mt-4 sm:mt-6 flex items-center gap-2">
            <div className="flex-1 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-700/50 rounded-xl animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-700/50 rounded-xl animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Efecto de hover adicional */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

// Componente para mostrar múltiples skeletons
const MovieCardSkeletonGrid = ({ 
  count = 6, 
  viewMode = 'grid',
  showRating = true,
  showYear = true,
  showGenres = true
}: MovieCardSkeletonGridProps) => {
  return (
    <div className={`grid gap-4 sm:gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
        : 'grid-cols-1'
    }`}>
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton
          key={index}
          viewMode={viewMode}
          showRating={showRating}
          showYear={showYear}
          showGenres={showGenres}
        />
      ))}
    </div>
  );
};

export default MovieCardSkeleton;
export { MovieCardSkeletonGrid };