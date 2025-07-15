import { useState, useCallback, useMemo } from 'react';
import { use } from 'react';
import { useTVShow, TVShow } from "@/hooks/useTVShow";
import { useNotifications } from "@/components/common/Notification";
import { useFavorites } from "@/context/FavoritesContext";
import { Movie } from "@/types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TVShowPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export type TabType = 'overview' | 'cast' | 'videos' | 'similar';

export interface UseTVShowPageReturn {
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
  activeTab: TabType;
  
  // Actions
  onFavoriteClick: () => void;
  onShare: () => void;
  onPlayClick: () => void;
  onRetry: () => void;
  onTabChange: (tab: TabType) => void;
  
  // Computed
  isFavorite: boolean;
  notifications: any[];
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useTVShowPage = (params: Promise<{ id: string }>): UseTVShowPageReturn => {
  // ============================================================================
  // PARAMS RESOLUTION
  // ============================================================================
  
  const resolvedParams = use(params) as { id: string };
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const {
    tvShow,
    credits,
    videos,
    similarShows,
    recommendedShows,
    loading,
    error,
    isInitialLoad,
    refetch
  } = useTVShow(resolvedParams.id);

  const { notifications, showSuccess, showError } = useNotifications();
  const { isTVFavorite, addTVToFavorites, removeTVFromFavorites } = useFavorites();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const isFavorite = useMemo(() => 
    tvShow ? isTVFavorite(tvShow.id) : false,
    [tvShow, isTVFavorite]
  );

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================
  
  const onFavoriteClick = useCallback(() => {
    if (!tvShow) return;

    const currentFavoriteState = isTVFavorite(tvShow.id);

    if (currentFavoriteState) {
      removeTVFromFavorites(tvShow.id);
      showSuccess('Removido de favoritos', `${tvShow.name} se eliminó de tus favoritos de TV`);
    } else {
      // Convertir TVShow a Movie para el contexto de favoritos
      const tvForFavorites: Movie = {
        id: tvShow.id,
        name: tvShow.name, // Usar 'name' para series de TV
        title: undefined, // No usar 'title' para series
        overview: tvShow.overview,
        poster_path: tvShow.poster_path,
        backdrop_path: tvShow.backdrop_path,
        first_air_date: tvShow.first_air_date,
        release_date: undefined, // No usar 'release_date' para series
        tagline: tvShow.tagline,
        vote_average: tvShow.vote_average,
        popularity: tvShow.popularity,
        genres: tvShow.genres,
        runtime: tvShow.episode_run_time?.[0] || 0,
        media_type: 'tv',
        homepage: '', // Campo requerido por Movie
        production_companies: [], // Campo requerido por Movie
        production_countries: [], // Campo requerido por Movie
        spoken_languages: [], // Campo requerido por Movie
        status: tvShow.status // Campo requerido por Movie
      };
      addTVToFavorites(tvForFavorites);
      showSuccess('Agregado a favoritos', `${tvShow.name} se agregó a tus favoritos de TV`);
    }
  }, [tvShow, isTVFavorite, addTVToFavorites, removeTVFromFavorites, showSuccess]);

  const onShare = useCallback(async () => {
    if (!tvShow) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: tvShow.name,
          text: `Mira ${tvShow.name} en CineGemini`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Enlace copiado', 'El enlace se copió al portapapeles');
      } catch (err) {
        showError('Error al copiar', 'No se pudo copiar el enlace');
      }
    }
  }, [tvShow, showSuccess, showError]);

  const onPlayClick = useCallback(() => {
    const availableVideos = videos?.results || [];
    const trailerVideos = availableVideos.filter((video: any) =>
      video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailerVideos.length > 0) {
      setActiveTab('videos');
      showSuccess('Videos disponibles', `Se encontraron ${trailerVideos.length} trailers para ${tvShow?.name}`);
      setTimeout(() => {
        const contentSection = document.querySelector('.container.mx-auto.px-4.py-12');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (availableVideos.length > 0) {
      setActiveTab('videos');
      showSuccess('Videos disponibles', `Se encontraron ${availableVideos.length} videos para ${tvShow?.name}`);
      setTimeout(() => {
        const contentSection = document.querySelector('.container.mx-auto.px-4.py-12');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      showError('No hay videos', 'No hay trailers o videos disponibles para esta serie');
    }
  }, [videos, tvShow, showSuccess, showError]);

  const onRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const onTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Data
    tvShow,
    credits,
    videos,
    similarShows,
    recommendedShows,
    
    // State
    loading,
    error,
    isInitialLoad,
    activeTab,
    
    // Actions
    onFavoriteClick,
    onShare,
    onPlayClick,
    onRetry,
    onTabChange,
    
    // Computed
    isFavorite,
    notifications
  };
}; 