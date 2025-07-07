import { FiTrendingUp, FiStar, FiPlay, FiCalendar, FiTv } from 'react-icons/fi';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getOnAirTVShows,
  getAiringTodayTVShows
} from "@/lib/api";

export interface CategoryConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  apiFunction: (page: number) => Promise<{ results: any[]; total_pages: number }>;
  mediaType: 'movie' | 'tv';
}

export const categoryConfig: Record<string, CategoryConfig> = {
  // Movie Categories
  popular: {
    title: "Películas Populares",
    description: "Descubre las películas más populares del momento",
    icon: FiTrendingUp,
    color: "from-orange-500 to-red-500",
    apiFunction: getPopularMovies,
    mediaType: 'movie'
  },
  top_rated: {
    title: "Mejor Valoradas",
    description: "Las películas con las mejores calificaciones",
    icon: FiStar,
    color: "from-yellow-500 to-orange-500",
    apiFunction: getTopRatedMovies,
    mediaType: 'movie'
  },
  now_playing: {
    title: "Actualmente en Cines",
    description: "Películas que están en cartelera ahora",
    icon: FiPlay,
    color: "from-green-500 to-blue-500",
    apiFunction: getNowPlayingMovies,
    mediaType: 'movie'
  },
  upcoming: {
    title: "Próximamente",
    description: "Películas que llegarán pronto a los cines",
    icon: FiCalendar,
    color: "from-purple-500 to-pink-500",
    apiFunction: getUpcomingMovies,
    mediaType: 'movie'
  },
  
  // TV Series Categories
  popularTV: {
    title: "Series de TV Populares",
    description: "Descubre las series de televisión más populares del momento",
    icon: FiTv,
    color: "from-purple-500 to-indigo-500",
    apiFunction: getPopularTVShows,
    mediaType: 'tv'
  },
  topRatedTV: {
    title: "Series de TV Mejor Valoradas",
    description: "Las series de televisión con las mejores calificaciones",
    icon: FiStar,
    color: "from-purple-500 to-pink-500",
    apiFunction: getTopRatedTVShows,
    mediaType: 'tv'
  },
  onAirTV: {
    title: "Series Actualmente en Emisión",
    description: "Series de televisión que están actualmente en emisión",
    icon: FiPlay,
    color: "from-purple-500 to-blue-500",
    apiFunction: getOnAirTVShows,
    mediaType: 'tv'
  },
  airingTodayTV: {
    title: "Series que se Emiten Hoy",
    description: "Series de televisión que se emiten hoy",
    icon: FiCalendar,
    color: "from-purple-500 to-green-500",
    apiFunction: getAiringTodayTVShows,
    mediaType: 'tv'
  }
}; 