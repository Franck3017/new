import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTVShowDetails,
  getTVShowCredits,
  getTVShowVideos,
  getSimilarTVShows,
  getRecommendedTVShows,
} from "@/lib/api";
import { useNotifications } from "@/components/common/Notification";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  tagline?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: Array<{ id: number; name: string }>;
  number_of_seasons: number;
  number_of_episodes: number;
  first_air_date: string;
  last_air_date: string;
  status: string;
  type: string;
  in_production: boolean;
  episode_run_time: number[];
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    air_date: string;
    episode_count: number;
  }>;
}

export interface TVShowData {
  tvShow: TVShow | null;
  credits: any;
  videos: any;
  similarShows: any;
  recommendedShows: any;
}

export interface UseTVShowOptions {
  enabled?: boolean;
  onSuccess?: (data: TVShowData) => void;
  onError?: (error: string) => void;
  showNotifications?: boolean;
}

export interface UseTVShowReturn {
  // Data
  tvShow: TVShow | null;
  credits: any;
  videos: any;
  similarShows: any;
  recommendedShows: any;
  
  // State
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useTVShow = (
  tvId: string,
  options: UseTVShowOptions = {}
): UseTVShowReturn => {
  const {
    enabled = true,
    onSuccess,
    onError,
    showNotifications = true
  } = options;

  const [data, setData] = useState<TVShowData>({
    tvShow: null,
    credits: null,
    videos: null,
    similarShows: null,
    recommendedShows: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isLoadingRef = useRef(false);

  const { showSuccess, showError } = useNotifications();

  // ============================================================================
  // API OPERATIONS
  // ============================================================================

  const fetchTVShowData = useCallback(async (forceRefresh = false) => {
    if (!tvId || !enabled) return;
    
    // Prevent duplicate requests
    if (isLoadingRef.current && !forceRefresh) return;
    
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);

      const [tvShowData, creditsData, videosData, similarData, recommendedData] = await Promise.all([
        getTVShowDetails(tvId),
        getTVShowCredits(tvId),
        getTVShowVideos(tvId),
        getSimilarTVShows(tvId),
        getRecommendedTVShows(tvId)
      ]);

      const newData = {
        tvShow: tvShowData,
        credits: creditsData,
        videos: videosData,
        similarShows: similarData,
        recommendedShows: recommendedData
      };

      setData(newData);

      // Call success callback
      onSuccess?.(newData);

      // Show success notification if enabled and not initial load
      if (showNotifications && !isInitialLoad && tvShowData) {
        showSuccess('Serie cargada', `${tvShowData.name} se cargó correctamente`);
      }

    } catch (err: any) {
      console.error('Error fetching TV show data:', err);
      
      const errorMessage = err.message || 'No se pudo cargar la información de la serie';
      setError(errorMessage);

      // Call error callback
      onError?.(errorMessage);

      // Show error notification if enabled
      if (showNotifications) {
        showError('Error al cargar la serie', 'Inténtalo de nuevo más tarde');
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      isLoadingRef.current = false;
    }
  }, [tvId, enabled, isInitialLoad, showNotifications, onSuccess, onError, showSuccess, showError]);

  const refetch = useCallback(async () => {
    await fetchTVShowData(true);
  }, [fetchTVShowData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (enabled && tvId) {
      fetchTVShowData();
    }
  }, [fetchTVShowData, enabled, tvId]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    tvShow: data.tvShow,
    credits: data.credits,
    videos: data.videos,
    similarShows: data.similarShows,
    recommendedShows: data.recommendedShows,
    
    // State
    loading,
    error,
    isInitialLoad,
    
    // Actions
    refetch,
    clearError
  };
};

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for TV show details only (without related data)
 */
export const useTVShowDetails = (tvId: string, options: UseTVShowOptions = {}) => {
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showError } = useNotifications();

  const fetchDetails = useCallback(async () => {
    if (!tvId) return;

    try {
      setLoading(true);
      setError(null);

      const tvShowData = await getTVShowDetails(tvId);
      setTVShow(tvShowData);

      options.onSuccess?.({ tvShow: tvShowData, credits: null, videos: null, similarShows: null, recommendedShows: null });
    } catch (err: any) {
      console.error('Error fetching TV show details:', err);
      const errorMessage = err.message || 'No se pudo cargar la información de la serie';
      setError(errorMessage);
      options.onError?.(errorMessage);
      showError('Error al cargar la serie', 'Inténtalo de nuevo más tarde');
    } finally {
      setLoading(false);
    }
  }, [tvId, options, showError]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    tvShow,
    loading,
    error,
    refetch: fetchDetails
  };
};

/**
 * Hook for TV show credits only
 */
export const useTVShowCredits = (tvId: string) => {
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!tvId) return;

    try {
      setLoading(true);
      setError(null);

      const creditsData = await getTVShowCredits(tvId);
      setCredits(creditsData);
    } catch (err: any) {
      console.error('Error fetching TV show credits:', err);
      setError(err.message || 'No se pudo cargar el reparto');
    } finally {
      setLoading(false);
    }
  }, [tvId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits
  };
};

/**
 * Hook for TV show videos only
 */
export const useTVShowVideos = (tvId: string) => {
  const [videos, setVideos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!tvId) return;

    try {
      setLoading(true);
      setError(null);

      const videosData = await getTVShowVideos(tvId);
      setVideos(videosData);
    } catch (err: any) {
      console.error('Error fetching TV show videos:', err);
      setError(err.message || 'No se pudo cargar los videos');
    } finally {
      setLoading(false);
    }
  }, [tvId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos
  };
};

/**
 * Hook for similar TV shows
 */
export const useSimilarTVShows = (tvId: string, page: number = 1) => {
  const [similarShows, setSimilarShows] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarShows = useCallback(async () => {
    if (!tvId) return;

    try {
      setLoading(true);
      setError(null);

      const similarData = await getSimilarTVShows(tvId, page);
      setSimilarShows(similarData);
    } catch (err: any) {
      console.error('Error fetching similar TV shows:', err);
      setError(err.message || 'No se pudo cargar las series similares');
    } finally {
      setLoading(false);
    }
  }, [tvId, page]);

  useEffect(() => {
    fetchSimilarShows();
  }, [fetchSimilarShows]);

  return {
    similarShows,
    loading,
    error,
    refetch: fetchSimilarShows
  };
};

/**
 * Hook for recommended TV shows
 */
export const useRecommendedTVShows = (tvId: string, page: number = 1) => {
  const [recommendedShows, setRecommendedShows] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendedShows = useCallback(async () => {
    if (!tvId) return;

    try {
      setLoading(true);
      setError(null);

      const recommendedData = await getRecommendedTVShows(tvId, page);
      setRecommendedShows(recommendedData);
    } catch (err: any) {
      console.error('Error fetching recommended TV shows:', err);
      setError(err.message || 'No se pudo cargar las series recomendadas');
    } finally {
      setLoading(false);
    }
  }, [tvId, page]);

  useEffect(() => {
    fetchRecommendedShows();
  }, [fetchRecommendedShows]);

  return {
    recommendedShows,
    loading,
    error,
    refetch: fetchRecommendedShows
  };
}; 