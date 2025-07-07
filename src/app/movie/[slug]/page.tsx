'use client';

import { useState, useEffect } from 'react';
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getRecommendedMovies,
} from "@/lib/api";
import { Movie, CastMember, CrewMember } from "@/types";
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
  FiBookmark
} from "react-icons/fi";
import CastMemberCard from "@/components/CastMemberCard";
import VideoPlayer from "@/components/VideoPlayer";
import MovieCard from "@/components/MovieCard";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";

interface MoviePageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function MoviePage({ params }: MoviePageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<any>(null);
  const [videos, setVideos] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el resumen
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'videos' | 'similar'>('overview');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estado para las notificaciones
  const { notifications, showSuccess, showError } = useNotifications();

  // Estado para los favoritos
  const { isMovieFavorite, addMovieToFavorites, removeMovieFromFavorites } = useFavorites();

  // Extraer el ID de la película del slug
  const slugParts = params.slug.split('-');
  const movieId = slugParts[0];

  // Validar que el ID sea un número válido
  const isValidId = !isNaN(Number(movieId)) && Number(movieId) > 0;

  // Si es solo un ID (sin título), redirigir a la URL con título
  const shouldRedirect = isValidId && slugParts.length === 1;

  // Variables derivadas
  const backgroundImageUrl = movie?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : '/api/placeholder/1920/1080';

  const director = credits?.crew?.find((member: CrewMember) => 
    member.job === 'Director'
  );

  const mainCast = credits?.cast?.slice(0, 10) || [];

  const getPersonUrl = (person: { id: number; name: string }) => {
    const nameSlug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/person/${person.id}-${encodeURIComponent(nameSlug)}`;
  };

  useEffect(() => {
    const redirectToMovieWithTitle = async () => {
      try {
        const movie: Movie = await getMovieDetails(movieId);
        const titleSlug = movie.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
        const newUrl = `/movie/${movie.id}-${encodeURIComponent(titleSlug)}`;
        window.location.href = newUrl;
      } catch (err) {
        console.error('Error fetching movie details for redirect:', err);
        setError('No se pudo cargar la información de la película');
        setLoading(false);
      }
    };

    if (shouldRedirect) {
      redirectToMovieWithTitle();
      return;
    }

    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isValidId) {
          throw new Error('ID de película inválido');
        }

        const [movieData, creditsData, videosData, similarData, recommendedData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getMovieVideos(movieId),
          getSimilarMovies(movieId),
          getRecommendedMovies(movieId)
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData);
        setSimilarMovies(similarData);
        setRecommendedMovies(recommendedData);
        
        if (!isInitialLoad) {
          showSuccess('Película cargada', `${movieData.title} se cargó correctamente`);
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('No se pudo cargar la información de la película');
        showError('Error al cargar la película', 'Inténtalo de nuevo más tarde');
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    if (movieId && isValidId && !shouldRedirect) {
      fetchMovieData();
    } else if (!isValidId) {
      setError('URL de película inválida');
      setLoading(false);
    }
  }, [movieId, isValidId, shouldRedirect, showSuccess, showError, isInitialLoad]);

  const handleFavoriteClick = () => {
    if (!movie) return;

    const currentFavoriteState = isMovieFavorite(movie.id);

    if (currentFavoriteState) {
      removeMovieFromFavorites(movie.id);
      showSuccess('Removido de favoritos', `${movie.title} se eliminó de tus favoritos`);
    } else {
      addMovieToFavorites(movie);
      showSuccess('Agregado a favoritos', `${movie.title} se agregó a tus favoritos`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title || 'Película',
          text: `Mira ${movie?.title} en CineGemini`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Enlace copiado', 'El enlace se copió al portapapeles');
    }
  };

  const handlePlayClick = () => {
    const availableVideos = videos?.results || [];
    const trailerVideos = availableVideos.filter((video: any) =>
      video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailerVideos.length > 0) {
      setActiveTab('videos');
      showSuccess('Videos disponibles', `Se encontraron ${trailerVideos.length} trailers para ${movie?.title}`);
      setTimeout(() => {
        const contentSection = document.querySelector('.container.mx-auto.px-4.py-12');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (availableVideos.length > 0) {
      setActiveTab('videos');
      showSuccess('Videos disponibles', `Se encontraron ${availableVideos.length} videos para ${movie?.title}`);
      setTimeout(() => {
        const contentSection = document.querySelector('.container.mx-auto.px-4.py-12');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      showError('No hay videos', 'No hay trailers o videos disponibles para esta película');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando película...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlay className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error al cargar la película</h2>
          <p className="text-gray-400">{error || 'No se pudo cargar la información de la película'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <FiArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Section con Backdrop */}
        <div
          className="relative h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

          {/* Botón de regreso */}
          <div className="absolute top-6 left-6 z-10">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all duration-200"
            >
              <FiArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>

          {/* Botones de acción */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button
              onClick={handleFavoriteClick}
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer ${isMovieFavorite(movie.id)
                  ? 'bg-red-500/80 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              aria-label={isMovieFavorite(movie.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <FiHeart className={`h-5 w-5 ${isMovieFavorite(movie.id) ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
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
                      {movie.title}
                    </h1>
                    {movie.release_date && (
                      <p className="text-base sm:text-lg md:text-xl text-gray-300 flex items-center gap-2">
                        <FiCalendar className="h-5 w-5" />
                        {formatDate(movie.release_date)}
                      </p>
                    )}
                  </div>

                  {/* Rating y duración */}
                  <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 items-center">
                    <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <FiStar className="text-yellow-400 h-5 w-5" />
                      <span className="font-bold text-base sm:text-lg md:text-xl text-white">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                    {movie.runtime && (
                      <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <FiClock className="text-gray-400 h-5 w-5" />
                        <span className="text-white text-sm sm:text-base">{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                    {director && (
                      <Link
                        href={getPersonUrl(director)}
                        className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                      >
                        <FiAward className="text-gray-400 h-5 w-5 group-hover:text-blue-400 transition-colors duration-200" />
                        <span className="text-white group-hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base">Dir. {director.name}</span>
                      </Link>
                    )}
                  </div>

                  {/* Géneros */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/genre/${genre.id}`}
                          className="bg-white/10 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tagline */}
                  {movie.tagline && (
                    <div className="max-w-2xl sm:max-w-3xl">
                      <div className="relative">
                        <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed italic font-light">
                          &ldquo;{movie.tagline}&rdquo;
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
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.webp'}
                    alt={`Póster de ${movie.title}`}
                    width={500}
                    height={750}
                    className="w-full rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                    <button
                      onClick={handlePlayClick}
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

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          {/* Tabs de navegación */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 flex">
              {[
                { id: 'overview', label: 'Resumen', icon: FiPlay },
                { id: 'cast', label: 'Reparto', icon: FiUsers },
                { id: 'videos', label: 'Videos', icon: FiDownload },
                { id: 'similar', label: 'Similares', icon: FiBookmark }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center text-xs md:text-base gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
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

          {/* Contenido de tabs */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
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
                          ? movie.overview
                          : movie.overview.length > 200
                            ? `${movie.overview.substring(0, 200)}...`
                            : movie.overview
                          || 'Sinopsis no disponible.'
                        }
                      </p>
                      {movie.overview.length > 200 && (
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
                        <span className="font-semibold">Duración:</span> {formatRuntime(movie.runtime || 0)}
                      </div>
                      <div>
                        <span className="font-semibold">Año:</span> {movie.release_date?.substring(0, 4)}
                      </div>
                      <div>
                        <span className="font-semibold">Rating:</span> {movie.vote_average?.toFixed(1)}/10
                      </div>
                      <div>
                        <span className="font-semibold">Director:</span>
                        {director && (
                          <Link
                            href={getPersonUrl(director)}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 ml-1"
                          >
                            {director.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Películas Recomendadas */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiBookmark className="h-6 w-6 text-blue-400" />
                      Películas Recomendadas
                    </h2>
                    {recommendedMovies?.results && recommendedMovies.results.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {recommendedMovies.results.slice(0, 8).map((similarMovie: Movie) => (
                          <Link
                            key={similarMovie.id}
                            href={`/movie/${similarMovie.id}-${encodeURIComponent(similarMovie.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '')}`}
                            className="group bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-600/50 transition-all duration-300"
                          >
                            <div className="relative aspect-[2/3] bg-gray-600">
                              {similarMovie.poster_path ? (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w200${similarMovie.poster_path}`}
                                  alt={`Poster de ${similarMovie.title}`}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FiPlay className="h-8 w-8 text-gray-500" />
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
                                {similarMovie.title}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{similarMovie.release_date?.substring(0, 4) || 'N/A'}</span>
                                <div className="flex items-center gap-1">
                                  <FiStar className="h-3 w-3 text-yellow-400" />
                                  <span>{similarMovie.vote_average?.toFixed(1) || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiBookmark className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">No hay películas recomendadas disponibles</p>
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
                          href={getPersonUrl(member)}
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
                            <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors duration-200">{member.name}</p>
                            <p className="text-gray-400 text-xs">{member.character}</p>
                          </div>
                          <FiExternalLink className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors duration-200" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cast' && (
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
            )}

            {activeTab === 'videos' && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <FiDownload className="h-8 w-8 text-blue-400" />
                  Videos y Tráilers
                </h2>
                <VideoPlayer videos={videos?.results || []} />
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <FiBookmark className="h-8 w-8 text-blue-400" />
                  Películas Similares
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {similarMovies?.results?.map((similarMovie: Movie) => (
                    <MovieCard key={similarMovie.id} movie={similarMovie} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />
    </>
  );
} 