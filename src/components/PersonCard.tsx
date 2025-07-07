'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { Person } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';

interface PersonCardProps {
  person: Person;
  viewMode?: 'grid' | 'list';
}

const PersonCard = ({ person, viewMode = 'grid' }: PersonCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isPersonFavorite, addPersonToFavorites, removePersonFromFavorites } = useFavorites();
  
  const isFavorite = isPersonFavorite(person.id);
  const profileImage = person.profile_path 
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : '/images/image.webp';

  // Generar URL con formato id-name
  const getPersonUrl = () => {
    const nameSlug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/person/${person.id}-${encodeURIComponent(nameSlug)}`;
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      removePersonFromFavorites(person.id);
    } else {
      addPersonToFavorites(person);
    }
  };

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1: return 'Femenino';
      case 2: return 'Masculino';
      default: return 'No especificado';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday);
    const death = deathday ? new Date(deathday) : new Date();
    return death.getFullYear() - birth.getFullYear();
  };

  if (viewMode === 'list') {
    return (
      <Link href={getPersonUrl()}>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group">
          <div className="flex items-center gap-4">
            {/* Imagen */}
            <div className="w-16 h-24 flex-shrink-0">
              <div className="relative w-full h-full">
                <Image
                  src={profileImage}
                  alt={person.name}
                  fill
                  className={`object-cover rounded-lg transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  sizes="64px"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-700 rounded-lg animate-pulse" />
                )}
              </div>
            </div>

            {/* Información */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {person.name}
              </h3>
              {person.known_for_department && (
                <p className="text-sm text-gray-400 mt-1">
                  {person.known_for_department}
                </p>
              )}
              {person.known_for && person.known_for.length > 0 && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  Conocido por: {person.known_for.map((item: any) => 
                    'title' in item ? item.title : item.name  
                  ).slice(0, 2).join(', ')}
                </p>
              )}
            </div>

            {/* Botón de favoritos */}
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                isFavorite 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white'
              }`}
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={getPersonUrl()}>
      <div className="group relative bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
        {/* Imagen */}
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={profileImage}
            alt={person.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse" />
          )}
          
          {/* Overlay con información */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {person.name}
              </h3>
              {person.known_for_department && (
                <p className="text-gray-300 text-xs">
                  {person.known_for_department}
                </p>
              )}
            </div>
          </div>

          {/* Botón de favoritos */}
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 cursor-pointer ${
              isFavorite 
                ? 'bg-red-500/90 text-white' 
                : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white'
            } opacity-0 group-hover:opacity-100`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Información debajo de la imagen */}
        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
            {person.name}
          </h3>
          {person.known_for_department && (
            <p className="text-gray-400 text-xs mt-1 truncate">
              {person.known_for_department}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PersonCard; 