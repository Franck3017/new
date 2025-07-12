import { useState, useCallback, useMemo } from 'react';
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
import VideoPlayer from "@/components/VideoPlayer";
import MovieCard from "@/components/MovieCard";
import { NotificationContainer } from "@/components/Notification";
import Link from "next/link";
import { 
  generatePersonUrl, 
  generateTVUrl, 
  generateGenreUrl,
  ROUTES 
} from "@/utils/urlHelpers";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TVShowPageProps {
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

export type TabType = 'overview' | 'cast' | 'videos' | 'similar';

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

// Removed getPersonUrl - now using generatePersonUrl from urlHelpers

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingState = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">Cargando serie...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
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
);

const HeroSection = ({ 
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
  const backgroundImageUrl = `https://image.tmdb.org/t/p/original${tvShow.backdrop_path || tvShow.poster_path}`;

  return (
    <div
      className="relative h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* Overlay gradiente */}
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
        <button
          onClick={onFavoriteClick}
          className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer ${
            isFavorite
              ? 'bg-red-500/80 text-white'
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={onShare}
          className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
          aria-label="Compartir"
        >
          <FiShare2 className="h-5 w-5" />
        </button>
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
                {tvShow.episode_run_time && tvShow.episode_run_time[0] && (
                  <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <FiClock className="text-gray-400 h-5 w-5" />
                    <span className="text-white text-sm sm:text-base">
                      {formatRuntime(tvShow.episode_run_time[0])}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <FiTv className="text-gray-400 h-5 w-5" />
                  <span className="text-white text-sm sm:text-base">
                    {tvShow.number_of_seasons} temporada{tvShow.number_of_seasons !== 1 ? 's' : ''}
                  </span>
                </div>
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
              {tvShow.genres && tvShow.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={generateGenreUrl(genre.id, genre.name, 'tv')}
                      className="bg-white/10 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Tagline */}
              {tvShow.tagline && (
                <div className="max-w-2xl sm:max-w-3xl">
                  <div className="relative">
                    <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed italic font-light">
                      &ldquo;{tvShow.tagline}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Poster */}
          <div className="w-3/5 mx-auto max-w-[220px] sm:max-w-[260px] md:w-2/5 md:max-w-xs lg:w-1/4 flex-shrink-0 mb-6 md:mb-0">
            <div className="relative group">
              <Image
                src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
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
};

const TabNavigation = ({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Resumen', icon: FiPlay },
    { id: 'cast' as TabType, label: 'Reparto', icon: FiUsers },
    { id: 'videos' as TabType, label: 'Videos', icon: FiDownload },
    { id: 'similar' as TabType, label: 'Similares', icon: FiBookmark }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 flex">
        {tabs.map((tab) => {
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
  );
};

const OverviewTab = ({ tvShow, credits, recommendedShows }: { tvShow: TVShow; credits: any; recommendedShows: any }) => {
  const [showFullOverview, setShowFullOverview] = useState(false);
  const creator = credits?.crew?.find((member: CrewMember) => member.job === "Creator");
  const mainCast = credits?.cast?.slice(0, 10) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        {/* Sinopsis detallada */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiPlay className="h-6 w-6 text-blue-400" />
            Sinopsis
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {showFullOverview
              ? tvShow.overview
              : tvShow.overview.length > 200
                ? `${tvShow.overview.substring(0, 200)}...`
                : tvShow.overview
            }
          </p>
          {tvShow.overview.length > 200 && (
            <button
              onClick={() => setShowFullOverview(!showFullOverview)}
              className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-medium"
            >
              {showFullOverview ? 'Mostrar menos' : 'Leer más'}
            </button>
          )}
        </div>

        {/* Información técnica */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiAward className="h-6 w-6 text-blue-400" />
            Información Técnica
          </h2>
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div>
              <span className="font-semibold">Temporadas:</span> {tvShow.number_of_seasons}
            </div>
            <div>
              <span className="font-semibold">Episodios:</span> {tvShow.number_of_episodes}
            </div>
            <div>
              <span className="font-semibold">Rating:</span> {tvShow.vote_average?.toFixed(1)}/10
            </div>
            <div>
              <span className="font-semibold">Estado:</span> {tvShow.status}
            </div>
            <div>
              <span className="font-semibold">Tipo:</span> {tvShow.type}
            </div>
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
        </div>

        {/* Series Recomendadas */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiBookmark className="h-6 w-6 text-blue-400" />
            Series Recomendadas
          </h2>
          {recommendedShows?.results && recommendedShows.results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recommendedShows.results.slice(0, 8).map((similarShow: any) => (
                <Link
                  key={similarShow.id}
                  href={generateTVUrl(similarShow.id, similarShow.title || similarShow.name)}
                  className="group bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-600/50 transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] bg-gray-600">
                    {similarShow.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${similarShow.poster_path}`}
                        alt={`Poster de ${similarShow.title || similarShow.name}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiTv className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    {/* Overlay de hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <FiPlay className="h-6 w-6 text-white mx-auto mb-1" />
                        <p className="text-white text-xs font-medium">Ver detalles</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors duration-200">
                      {similarShow.title || similarShow.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {similarShow.release_date?.substring(0, 4) || similarShow.first_air_date?.substring(0, 4) || 'N/A'}
                      </span>
                      <div className="flex items-center gap-1">
                        <FiStar className="h-3 w-3 text-yellow-400" />
                        <span>{similarShow.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBookmark className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No hay series recomendadas disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Reparto principal */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiUsers className="h-5 w-5 text-blue-400" />
            Reparto Principal
          </h2>
          <div className="space-y-3">
            {mainCast.slice(0, 5).map((member: CastMember) => (
              <Link
                key={member.id}
                href={generatePersonUrl(member.id, member.name)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                  {member.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w92${member.profile_path}`}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CastTab = ({ credits }: { credits: any }) => {
  const mainCast = credits?.cast?.slice(0, 10) || [];

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
};

const VideosTab = ({ videos }: { videos: any }) => (
  <div className="space-y-8">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <FiDownload className="h-8 w-8 text-blue-400" />
      Videos y Tráilers
    </h2>
    <VideoPlayer videos={videos?.results || []} />
  </div>
);

const SimilarTab = ({ similarShows }: { similarShows: any }) => (
  <div className="space-y-8">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <FiBookmark className="h-8 w-8 text-blue-400" />
      Series Similares
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {similarShows?.results?.map((similarShow: any) => (
        <MovieCard key={similarShow.id} movie={similarShow} mediaType="tv" />
      ))}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TVShowPageComponent({
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
}: TVShowPageProps) {
  const creator = useMemo(() => 
    credits?.crew?.find((member: CrewMember) => member.job === "Creator"),
    [credits]
  );

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
        <div className="container mx-auto px-4 py-12">
          <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

          {/* Contenido de tabs */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <OverviewTab 
                tvShow={tvShow} 
                credits={credits} 
                recommendedShows={recommendedShows} 
              />
            )}

            {activeTab === 'cast' && (
              <CastTab credits={credits} />
            )}

            {activeTab === 'videos' && (
              <VideosTab videos={videos} />
            )}

            {activeTab === 'similar' && (
              <SimilarTab similarShows={similarShows} />
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />
    </>
  );
} 