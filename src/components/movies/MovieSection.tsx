'use client';

import { ReactNode } from 'react';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import HorizontalScroll from '@/components/HorizontalScroll';
import { FiFilter } from 'react-icons/fi';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  icon: ReactNode;
  loading?: boolean;
  error?: string | null;
  showFilter?: boolean;
  onFilterClick?: () => void;
  isActive?: boolean;
  className?: string;
  skeletonCount?: number;
}

export default function MovieSection({
  title,
  movies,
  icon,
  loading = false,
  error = null,
  showFilter = false,
  onFilterClick,
  isActive = false,
  className = "",
  skeletonCount = 12
}: MovieSectionProps) {
  if (error) {
    return (
      <section className={`mb-16 ${className}`}>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`mb-16 ${className}`}>
      {/* Header de la sección */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
        </div>
        
        {showFilter && onFilterClick && (
          <button
            onClick={onFilterClick}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            <FiFilter className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        // Skeleton loading
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        // Películas con scroll horizontal
        <HorizontalScroll>
          {movies.map((movie: Movie) => (
            <div key={`${title}-${movie.id}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
              <MovieCard movie={movie} />
            </div>
          ))}
        </HorizontalScroll>
      ) : (
        // Sin películas
        <div className="text-center py-12">
          <p className="text-gray-400">No hay películas disponibles</p>
        </div>
      )}
    </section>
  );
}

// Variante con grid en lugar de scroll horizontal
export function MovieGridSection({
  title,
  movies,
  icon,
  loading = false,
  error = null,
  showFilter = false,
  onFilterClick,
  isActive = false,
  className = "",
  skeletonCount = 12
}: MovieSectionProps) {
  if (error) {
    return (
      <section className={`mb-16 ${className}`}>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`mb-16 ${className}`}>
      {/* Header de la sección */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
        </div>
        
        {showFilter && onFilterClick && (
          <button
            onClick={onFilterClick}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            <FiFilter className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        // Skeleton loading
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        // Películas en grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie: Movie) => (
            <MovieCard key={`${title}-${movie.id}`} movie={movie} />
          ))}
        </div>
      ) : (
        // Sin películas
        <div className="text-center py-12">
          <p className="text-gray-400">No hay películas disponibles</p>
        </div>
      )}
    </section>
  );
} 