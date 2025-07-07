'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getMoviesByGenre, getTVShowsByGenre } from '@/lib/api';
import { MOVIE_GENRES, TV_GENRES, getGenreName } from '@/constants/genres';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import { FiFilm, FiTv, FiGrid, FiList, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useNotifications, NotificationContainer } from '@/components/Notification';
import Link from 'next/link';

export default function GenrePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const genreId = params.id as string;
  const mediaType = searchParams.get('type') || 'movie'; // 'movie' o 'tv'
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const { showError } = useNotifications();

  // Función para eliminar duplicados - previene películas/series duplicadas en scroll infinito
  const removeDuplicates = (items: Movie[]): Movie[] => {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    }).map(item => ({
      ...item,
      media_type: mediaType as 'movie' | 'tv' // Agregar el tipo de medio correcto
    }));
  };

  // Obtener información del género basado en el tipo de medio
  const getGenreInfo = () => {
    if (mediaType === 'tv') {
      return TV_GENRES.find(g => g.id === parseInt(genreId));
    }
    return MOVIE_GENRES.find(g => g.id === parseInt(genreId));
  };

  const genre = getGenreInfo();
  const genreName = genre?.name || getGenreName(parseInt(genreId));
  const GenreIcon = genre?.icon || undefined;
  const genreBg = genre?.bg || '';
  const genreColor = genre?.color || 'from-blue-600 to-purple-600';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let data;
        
        if (mediaType === 'tv') {
          data = await getTVShowsByGenre(genreId, page);
        } else {
          data = await getMoviesByGenre(genreId, page);
        }
        
        if (page === 1) {
          setMovies(data.results || []);
        } else {
          setMovies(prev => removeDuplicates([...prev, ...(data.results || [])]));
        }
        
        setHasMore(page < (data.total_pages || 1));
      } catch (err) {
        console.error(`Error fetching ${mediaType} by genre:`, err);
        setError(`No se pudieron cargar los ${mediaType === 'tv' ? 'programas de TV' : 'películas'} del género`);
        showError(`Error al cargar ${mediaType === 'tv' ? 'programas de TV' : 'películas'}`, 'Inténtalo de nuevo más tarde');
      } finally {
        setLoading(false);
      }
    };

    if (genreId) {
      fetchContent();
    }
  }, [genreId, page, mediaType, showError]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading && hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  const retry = () => {
    setError(null);
    setPage(1);
    setMovies([]);
  };

  // Filtrar y ordenar contenido
  const filteredContent = movies
    .filter(item => {
      const title = mediaType === 'tv' ? item.name : item.title;
      const date = mediaType === 'tv' ? item.first_air_date : item.release_date;
      
      return (
        (searchQuery === '' || (title && title.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        (yearFilter === '' || (date && date.startsWith(yearFilter))) &&
        (ratingFilter === '' || (item.vote_average && item.vote_average >= parseFloat(ratingFilter)))
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

  if (!genre) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Género no encontrado</h1>
          <p className="text-gray-400 mb-6">El género solicitado no existe.</p>
          <Link
            href={mediaType === 'tv' ? '/tv' : '/'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const mediaTypeLabel = mediaType === 'tv' ? 'programas de TV' : 'películas';
  const mediaTypeIcon = mediaType === 'tv' ? FiTv : FiFilm;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NotificationContainer notifications={[]} />
      
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
              <span>Descubre los mejores {mediaTypeLabel} de</span>
              <span className="font-semibold">{genreName.toLowerCase()}</span>
              {mediaType === 'tv' && <FiTv className="w-5 h-5" />}
            </p>
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
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
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' 
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
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 ${
                  viewMode === 'list' 
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
                <option value="rating">Calificación</option>
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
            <div className={`grid animate-fade-in ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6' : 'grid-cols-1 gap-4'}`}>
              {filteredContent.map((item, index) => (
                <MovieCard 
                  key={`${item.id}-${index}`} 
                  movie={item} 
                  viewMode={viewMode}
                  mediaType={mediaType as 'movie' | 'tv'}
                />
              ))}
            </div>
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
            {/* Loader scroll infinito */}
            {loading && (
              <div className="flex justify-center py-8 animate-fade-in">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 