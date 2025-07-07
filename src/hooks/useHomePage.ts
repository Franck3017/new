import { useState, useEffect, useRef, useCallback } from 'react';
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies } from "@/lib/api";
import { Movie } from "@/types";
import { useNotifications } from "@/components/Notification";

export interface HomePageState {
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  nowPlayingMovies: Movie[];
  upcomingMovies: Movie[];
  initialLoading: boolean;
  activeSection: 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
  isInitialLoad: boolean;
}

export interface HomePageActions {
  setActiveSection: (section: 'popular' | 'top_rated' | 'now_playing' | 'upcoming') => void;
  loadMoreMovies: (category: string, page: number) => Promise<void>;
}

export const useHomePage = (): [HomePageState, HomePageActions] => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'popular' | 'top_rated' | 'now_playing' | 'upcoming'>('popular');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { showError } = useNotifications();

  // Refs para controlar si ya se está cargando
  const loadingRefs = useRef({
    popular: false,
    topRated: false,
    nowPlaying: false,
    upcoming: false
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
    }).map(movie => ({
      ...movie,
      media_type: 'movie'
    }));
  };

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
      }

      if (category === 'popular') {
        setPopularMovies((prev) => removeDuplicates([...prev, ...newMovies]));
      } else if (category === 'top_rated') {
        setTopRatedMovies((prev) => removeDuplicates([...prev, ...newMovies]));
      } else if (category === 'now_playing') {
        setNowPlayingMovies((prev) => removeDuplicates([...prev, ...newMovies]));
      } else if (category === 'upcoming') {
        setUpcomingMovies((prev) => removeDuplicates([...prev, ...newMovies]));
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
        fetchMovies('upcoming', 1)
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError('Error al cargar datos iniciales', 'Algunas secciones no se pudieron cargar. Inténtalo de nuevo.');
    } finally {
      setInitialLoading(false);
      setIsInitialLoad(false);
    }
  }, [showError]);

  const loadMoreMovies = useCallback(async (category: string, page: number) => {
    await fetchMovies(category, page);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const state: HomePageState = {
    popularMovies,
    topRatedMovies,
    nowPlayingMovies,
    upcomingMovies,
    initialLoading,
    activeSection,
    isInitialLoad
  };

  const actions: HomePageActions = {
    setActiveSection,
    loadMoreMovies
  };

  return [state, actions];
}; 