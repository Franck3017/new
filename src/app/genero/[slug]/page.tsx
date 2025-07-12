'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { getMoviesByGenre, getTVShowsByGenre } from "@/lib/api";
import { Movie } from "@/types";
import Image from "next/image";
import {
  FiArrowLeft,
  FiStar,
  FiCalendar,
  FiFilter,
  FiGrid,
  FiList,
  FiTv,
  FiFilm,
  FiSearch,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";
import MovieCard from "@/components/MovieCard";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import Link from "next/link";
import InfiniteScroll from "@/components/InfiniteScroll";
import { ROUTES } from '@/utils/urlHelpers';
import { MOVIE_GENRES, TV_GENRES } from '@/constants/genres';

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function GenrePage({ params, searchParams }: GenrePageProps) {
  // Desenvolver params usando React.use()
  const resolvedParams = use(params) as { slug: string };
  const resolvedSearchParams = use(searchParams) as { [key: string]: string | string[] | undefined };

  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Estado para las notificaciones
  const { notifications, showSuccess, showError } = useNotifications();

  // Extraer el ID del género del slug
  // El formato es: slug-id (ej: accion-28)
  const slugParts = resolvedParams.slug.split('-');
  const genreId = slugParts[slugParts.length - 1]; // Tomar el último elemento como ID

  // Obtener el tipo de medio de los searchParams
  const mediaType = resolvedSearchParams?.type === 'tv' ? 'tv' : 'movie';

  // Validar que el ID sea un número válido
  const isValidId = !isNaN(Number(genreId)) && Number(genreId) > 0;

  // Mapeo de IDs de géneros a nombres
  const genreNames: Record<number, string> = {
    28: 'Acción',
    12: 'Aventura',
    16: 'Animación',
    35: 'Comedia',
    80: 'Crimen',
    99: 'Documental',
    18: 'Drama',
    10751: 'Familiar',
    14: 'Fantasía',
    36: 'Historia',
    27: 'Terror',
    10402: 'Música',
    9648: 'Misterio',
    10749: 'Romance',
    878: 'Ciencia ficción',
    10770: 'Película de TV',
    53: 'Suspenso',
    10752: 'Guerra',
    37: 'Western',
  };

  const genreName = genreNames[Number(genreId)] || 'Género';

  useEffect(() => {
    const fetchGenreData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isValidId) {
          throw new Error('ID de género inválido');
        }

        const data = mediaType === 'tv'
          ? await getTVShowsByGenre(genreId, 1)
          : await getMoviesByGenre(genreId, 1);

        if (mediaType === 'tv') {
          setTVShows(data.results || []);
        } else {
          setMovies(data.results || []);
        }

        setCurrentPage(1);
        setHasMore(data.page < data.total_pages);

        if (!isInitialLoad) {
          showSuccess('Género cargado', `${genreName} se cargó correctamente`);
        }
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Error fetching genre data:', err);
        setError('No se pudo cargar la información del género');
        showError('Error al cargar el género', 'Inténtalo de nuevo más tarde');
      } finally {
        setLoading(false);
      }
    };

    if (genreId && isValidId) {
      fetchGenreData();
    } else if (!isValidId) {
      setError('URL de género inválida');
      setLoading(false);
    }
  }, [genreId, isValidId, mediaType, genreName]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;

      const data = mediaType === 'tv'
        ? await getTVShowsByGenre(genreId, nextPage)
        : await getMoviesByGenre(genreId, nextPage);

      // Agregar nuevas cards de forma suave sin recargar
      if (mediaType === 'tv') {
        setTVShows(prev => [...prev, ...(data.results || [])]);
      } else {
        setMovies(prev => [...prev, ...(data.results || [])]);
      }

      setCurrentPage(nextPage);
      setHasMore(nextPage < data.total_pages);
      setLoading(false);

    } catch (err) {
      console.error('Error loading more data:', err);
      showError('Error al cargar más contenido', 'Inténtalo de nuevo más tarde');
      setLoading(false);
    }
  };

  // Función sortContent eliminada - ahora se maneja directamente en filteredContent

  const retry = () => {
    setError(null);
    setCurrentPage(1);
    setMovies([]);
    setTVShows([]);
    setIsInitialLoad(true);
  };

  const getGenreInfo = () => {
    if (mediaType === 'tv') {
      return TV_GENRES.find(g => g.id === parseInt(genreId));
    }
    return MOVIE_GENRES.find(g => g.id === parseInt(genreId));
  };

  const genre = getGenreInfo();
  const GenreIcon = genre?.icon || undefined;
  const genreBg = genre?.bg || '';
  const genreColor = genre?.color || 'from-blue-600 to-purple-600';

  // Obtener el contenido correcto según el tipo de medio
  const currentContent = mediaType === 'tv' ? tvShows : movies;
  
  // Memoizar el contenido filtrado para evitar re-cálculos innecesarios
  const filteredContent = useMemo(() => {
    return currentContent
      .filter(item => {
        const title = mediaType === 'tv' ? item.name : item.title;
        
        return (
          searchQuery === '' || (title && title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'popularity':
            comparison = (a.popularity || 0) - (b.popularity || 0);
            break;
          case 'rating':
            comparison = (a.vote_average || 0) - (b.vote_average || 0);
            break;
          case 'date':
            const dateA = mediaType === 'tv' ? a.first_air_date : a.release_date;
            const dateB = mediaType === 'tv' ? b.first_air_date : b.release_date;
            comparison = new Date(dateA || '').getTime() - new Date(dateB || '').getTime();
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [currentContent, searchQuery, sortBy, sortOrder, mediaType]);
  const mediaTypeLabel = mediaType === 'tv' ? 'programas de TV' : 'películas';
  const mediaTypeIcon = mediaType === 'tv' ? <FiTv className="w-5 h-5" /> : <FiFilm className="w-5 h-5" />;

  // Solo mostrar loading inicial, no durante búsquedas
  if (loading && currentPage === 1 && !searchQuery) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando {genreName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFilter className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error al cargar el género</h2>
          <p className="text-gray-400">{error}</p>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <FiArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NotificationContainer notifications={notifications} />
      {/* Banner visual del género */}
      <div className="relative h-[320px] md:h-[400px] flex items-end">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${genreBg})` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${genreColor} opacity-80`}></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 flex items-end gap-6">
          {GenreIcon && (
            <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-white/20 shadow-lg backdrop-blur-lg">
              <GenreIcon className="w-20 h-20 text-white drop-shadow-lg" />
            </div>
          )}
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 drop-shadow-lg flex items-center gap-3">
              {GenreIcon && <GenreIcon className="inline-block w-8 h-8 md:hidden" />} {genreName}
            </h1>
            <p className="text-blue-100 text-lg max-w-xl drop-shadow flex items-center gap-2">
              <span>Descubre las mejores {mediaTypeLabel} de</span>
              <span className="font-semibold">{genreName.toLowerCase()}</span>
              {mediaTypeIcon}
            </p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between animate-fade-in">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Buscar ${mediaTypeLabel}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                aria-label={`Buscar ${mediaTypeLabel}`}
              />
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-end animate-slide-in-up">
            {/* Modo de vista */}
            <div className="flex items-center bg-gray-700/50 rounded-lg p-1 border border-gray-600/50 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                  }`}
                aria-label="Vista de cuadrícula"
                title="Vista de cuadrícula"
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                  }`}
                aria-label="Vista de lista"
                title="Vista de lista"
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>

            {/* Separador visual */}
            <div className="hidden sm:block w-px h-8 bg-gray-600/50"></div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px]"
                aria-label="Ordenar por"
              >
                <option value="popularity">Popularidad</option>
                <option value="rating">Valoración</option>
                <option value="date">Fecha</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center w-10 h-10 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all duration-200 shadow-sm"
                aria-label="Cambiar orden"
                title={sortOrder === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
              >
                {sortOrder === 'asc' ? <FiArrowUp className="h-4 w-4" /> : <FiArrowDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>


        {/* Contador de resultados */}
        <div className="text-gray-400 text-sm mb-4">
          {searchQuery ? (
            <>
              {filteredContent.length} de {currentContent.length} {mediaType === 'tv' ? 'series' : 'películas'} encontradas
              {filteredContent.length === 0 && (
                <span className="text-yellow-400 ml-2">• No se encontraron resultados para "{searchQuery}"</span>
              )}
            </>
          ) : (
            <>
              {filteredContent.length} {mediaType === 'tv' ? 'series' : 'películas'} encontradas
              {hasMore && <span className="text-blue-400 ml-2">• Desplázate para cargar más</span>}
            </>
          )}
        </div>
        
        {/* Contenido */}
        {error ? (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={retry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            {/* Grid de contenido */}
            <InfiniteScroll 
              onLoadMore={loadMore} 
              hasMore={hasMore && !searchQuery} 
              loading={loading}
              loadingText={`Cargando más ${mediaType === 'tv' ? 'series' : 'películas'}...`}
              endText={`Has visto todas las ${mediaType === 'tv' ? 'series' : 'películas'} disponibles`}
              error={error}
              onRetry={retry}
            >
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6' : 'grid-cols-1 gap-4'}`}>
                {filteredContent.map((item: Movie, index: number) => {
                  // Solo animar las nuevas cards (últimas 20)
                  const isNewCard = index >= filteredContent.length - 20;
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className={isNewCard ? "animate-fade-in-up" : ""}
                      style={{
                        animationDelay: isNewCard ? `${Math.min((index - (filteredContent.length - 20)) * 30, 300)}ms` : '0ms',
                        animationFillMode: 'both'
                      }}
                    >
                      <MovieCard movie={item} viewMode={viewMode} mediaType={mediaType as 'movie' | 'tv'} />
                    </div>
                  );
                })}
              </div>
            </InfiniteScroll>
            {/* Estado vacío */}
            {!loading && filteredContent.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                {mediaType === 'tv' ? (
                  <FiTv className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                ) : (
                  <FiFilm className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                )}
                <p className="text-gray-400">
                  {searchQuery ? `No se encontraron ${mediaTypeLabel} con esa búsqueda` : `No hay ${mediaTypeLabel} disponibles`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 