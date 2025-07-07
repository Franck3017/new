'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, memo, useMemo, useCallback } from 'react';
import { Movie } from '@/types';
import { FiImage, FiHeart, FiPlay, FiStar } from 'react-icons/fi';
import { useFavorites } from '@/context/FavoritesContext';

interface MovieCardProps {
  movie: Movie;
  viewMode?: 'grid' | 'list';
  mediaType?: 'movie' | 'tv';
}

const MovieCard = memo(({ movie, viewMode = 'grid', mediaType = 'movie' }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { 
    favoriteMovies, 
    favoriteTV,
    addMovieToFavorites, 
    addTVToFavorites,
    removeMovieFromFavorites,
    removeTVFromFavorites,
    isMovieFavorite,
    isTVFavorite
  } = useFavorites();
  
  // Usar el media_type del objeto movie si está disponible, sino usar el prop
  const actualMediaType = movie.media_type || mediaType;
  
  // Memoizar valores calculados
  const rating = useMemo(() => movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A', [movie.vote_average]);
  
  // Determinar si es una serie de TV
  const isTV = useMemo(() => {
    return actualMediaType === 'tv' || (movie.name && !movie.title);
  }, [actualMediaType, movie.name, movie.title]);
  
  // Determinar si está en favoritos según el tipo
  const isFavorite = useMemo(() => {
    return isTV ? isTVFavorite(movie.id) : isMovieFavorite(movie.id);
  }, [isTV, isTVFavorite, isMovieFavorite, movie.id]);
  
  // Obtener título y fecha según el tipo de medio
  const displayTitle = useMemo(() => {
    return movie.title || movie.name || 'Sin título';
  }, [movie.title, movie.name]);
  
  const displayDate = useMemo(() => {
    const date = movie.release_date || movie.first_air_date;
    return date ? date.substring(0, 4) : '';
  }, [movie.release_date, movie.first_air_date]);
  
  // Memoizar URL
  const mediaUrl = useMemo(() => {
    const titleSlug = displayTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/${actualMediaType}/${movie.id}-${encodeURIComponent(titleSlug)}`;
  }, [movie.id, displayTitle, actualMediaType]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTV) {
      if (isFavorite) {
        removeTVFromFavorites(movie.id);
      } else {
        addTVToFavorites(movie);
      }
    } else {
      if (isFavorite) {
        removeMovieFromFavorites(movie.id);
      } else {
        addMovieToFavorites(movie);
      }
    }
  }, [isTV, isFavorite, removeTVFromFavorites, addTVToFavorites, removeMovieFromFavorites, addMovieToFavorites, movie]);

  return (
    <Link href={mediaUrl} className={`group block ${viewMode === 'list' ? 'flex' : ''}`} aria-label={`Ver detalles de ${actualMediaType === 'tv' ? 'la serie' : 'la película'} ${displayTitle}`}>
      <div className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ease-out ${
        viewMode === 'grid' 
          ? 'hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20' 
          : 'flex flex-1 hover:bg-gray-750 border border-gray-700/50'
      }`}>
        {/* Insignia de Puntuación - Solo para grid */}
        {viewMode === 'grid' && (
          <div className="absolute top-2 right-2 z-20 bg-gray-900/90 backdrop-blur-sm text-white text-sm font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <FiStar className="text-yellow-400 text-xs" />
            {rating}
          </div>
        )}

        {/* Botón de Favorito - Solo para grid */}
        {viewMode === 'grid' && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 z-20 p-2 rounded-full bg-gray-900/90 backdrop-blur-sm text-gray-300 hover:text-red-500 transition-colors duration-200"
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Imagen */}
        {movie.poster_path ? (
          <div className={`relative overflow-hidden ${
            viewMode === 'grid' ? 'w-full aspect-[2/3]' : 'w-24 h-36 flex-shrink-0'
          }`}>
            <Image
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.webp'}
              alt={`Póster de ${displayTitle}`}
              width={500}
              height={750}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${viewMode === 'grid' ? 'group-hover:scale-110' : ''}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              priority={false}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 animate-pulse">
                <div className="flex items-center justify-center h-full">
                  <FiImage className="text-gray-500 text-4xl" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 ${
            viewMode === 'grid' ? 'w-full aspect-[2/3]' : 'w-24 h-36 flex-shrink-0'
          }`}>
            <FiImage className="text-gray-500 text-5xl" />
          </div>
        )}

        {/* Overlay con información al hacer hover (solo para grid) */}
        {viewMode === 'grid' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white truncate mb-1">{displayTitle}</h3>
              <p className="text-sm text-gray-300 mb-3">{displayDate}</p>
              
              {/* Botón de Play */}
              <div className="flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors duration-200">
                  <FiPlay className="text-white h-5 w-5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información para vista de lista */}
        {viewMode === 'list' && (
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 mr-4">
                <h3 className="text-lg font-bold text-white truncate mb-1">{displayTitle}</h3>
                <p className="text-sm text-gray-400">{displayDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <FiStar className="text-xs" />
                  {rating}
                </div>
                <button
                  onClick={handleFavoriteClick}
                  className="p-2 rounded-full bg-gray-700/50 text-gray-300 hover:text-red-500 transition-colors duration-200"
                  aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>
            {movie.overview && (
              <p className="text-sm text-gray-300 line-clamp-2">{movie.overview}</p>
            )}
          </div>
        )}

        {/* Indicador de carga */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg">
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
