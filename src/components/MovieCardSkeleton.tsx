interface MovieCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

const MovieCardSkeleton = ({ viewMode = 'grid' }: MovieCardSkeletonProps) => {
  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      {/* Skeleton para la imagen */}
      <div className={`bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 relative overflow-hidden ${
        viewMode === 'grid' ? 'w-full h-[450px]' : 'w-24 h-36 flex-shrink-0'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 to-transparent"></div>
        {/* Efecto de shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      
      {/* Skeleton para el rating */}
      {viewMode === 'grid' && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
      )}
      
      {/* Skeleton para el contenido */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        {viewMode === 'list' && (
          <div className="h-4 bg-gray-700 rounded w-full mt-2 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default MovieCardSkeleton;