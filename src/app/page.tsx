'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import HorizontalScroll from "@/components/HorizontalScroll";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import { Movie } from "@/types";
import { FiTrendingUp, FiStar, FiPlay, FiCalendar, FiTv } from 'react-icons/fi';
import APITest from "@/components/APITest";
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';

// Cache optimizado ya está en lib/cache.ts

export default function Home() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);

  // TV Series state
  const [popularTVShows, setPopularTVShows] = useState<Movie[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<Movie[]>([]);
  const [onAirTVShows, setOnAirTVShows] = useState<Movie[]>([]);
  const [airingTodayTVShows, setAiringTodayTVShows] = useState<Movie[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'popular' | 'top_rated' | 'now_playing' | 'upcoming'>('popular');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { notifications, showSuccess, showError } = useNotifications();

  // Refs para controlar si ya se está cargando
  const loadingRefs = useRef({
    popular: false,
    topRated: false,
    nowPlaying: false,
    upcoming: false,
    popularTV: false,
    topRatedTV: false,
    onAirTV: false,
    airingTodayTV: false
  });

  // Función para eliminar duplicados basada en ID
  const removeDuplicates = (movies: Movie[], mediaType: 'movie' | 'tv' = 'movie'): Movie[] => {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    }).map(movie => ({
      ...movie,
      media_type: mediaType // Agregar el tipo de medio para que MovieCard sepa que es una película o serie
    }));
  };

  // Cache optimizado ya está manejado en lib/api.ts

  const fetchMovies = async (category: string, page: number) => {
    // Verificar si ya se está cargando esta categoría
    if (loadingRefs.current[category as keyof typeof loadingRefs.current]) {
      return;
    }

    // Marcar como cargando
    loadingRefs.current[category as keyof typeof loadingRefs.current] = true;
    
    let newMovies: Movie[] = [];

    try {
      if (category === 'popular') {
        const response = await getPopularMovies(page);
        newMovies = response.results;
      } else if (category === 'top_rated') {
        const response = await getTopRatedMovies(page);
        newMovies = response.results;
      } else if (category === 'now_playing') {
        const response = await getNowPlayingMovies(page);
        newMovies = response.results;
      } else if (category === 'upcoming') {
        const response = await getUpcomingMovies(page);
        newMovies = response.results;
      } else if (category === 'popularTV') {
        const response = await getPopularTVShows(page);
        newMovies = response.results;
      } else if (category === 'topRatedTV') {
        const response = await getTopRatedTVShows(page);
        newMovies = response.results;
      } else if (category === 'onAirTV') {
        const response = await getOnAirTVShows(page);
        newMovies = response.results;
      } else if (category === 'airingTodayTV') {
        const response = await getAiringTodayTVShows(page);
        newMovies = response.results;
      }

      if (category === 'popular') {
        setPopularMovies((prev) => removeDuplicates([...prev, ...newMovies], 'movie'));
      } else if (category === 'top_rated') {
        setTopRatedMovies((prev) => removeDuplicates([...prev, ...newMovies], 'movie'));
      } else if (category === 'now_playing') {
        setNowPlayingMovies((prev) => removeDuplicates([...prev, ...newMovies], 'movie'));
      } else if (category === 'upcoming') {
        setUpcomingMovies((prev) => removeDuplicates([...prev, ...newMovies], 'movie'));
      } else if (category === 'popularTV') {
        setPopularTVShows((prev) => removeDuplicates([...prev, ...newMovies], 'tv'));
      } else if (category === 'topRatedTV') {
        setTopRatedTVShows((prev) => removeDuplicates([...prev, ...newMovies], 'tv'));
      } else if (category === 'onAirTV') {
        setOnAirTVShows((prev) => removeDuplicates([...prev, ...newMovies], 'tv'));
      } else if (category === 'airingTodayTV') {
        setAiringTodayTVShows((prev) => removeDuplicates([...prev, ...newMovies], 'tv'));
      }
    } catch (error) {
      console.error(`Error fetching ${category} movies:`, error);
      showError('Error al cargar películas', 'No se pudieron cargar las películas. Inténtalo de nuevo.');
    } finally {
      // Marcar como no cargando
      loadingRefs.current[category as keyof typeof loadingRefs.current] = false;
    }
  };

  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      // Cargar datos principales en paralelo
      await Promise.all([
        fetchMovies('popular', 1),
        fetchMovies('top_rated', 1),
        fetchMovies('now_playing', 1),
        fetchMovies('upcoming', 1),
        fetchMovies('popularTV', 1),
        fetchMovies('topRatedTV', 1),
        fetchMovies('onAirTV', 1),
        fetchMovies('airingTodayTV', 1)
      ]);

    } catch (error) {
      console.error('Error loading initial data:', error);
      showError('Error al cargar datos iniciales', 'Algunas secciones no se pudieron cargar. Inténtalo de nuevo.');
    } finally {
      setInitialLoading(false);
      setIsInitialLoad(false);
    }
  }, [showError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );

  const renderMovieSection = (
    title: string,
    movies: Movie[],
    icon: React.ReactNode,
    sectionKey: 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'popularTV' | 'topRatedTV' | 'onAirTV' | 'airingTodayTV'
  ) => (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {icon}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{title}</h2>
        </div>
        
        <Link
          href={`/category/${sectionKey}`}
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

      {/* Scroll horizontal con flechas */}
      <HorizontalScroll>
        {movies.map((movie: Movie) => (
          <div key={`${sectionKey}-${movie.id}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
            <MovieCard movie={movie} />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );

  if (initialLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="h-16 bg-gray-700 rounded-lg animate-pulse mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
        </div>
        {renderSkeletons()}
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 pt-0 pb-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Section Divider */}
        <div className="my-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400 font-semibold">PELÍCULAS</span>
            </div>
          </div>
        </div>
        
        {/* Secciones de películas */}
        {renderMovieSection(
          'Películas Populares',
          popularMovies,
          <FiTrendingUp className="h-6 w-6 text-blue-400" />,
          'popular'
        )}

        {renderMovieSection(
          'Mejor Valoradas',
          topRatedMovies,
          <FiStar className="h-6 w-6 text-yellow-400" />,
          'top_rated'
        )}

        {renderMovieSection(
          'Actualmente en Cines',
          nowPlayingMovies,
          <FiPlay className="h-6 w-6 text-green-400" />,
          'now_playing'
        )}

        {renderMovieSection(
          'Próximas Películas',
          upcomingMovies,
          <FiCalendar className="h-6 w-6 text-red-400" />,
          'upcoming'
        )}

        {/* Section Divider */}
        <div className="my-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400 font-semibold">SERIES DE TELEVISIÓN</span>
            </div>
          </div>
        </div>

        {/* TV Series Sections */}
        {renderMovieSection(
          'Series de TV Populares',
          popularTVShows,
          <FiTv className="h-6 w-6 text-purple-400" />,
          'popularTV'
        )}

        {renderMovieSection(
          'Series de TV Mejor Valoradas',
          topRatedTVShows,
          <FiStar className="h-6 w-6 text-purple-400" />,
          'topRatedTV'
        )}

        {renderMovieSection(
          'Series Actualmente en Emisión',
          onAirTVShows,
          <FiPlay className="h-6 w-6 text-purple-400" />,
          'onAirTV'
        )}

        {renderMovieSection(
          'Series que se Emiten Hoy',
          airingTodayTVShows,
          <FiCalendar className="h-6 w-6 text-purple-400" />,
          'airingTodayTV'
        )}

        {/* API Test Component - Temporal para debugging */}
        <div className="mt-16">
          <APITest />
        </div>
      </main>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />

      {/* Footer */}
      <Footer />
    </>
  );
}
