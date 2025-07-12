import Link from 'next/link';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import HorizontalScroll from '@/components/HorizontalScroll';
import { FiTrendingUp, FiStar, FiPlay, FiCalendar, FiTv } from 'react-icons/fi';
import { generateCategoryUrl } from '@/utils/urlHelpers';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  icon: React.ReactNode;
  sectionKey: 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'popularTV' | 'topRatedTV' | 'onAirTV' | 'airingTodayTV';
  activeSection: string;
}

export const MovieSection = ({ title, movies, icon, sectionKey, activeSection }: MovieSectionProps) => (
  <section className="mb-16">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>
      
      <Link
        href={generateCategoryUrl(sectionKey)}
        className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 border border-transparent shadow-sm hover:scale-105 text-sm sm:text-base md:text-lg
          ${
            activeSection === sectionKey
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-800/50'
          }`
        }
      >
        Ver Todo
      </Link>
    </div>

    <HorizontalScroll>
      {movies.map((movie: Movie) => (
        <div key={`${sectionKey}-${movie.id}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
          <MovieCard movie={movie} />
        </div>
      ))}
    </HorizontalScroll>
  </section>
);

interface SectionDividerProps {
  title: string;
}

export const SectionDivider = ({ title }: SectionDividerProps) => (
  <div className="my-16 text-center">
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-700"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-gray-900 text-gray-400 font-semibold">{title}</span>
      </div>
    </div>
  </div>
);

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton = ({ count = 12 }: LoadingSkeletonProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="bg-gray-700 rounded-lg h-64 mb-2"></div>
        <div className="bg-gray-700 rounded h-4 mb-1"></div>
        <div className="bg-gray-700 rounded h-3 w-2/3"></div>
      </div>
    ))}
  </div>
);

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

export const LoadingState = ({ title = "Cargando...", subtitle = "Preparando contenido" }: LoadingStateProps) => (
  <main className="container mx-auto px-4 py-8">
    <div className="text-center mb-12">
      <div className="h-16 bg-gray-700 rounded-lg animate-pulse mb-4"></div>
      <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
    </div>
    <LoadingSkeleton />
  </main>
);

// Iconos predefinidos para las secciones
export const SectionIcons = {
  trending: <FiTrendingUp className="h-6 w-6 text-blue-400" />,
  star: <FiStar className="h-6 w-6 text-yellow-400" />,
  play: <FiPlay className="h-6 w-6 text-green-400" />,
  calendar: <FiCalendar className="h-6 w-6 text-red-400" />,
  tv: <FiTv className="h-6 w-6 text-purple-400" />
}; 