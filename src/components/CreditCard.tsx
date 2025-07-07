'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiImage, FiHeart, FiPlay, FiStar, FiTv } from 'react-icons/fi';
import { useFavorites } from '@/context/FavoritesContext';

interface Credit {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: string;
  popularity: number;
}

interface CreditCardProps {
  credit: Credit;
}

const CreditCard = ({ credit }: CreditCardProps) => {
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
  const rating = credit.vote_average ? credit.vote_average.toFixed(1) : 'N/A';
  
  // Determinar si es una serie de TV
  const isTV = credit.media_type === 'tv';
  const isMovie = credit.media_type === 'movie';
  const isFavorite = isTV ? isTVFavorite(credit.id) : isMovie ? isMovieFavorite(credit.id) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isMovie && !isTV) return; // Solo permitir favoritos para películas y series
    
    // Convertir Credit a Movie para agregar a favoritos
    const movieData = {
      id: credit.id,
      title: credit.title || credit.name || 'Sin título',
      name: credit.name || credit.title || 'Sin título',
      overview: '',
      poster_path: credit.poster_path,
      backdrop_path: '',
      release_date: credit.release_date || credit.first_air_date || '',
      first_air_date: credit.first_air_date || credit.release_date || '',
      vote_average: credit.vote_average,
      popularity: credit.popularity,
      genres: [],
      runtime: 0,
      media_type: credit.media_type as 'movie' | 'tv'
    };
    
    if (isTV) {
      if (isFavorite) {
        removeTVFromFavorites(credit.id);
      } else {
        addTVToFavorites(movieData);
      }
    } else if (isMovie) {
      if (isFavorite) {
        removeMovieFromFavorites(credit.id);
      } else {
        addMovieToFavorites(movieData);
      }
    }
  };

  const getMediaIcon = () => {
    return credit.media_type === 'movie' ? <FiPlay className="h-4 w-4" /> : <FiTv className="h-4 w-4" />;
  };

  const getMediaUrl = () => {
    // Verificar que el título existe antes de procesarlo
    const title = credit.title || credit.name || (credit.media_type === 'tv' ? 'serie' : 'pelicula');
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/${credit.media_type}/${credit.id}-${encodeURIComponent(titleSlug)}`;
  };

  const getTitle = () => {
    return credit.title || credit.name || 'Sin título';
  };

  const getYear = () => {
    const date = credit.release_date || credit.first_air_date;
    return date ? date.substring(0, 4) : '';
  };

  return (
    <Link href={getMediaUrl()} className="group block" aria-label={`Ver detalles de ${getTitle()}`}>
      <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
        {/* Insignia de Puntuación */}
        <div className="absolute top-2 right-2 z-20 bg-gray-900/90 backdrop-blur-sm text-white text-sm font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <FiStar className="text-yellow-400 text-xs" />
          {rating}
        </div>

        {/* Botón de Favorito - Para películas y series */}
        {(isMovie || isTV) && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 z-20 p-2 rounded-full bg-gray-900/90 backdrop-blur-sm text-gray-300 hover:text-red-500 transition-colors duration-200"
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Insignia de tipo de medio */}
        <div className="absolute top-2 left-2 z-20 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          {getMediaIcon()}
          {credit.media_type === 'movie' ? 'Película' : 'Serie'}
        </div>

        {/* Imagen */}
        {credit.poster_path ? (
          <div className="relative w-full aspect-[2/3] overflow-hidden">
            <Image
              src={`https://image.tmdb.org/t/p/w500${credit.poster_path}`}
              alt={`Póster de ${getTitle()}`}
              width={500}
              height={750}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-110`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
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
          <div className="flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 w-full aspect-[2/3]">
            <FiImage className="text-gray-500 text-5xl" />
          </div>
        )}

        {/* Overlay con información al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white truncate mb-1">{getTitle()}</h3>
            <p className="text-sm text-gray-300 mb-2">{getYear()}</p>
            
            {/* Información del rol */}
            {(credit.character || credit.job) && (
              <p className="text-xs text-gray-400 mb-3 truncate">
                {credit.character ? `Como: ${credit.character}` : credit.job}
              </p>
            )}
            
            {/* Botón de Play */}
            <div className="flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors duration-200">
                <FiPlay className="text-white h-5 w-5 ml-1" />
              </div>
            </div>
          </div>
        </div>

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
};

export default CreditCard; 