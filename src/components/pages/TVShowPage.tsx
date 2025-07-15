import { useState, useCallback, useMemo, memo } from 'react';
import { Movie, CastMember, CrewMember } from "@/types";
import { TVShow } from "@/hooks/useTVShow";
import Image from "next/image";
import {
  FiClock,
  FiStar,
  FiPlay,
  FiHeart,
  FiShare2,
  FiCalendar,
  FiUsers,
  FiAward,
  FiArrowLeft,
  FiExternalLink,
  FiDownload,
  FiBookmark,
  FiTv,
  FiRefreshCw
} from "react-icons/fi";
import CastMemberCard from "@/components/CastMemberCard";
import { VideoPlayer } from "@/components/ui";
import MovieCard from "@/components/features/movies/MovieCard";
import { NotificationContainer } from "@/components/common/Notification";
import Link from "next/link";
import { 
  generatePersonUrl, 
  generateTVUrl,
  generateGenreUrl,
  ROUTES 
} from "@/utils/urlHelpers";

// ============================================================================
// CONSTANTS
// ============================================================================

const TAB_CONFIG = [
  { id: 'overview' as const, label: 'Resumen', icon: FiPlay },
  { id: 'cast' as const, label: 'Reparto', icon: FiUsers },
  { id: 'videos' as const, label: 'Videos', icon: FiDownload },
  { id: 'similar' as const, label: 'Similares', icon: FiBookmark }
] as const;

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';
const OVERVIEW_MAX_LENGTH = 200;
const CAST_DISPLAY_LIMIT = 10;
const RECOMMENDED_SHOWS_LIMIT = 8;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TVShowPageProps {
  tvShow: TVShow | null;
  credits: any;
  videos: any;
  similarShows: any;
  recommendedShows: any;
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
  activeTab: TabType;
  onFavoriteClick: () => void;
  onShare: () => void;
  onPlayClick: () => void;
  onRetry: () => void;
  onTabChange: (tab: TabType) => void;
  isFavorite: boolean;
  notifications: any[];
}

export type TabType = typeof TAB_CONFIG[number]['id'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getImageUrl = (path: string, size: string = 'w500'): string => 
  `${TMDB_IMAGE_BASE}${size}${path}`;

const getBackgroundImageUrl = (backdropPath: string, posterPath: string): string => 
  getImageUrl(backdropPath || posterPath, 'original');

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useOverviewText = (overview: string) => {
  const [showFullOverview, setShowFullOverview] = useState(false);
  
  const displayText = useMemo(() => {
    if (showFullOverview || overview.length <= OVERVIEW_MAX_LENGTH) {
      return overview;
    }
    return `${overview.substring(0, OVERVIEW_MAX_LENGTH)}...`;
  }, [overview, showFullOverview]);

  const toggleOverview = useCallback(() => {
    setShowFullOverview(prev => !prev);
  }, []);

  return {
    displayText,
    showFullOverview,
    toggleOverview,
    shouldShowToggle: overview.length > OVERVIEW_MAX_LENGTH
  };
};

const useCastData = (credits: any) => {
  return useMemo(() => ({
    mainCast: credits?.cast?.slice(0, CAST_DISPLAY_LIMIT) || [],
    creator: credits?.crew?.find((member: CrewMember) => member.job === "Creator")
  }), [credits]);
};

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

const LoadingState = memo(() => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">Cargando serie...</p>
    </div>
  </div>
));

const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
      <p className="text-gray-400 mb-6">{error}</p>
      <div className="flex gap-4 justify-center">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <FiArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <FiRefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  </div>
));

const SectionCard = memo(({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <Icon className="h-6 w-6 text-blue-400" />
      {title}
    </h2>
    {children}
  </div>
));

const InfoBadge = memo(({ 
  icon: Icon, 
  children, 
  bgColor = "bg-gray-800/50" 
}: { 
  icon: any; 
  children: React.ReactNode; 
  bgColor?: string;
}) => (
  <div className={`flex items-center gap-2 ${bgColor} backdrop-blur-sm px-3 py-2 rounded-lg`}>
    <Icon className="text-gray-400 h-5 w-5" />
    <span className="text-white text-sm sm:text-base">{children}</span>
  </div>
));

const CastMemberLink = memo(({ member }: { member: CastMember }) => (
  <Link
    href={generatePersonUrl(member.id, member.name)}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
  >
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
      {member.profile_path ? (
        <Image
          src={getImageUrl(member.profile_path, 'w92')}
          alt={member.name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <FiUsers className="h-5 w-5" />
        </div>
      )}
    </div>
    <div className="flex-1">
      <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors duration-200">
        {member.name}
      </p>
      <p className="text-gray-400 text-xs">{member.character}</p>
    </div>
    <FiExternalLink className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors duration-200" />
  </Link>
));

const ContentGrid = memo(({ 
  items, 
  renderItem, 
  emptyMessage, 
  emptyIcon: EmptyIcon,
  gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" 
}: { 
  items: any[]; 
  renderItem: (item: any) => React.ReactNode; 
  emptyMessage: string;
  emptyIcon: any;
  gridCols?: string;
}) => (
  <>
    {items && items.length > 0 ? (
      <div className={`grid ${gridCols} gap-4`}>
        {items.map(renderItem)}
      </div>
    ) : (
      <div className="text-center py-8">
        <EmptyIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    )}
  </>
));

const GenreLink = memo(({ genre }: { genre: { id: number; name: string } }) => (
  <Link
    href={generateGenreUrl(genre.id, genre.name, 'tv')}
    className="bg-white/10 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer"
  >
    {genre.name}
  </Link>
));

const ActionButton = memo(({ 
  onClick, 
  icon: Icon, 
  label, 
  className = "",
  ...props 
}: { 
  onClick: () => void; 
  icon: any; 
  label: string; 
  className?: string;
  [key: string]: any;
}) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer ${className}`}
    {...props}
  >
    <Icon className="h-5 w-5" />
  </button>
));

// ============================================================================
// MAIN SECTIONS
// ============================================================================

const HeroSection = memo(({ 
  tvShow, 
  creator, 
  isFavorite, 
  onFavoriteClick, 
  onShare, 
  onPlayClick 
}: {
  tvShow: TVShow;
  creator: CrewMember | undefined;
  isFavorite: boolean;
  onFavoriteClick: () => void;
  onShare: () => void;
  onPlayClick: () => void;
}) => {
  const backgroundImageUrl = getBackgroundImageUrl(tvShow.backdrop_path, tvShow.poster_path);

  return (
    <div
      className="relative h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

      {/* Botón de regreso */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all duration-200"
        >
          <FiArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      {/* Botones de acción */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        <ActionButton
          onClick={onFavoriteClick}
          icon={FiHeart}
          label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={isFavorite ? 'bg-red-500/80 text-white' : 'bg-black/50 text-white hover:bg-black/70'}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        />
        <ActionButton
          onClick={onShare}
          icon={FiShare2}
          label="Compartir"
          className="bg-black/50 text-white hover:bg-black/70"
          aria-label="Compartir"
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-0 container mx-auto flex items-center h-full">
        <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-10 items-center md:items-end w-full">
          {/* Información */}
          <div className="w-full md:w-3/5 lg:w-3/4 flex-1">
            <div className="space-y-3 sm:space-y-4">
              {/* Título y año */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-2">
                  {tvShow.name}
                </h1>
                {tvShow.first_air_date && (
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 flex items-center gap-2">
                    <FiCalendar className="h-5 w-5" />
                    {formatDate(tvShow.first_air_date)}
                  </p>
                )}
              </div>

              {/* Rating y duración */}
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 items-center">
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <FiStar className="text-yellow-400 h-5 w-5" />
                  <span className="font-bold text-base sm:text-lg md:text-xl text-white">
                    {tvShow.vote_average?.toFixed(1)}
                  </span>
                </div>
                {tvShow.episode_run_time?.[0] && (
                  <InfoBadge icon={FiClock}>
                    {formatRuntime(tvShow.episode_run_time[0])}
                  </InfoBadge>
                )}
                <InfoBadge icon={FiTv}>
                  {tvShow.number_of_seasons} temporada{tvShow.number_of_seasons !== 1 ? 's' : ''}
                </InfoBadge>
                {creator && (
                  <Link
                    href={generatePersonUrl(creator.id, creator.name)}
                    className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                  >
                    <FiAward className="text-gray-400 h-5 w-5 group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="text-white group-hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base">
                      Creador: {creator.name}
                    </span>
                  </Link>
                )}
              </div>

              {/* Géneros */}
              {tvShow.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map((genre) => (
                    <GenreLink key={genre.id} genre={genre} />
                  ))}
                </div>
              )}

              {/* Tagline */}
              {tvShow.tagline && (
                <div className="max-w-2xl sm:max-w-3xl">
                  <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed italic font-light">
                    &ldquo;{tvShow.tagline}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Poster */}
          <div className="w-3/5 mx-auto max-w-[220px] sm:max-w-[260px] md:w-2/5 md:max-w-xs lg:w-1/4 flex-shrink-0 mb-6 md:mb-0">
            <div className="relative group">
              <Image
                src={getImageUrl(tvShow.poster_path)}
                alt={`Póster de ${tvShow.name}`}
                width={500}
                height={750}
                className="w-full rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                priority
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                <button
                  onClick={onPlayClick}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 cursor-pointer"
                  title="Ver trailers y videos"
                >
                  <FiPlay className="h-8 w-8 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const TabNavigation = memo(({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) => (
  <div className="flex items-center justify-center mb-8">
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 flex">
      {TAB_CONFIG.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center text-xs md:text-base gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  </div>
));

const OverviewTab = memo(({ tvShow, credits, recommendedShows }: { tvShow: TVShow; credits: any; recommendedShows: any }) => {
  const { displayText, showFullOverview, toggleOverview, shouldShowToggle } = useOverviewText(tvShow.overview);
  const { mainCast, creator } = useCastData(credits);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        {/* Sinopsis detallada */}
        <SectionCard title="Sinopsis" icon={FiPlay}>
          <p className="text-gray-300 leading-relaxed">{displayText}</p>
          {shouldShowToggle && (
            <button
              onClick={toggleOverview}
              className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-medium"
            >
              {showFullOverview ? 'Mostrar menos' : 'Leer más'}
            </button>
          )}
        </SectionCard>

        {/* Información técnica */}
        <SectionCard title="Información Técnica" icon={FiAward}>
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div><span className="font-semibold">Temporadas:</span> {tvShow.number_of_seasons}</div>
            <div><span className="font-semibold">Episodios:</span> {tvShow.number_of_episodes}</div>
            <div><span className="font-semibold">Rating:</span> {tvShow.vote_average?.toFixed(1)}/10</div>
            <div><span className="font-semibold">Estado:</span> {tvShow.status}</div>
            <div><span className="font-semibold">Tipo:</span> {tvShow.type}</div>
            <div>
              <span className="font-semibold">Creador:</span>
              {creator && (
                <Link
                  href={generatePersonUrl(creator.id, creator.name)}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 ml-1"
                >
                  {creator.name}
                </Link>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Series Recomendadas */}
        <SectionCard title="Series Recomendadas" icon={FiBookmark}>
          <ContentGrid
            items={recommendedShows?.results?.slice(0, RECOMMENDED_SHOWS_LIMIT) || []}
            renderItem={(similarShow: any) => (
              <MovieCard key={similarShow.id} movie={similarShow} mediaType="tv" />
            )}
            emptyMessage="No hay series recomendadas disponibles"
            emptyIcon={FiBookmark}
          />
        </SectionCard>
      </div>

      <div className="space-y-6">
        {/* Reparto principal */}
        <SectionCard title="Reparto Principal" icon={FiUsers}>
          <div className="space-y-3">
            {mainCast.slice(0, 5).map((member: CastMember) => (
              <CastMemberLink key={member.id} member={member} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
});

const CastTab = memo(({ credits }: { credits: any }) => {
  const { mainCast } = useCastData(credits);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <FiUsers className="h-8 w-8 text-blue-400" />
        Reparto Completo
      </h2>
      <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {mainCast.map((member: CastMember) => (
          <CastMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
});

const VideosTab = memo(({ videos }: { videos: any }) => (
  <div className="space-y-8">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <FiDownload className="h-8 w-8 text-blue-400" />
      Videos y Tráilers
    </h2>
    <VideoPlayer videos={videos?.results || []} />
  </div>
));

const SimilarTab = memo(({ similarShows }: { similarShows: any }) => (
  <div className="space-y-8">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <FiBookmark className="h-8 w-8 text-blue-400" />
      Series Similares
    </h2>
    <ContentGrid
      items={similarShows?.results || []}
      renderItem={(similarShow: any) => (
        <MovieCard key={similarShow.id} movie={similarShow} mediaType="tv" />
      )}
      emptyMessage="No hay series similares disponibles"
      emptyIcon={FiBookmark}
      gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    />
  </div>
));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TVShowPageComponent = memo(({
  tvShow,
  credits,
  videos,
  similarShows,
  recommendedShows,
  loading,
  error,
  isInitialLoad,
  activeTab,
  onFavoriteClick,
  onShare,
  onPlayClick,
  onRetry,
  onTabChange,
  isFavorite,
  notifications
}: TVShowPageProps) => {
  // All hooks must be called at the top level, before any conditional returns
  const creator = useMemo(() => 
    credits?.crew?.find((member: CrewMember) => member.job === "Creator"),
    [credits]
  );

  const renderTabContent = useCallback(() => {
    // Early return if tvShow is null (will be handled by error state)
    if (!tvShow) return null;
    
    switch (activeTab) {
      case 'overview':
        return <OverviewTab tvShow={tvShow} credits={credits} recommendedShows={recommendedShows} />;
      case 'cast':
        return <CastTab credits={credits} />;
      case 'videos':
        return <VideosTab videos={videos} />;
      case 'similar':
        return <SimilarTab similarShows={similarShows} />;
      default:
        return null;
    }
  }, [activeTab, tvShow, credits, recommendedShows, videos, similarShows]);

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error || !tvShow) {
    return <ErrorState error={error || 'No se pudo cargar la serie'} onRetry={onRetry} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <HeroSection
          tvShow={tvShow}
          creator={creator}
          isFavorite={isFavorite}
          onFavoriteClick={onFavoriteClick}
          onShare={onShare}
          onPlayClick={onPlayClick}
        />

        {/* Contenido principal */}
        <div className="container mx-auto px-4 md:px-0 py-12">
          <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

          {/* Contenido de tabs */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />
    </>
  );
});

TVShowPageComponent.displayName = 'TVShowPageComponent';

export default TVShowPageComponent; 