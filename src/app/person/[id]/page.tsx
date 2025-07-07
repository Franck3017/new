'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getPersonDetails,
  getPersonCredits,
  getPersonImages,
} from "@/lib/api";
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
  FiInfo,
  FiFilm,
  FiImage,
  FiUser,
  FiGlobe,
  FiX,
  FiMinus,
  FiPlus,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
  FiFacebook,
  FiInstagram,
  FiTwitter
} from "react-icons/fi";
import CreditCard from "@/components/CreditCard";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";

interface PersonPageProps {
  params: { id: string };
}

interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  deathday: string | null;
  place_of_birth: string;
  profile_path: string;
  popularity: number;
  known_for_department: string;
  gender: number;
  adult: boolean;
  imdb_id: string;
  homepage: string;
  also_known_as: string[];
  external_ids: {
    facebook_id: string;
    instagram_id: string;
    twitter_id: string;
    youtube_id: string;
    imdb_id: string;
  };
}

interface PersonCredits {
  cast: Array<{
    id: number;
    title: string;
    character: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    media_type: string;
    popularity: number;
  }>;
  crew: Array<{
    id: number;
    title: string;
    job: string;
    department: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    media_type: string;
    popularity: number;
  }>;
}

interface PersonImages {
  profiles: Array<{
    file_path: string;
    aspect_ratio: number;
    height: number;
    width: number;
  }>;
}

export default function PersonPage({ params }: PersonPageProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [images, setImages] = useState<PersonImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el resumen
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'filmography' | 'photos' | 'personal'>('overview');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estado para el modal de fotos
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Estado para las notificaciones
  const { notifications, showSuccess, showError } = useNotifications();

  // Estado para los favoritos
  const { isPersonFavorite, addPersonToFavorites, removePersonFromFavorites } = useFavorites();

  // Estado para filtros de filmografía
  const [filmographyFilter, setFilmographyFilter] = useState<'all' | 'movies' | 'tv'>('all');

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [personData, creditsData, imagesData] = await Promise.all([
          getPersonDetails(params.id),
          getPersonCredits(params.id),
          getPersonImages(params.id)
        ]);

        setPerson(personData);
        setCredits(creditsData);
        setImages(imagesData);
        
        if (!isInitialLoad) {
          showSuccess('Persona cargada', `${personData.name} se cargó correctamente`);
        }
      } catch (err) {
        console.error('Error fetching person data:', err);
        setError('No se pudo cargar la información de la persona');
        showError('Error al cargar la persona', 'Inténtalo de nuevo más tarde');
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    if (params.id) {
      fetchPersonData();
    }
  }, [params.id, showSuccess, showError, isInitialLoad]);

  // Event listener para teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal, currentImageIndex, images]);

  const handleFavoriteClick = () => {
    if (!person) return;

    const currentFavoriteState = isPersonFavorite(person.id);

    if (currentFavoriteState) {
      removePersonFromFavorites(person.id);
      showSuccess('Removido de favoritos', `${person.name} se eliminó de tus favoritos`);
    } else {
      // Agregar la propiedad known_for que requiere el tipo Person de types.ts
      const personWithKnownFor = {
        ...person,
        known_for: []
      };
      addPersonToFavorites(personWithKnownFor);
      showSuccess('Agregado a favoritos', `${person.name} se agregó a tus favoritos`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: person?.name || 'Persona',
          text: `Conoce más sobre ${person?.name} en CineGemini`,
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

  const handlePhotoClick = (imagePath: string, index: number) => {
    setSelectedImage(`https://image.tmdb.org/t/p/original${imagePath}`);
    setCurrentImageIndex(index);
    setShowImageModal(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setCurrentImageIndex(0);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  const nextImage = () => {
    if (!images?.profiles) return;
    const nextIndex = (currentImageIndex + 1) % images.profiles.length;
    const nextImage = images.profiles[nextIndex];
    setSelectedImage(`https://image.tmdb.org/t/p/original${nextImage.file_path}`);
    setCurrentImageIndex(nextIndex);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  const previousImage = () => {
    if (!images?.profiles) return;
    const prevIndex = currentImageIndex === 0 ? images.profiles.length - 1 : currentImageIndex - 1;
    const prevImage = images.profiles[prevIndex];
    setSelectedImage(`https://image.tmdb.org/t/p/original${prevImage.file_path}`);
    setCurrentImageIndex(prevIndex);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setImageLoaded(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showImageModal) return;

    switch (e.key) {
      case 'Escape':
        closeImageModal();
        break;
      case 'x':
        e.preventDefault();
        closeImageModal();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        previousImage();
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case '0':
        resetZoom();
        break;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleFilmographyFilter = (filter: 'all' | 'movies' | 'tv') => {
    setFilmographyFilter(filter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    const age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return 'Femenino';
      case 2:
        return 'Masculino';
      default:
        return 'No especificado';
    }
  };

  const removeDuplicateCredits = (credits: any[]) => {
    const seen = new Set();
    return credits.filter(credit => {
      const key = `${credit.id}-${credit.media_type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando persona...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'No se pudo cargar la persona'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <FiArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Procesar créditos
  const allCredits = removeDuplicateCredits([
    ...(credits?.cast || []).map(credit => ({ ...credit, role: credit.character })),
    ...(credits?.crew || []).map(credit => ({ ...credit, role: credit.job }))
  ]);

  const sortedCredits = allCredits
    .filter(credit => {
      if (filmographyFilter === 'movies') return credit.media_type === 'movie';
      if (filmographyFilter === 'tv') return credit.media_type === 'tv';
      return true;
    })
    .sort((a, b) => new Date(b.release_date || '1900-01-01').getTime() - new Date(a.release_date || '1900-01-01').getTime());

  const backgroundImageUrl = `https://image.tmdb.org/t/p/original${person.profile_path}`;
  const isFavorite = isPersonFavorite(person.id);

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
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer ${isFavorite
                  ? 'bg-red-500/80 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
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
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end w-full">
              {/* Foto de perfil */}
              <div className="w-3/5 mx-auto max-w-[220px] sm:max-w-[260px] md:w-2/5 md:max-w-xs lg:w-1/4 flex-shrink-0 mb-6 md:mb-0 hidden md:block">
                <div className="relative group">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                    alt={`Foto de ${person.name}`}
                    width={500}
                    height={750}
                    className="w-full max-w-sm rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => setActiveTab('photos')}
                      className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 cursor-pointer"
                      title="Ver galería de fotos"
                    >
                      <FiImage className="h-8 w-8 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="lg:w-3/4 flex-1">
                <div className="space-y-4">
                  {/* Nombre y departamento */}
                  <div>
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-2">
                      {person.name}
                    </h1>
                    <p className="text-xl text-gray-300 flex items-center gap-2">
                      <FiAward className="h-5 w-5" />
                      {person.known_for_department || 'Actor/Actriz'}
                    </p>
                  </div>

                  {/* Información básica */}
                  <div className="flex items-center flex-wrap gap-6">
                    <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <FiStar className="text-yellow-400 h-5 w-5" />
                      <span className="font-bold text-xl text-white">{person.popularity?.toFixed(1)}</span>
                    </div>

                    {person.birthday && (
                      <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <FiCalendar className="text-gray-400 h-5 w-5" />
                        <span className="text-white">{formatDate(person.birthday)}</span>
                      </div>
                    )}

                    {person.birthday && !person.deathday && (
                      <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <FiUsers className="text-gray-400 h-5 w-5" />
                        <span className="text-white">{calculateAge(person.birthday)} años</span>
                      </div>
                    )}

                    {person.place_of_birth && (
                      <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <FiGlobe className="text-gray-400 h-5 w-5" />
                        <span className="text-white">{person.place_of_birth}</span>
                      </div>
                    )}
                  </div>

                  {/* Género */}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/20">
                      {getGenderText(person.gender)}
                    </span>
                  </div>

                  {/* Biografía */}
                  {person.biography && (
                    <div className="max-w-3xl">
                      <p className="text-gray-300 leading-relaxed line-clamp-3">
                        {
                          person.biography || 'Biografía no disponible.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          {/* Tabs de navegación */}
          <div className="flex items-center justify-center mb-8">
            {/* Mobile: scroll horizontal, compact */}
            <div className="flex sm:hidden bg-gray-800/60 backdrop-blur-md rounded-xl p-1 gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 snap-x snap-mandatory scroll-smooth">
              {[
                { id: 'overview', label: 'Resumen', icon: FiInfo },
                { id: 'filmography', label: 'Filmografía', icon: FiFilm },
                { id: 'photos', label: 'Fotos', icon: FiImage },
                { id: 'personal', label: 'Personal', icon: FiUser }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 snap-center ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                    tabIndex={0}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Desktop: diseño centrado, botones grandes */}
            <div className="hidden sm:flex items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
              {[
                { id: 'overview', label: 'Resumen', icon: FiInfo },
                { id: 'filmography', label: 'Filmografía', icon: FiFilm },
                { id: 'photos', label: 'Fotos', icon: FiImage },
                { id: 'personal', label: 'Personal', icon: FiUser }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 text-base font-semibold ${
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

          {/* Contenido de tabs */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {/* Biografía detallada */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiUser className="h-6 w-6 text-blue-400" />
                      Biografía
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        {showFullBio
                          ? person.biography
                          : person.biography.length > 200
                            ? `${person.biography.substring(0, 200)}...`
                            : person.biography
                        }
                      </p>
                      {person.biography.length > 200 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-medium"
                        >
                          {showFullBio ? 'Mostrar menos' : 'Leer más'}
                        </button>
                      )}
                  </div>

                  {/* Información profesional */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiAward className="h-6 w-6 text-blue-400" />
                      Información Profesional
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                      <div>
                        <span className="font-semibold">Género:</span> {getGenderText(person.gender)}
                      </div>
                      <div>
                        <span className="font-semibold">Departamento:</span> {person.known_for_department || 'No especificado'}
                      </div>
                      <div>
                        <span className="font-semibold">Popularidad:</span> {person.popularity?.toFixed(1)}
                      </div>
                      {person.birthday && (
                        <div>
                          <span className="font-semibold">Fecha de nacimiento:</span> {formatDate(person.birthday)}
                        </div>
                      )}
                      {person.place_of_birth && (
                        <div>
                          <span className="font-semibold">Lugar de nacimiento:</span> {person.place_of_birth}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trabajos más conocidos */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiFilm className="h-6 w-6 text-blue-400" />
                      Trabajos Más Conocidos
                    </h2>
                    {allCredits.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {allCredits.slice(0, 8).map((credit) => (
                          <CreditCard key={`${credit.id}-${credit.media_type}`} credit={credit} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiFilm className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">No hay trabajos disponibles</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Enlaces externos */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiGlobe className="h-5 w-5 text-blue-400" />
                      Enlaces Externos
                    </h2>
                    <div className="space-y-3">
                      {person.external_ids?.imdb_id && (
                        <a
                          href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <FiExternalLink className="h-4 w-4 text-yellow-400" />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">IMDB</span>
                        </a>
                      )}
                      {person.external_ids?.facebook_id && (
                        <a
                          href={`https://www.facebook.com/${person.external_ids.facebook_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <FiFacebook className="h-4 w-4 text-blue-400" />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">Facebook</span>
                        </a>
                      )}
                      {person.external_ids?.instagram_id && (
                        <a
                          href={`https://www.instagram.com/${person.external_ids.instagram_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-pink-500/20 rounded-lg">
                            <FiInstagram className="h-4 w-4 text-pink-400" />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">Instagram</span>
                        </a>
                      )}
                      {person.external_ids?.twitter_id && (
                        <a
                          href={`https://www.x.com/${person.external_ids.twitter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <FiTwitter className="h-4 w-4 text-blue-400" />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">Twitter</span>
                        </a>
                      )}
                      {person.homepage && (
                        <a
                          href={person.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <FiExternalLink className="h-4 w-4 text-blue-400" />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">Sitio web</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'filmography' && (
              <div className="space-y-8">
                <div className="flex flex-wrap gap-6 items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <FiFilm className="h-8 w-8 text-blue-400" />
                    Filmografía
                  </h2>
                  
                  {/* Filtros */}
                  <div className="flex gap-3">
                    {[
                      { id: 'all', label: 'Todos', icon: FiFilm },
                      { id: 'movies', label: 'Películas', icon: FiPlay },
                      { id: 'tv', label: 'Series', icon: FiUsers }
                    ].map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <button
                          key={filter.id}
                          onClick={() => handleFilmographyFilter(filter.id as any)}
                          className={`flex items-center text-xs md:text-base gap-2 px-3 py-2 md:px-6 md:py-3 rounded-xl transition-all duration-300 font-medium ${
                            filmographyFilter === filter.id
                              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-600/50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {sortedCredits.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {sortedCredits.map((credit) => (
                      <CreditCard key={`${credit.id}-${credit.media_type}`} credit={credit} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiFilm className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No hay trabajos disponibles</h3>
                    <p className="text-gray-400">No se encontraron trabajos para este filtro</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <FiImage className="h-8 w-8 text-blue-400" />
                  Galería de Fotos
                </h2>
                
                {images?.profiles && images.profiles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {images.profiles.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => handlePhotoClick(image.file_path, index)}
                        className="relative aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                      >
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                          alt={`Foto de ${person.name}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiImage className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No hay fotos disponibles</h3>
                    <p className="text-gray-400">No se encontraron fotos para esta persona</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <FiUser className="h-8 w-8 text-blue-400" />
                  Información Personal Detallada
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información básica */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Información Básica</h3>
                    <div className="space-y-3 text-gray-300">
                      <div>
                        <span className="font-semibold">Nombre completo:</span> {person.name}
                      </div>
                      <div>
                        <span className="font-semibold">Género:</span> {getGenderText(person.gender)}
                      </div>
                      <div>
                        <span className="font-semibold">Departamento:</span> {person.known_for_department || 'No especificado'}
                      </div>
                      <div>
                        <span className="font-semibold">Popularidad:</span> {person.popularity?.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Fechas importantes */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Fechas Importantes</h3>
                    <div className="space-y-3 text-gray-300">
                      {person.birthday && (
                        <div>
                          <span className="font-semibold">Fecha de nacimiento:</span> {formatDate(person.birthday)}
                        </div>
                      )}
                      {person.deathday && (
                        <div>
                          <span className="font-semibold">Fecha de fallecimiento:</span> {formatDate(person.deathday)}
                        </div>
                      )}
                      {person.birthday && !person.deathday && (
                        <div>
                          <span className="font-semibold">Edad:</span> {calculateAge(person.birthday)} años
                        </div>
                      )}
                      {person.place_of_birth && (
                        <div>
                          <span className="font-semibold">Lugar de nacimiento:</span> {person.place_of_birth}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nombres alternativos */}
                  {person.also_known_as && person.also_known_as.length > 0 && (
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 lg:col-span-2">
                      <h3 className="text-xl font-bold text-white mb-4">Nombres Alternativos</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.also_known_as.map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de imagen mejorado */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Botón de cerrar */}
          <button
            onClick={closeImageModal}
            className="absolute top-6 right-6 z-60 text-white hover:text-gray-300 transition-all duration-300 p-3 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-md border border-white/20"
          >
            <FiX className="h-8 w-8" />
          </button>

          {/* Controles de zoom */}
          <div className="absolute top-6 left-6 z-60 flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-3 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-gray-300 transition-all duration-300"
              title="Zoom out (-)"
            >
              <FiMinus className="h-5 w-5" />
            </button>
            <span className="px-3 py-2 bg-black/50 rounded-lg backdrop-blur-md border border-white/20 text-white text-sm font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-3 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-gray-300 transition-all duration-300"
              title="Zoom in (+)"
            >
              <FiPlus className="h-5 w-5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-3 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-gray-300 transition-all duration-300"
              title="Reset zoom (0)"
            >
              <FiRotateCcw className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación de imágenes */}
          {images?.profiles && images.profiles.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-60 p-4 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-gray-300 transition-all duration-300"
                title="Imagen anterior (←)"
              >
                <FiChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-60 p-4 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-gray-300 transition-all duration-300"
                title="Siguiente imagen (→)"
              >
                <FiChevronRight className="h-8 w-8" />
              </button>
              
              {/* Indicador de posición */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-black/50 rounded-full backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                {currentImageIndex + 1} de {images.profiles.length}
              </div>
            </>
          )}

          {/* Contenedor de imagen */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden -z-10">
            <div 
              className="relative transition-all duration-300 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl min-w-[300px] min-h-[400px]">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="relative">
                <Image
                  src={selectedImage}
                  alt={`Foto ${currentImageIndex + 1} de ${person.name}`}
                  width={1200}
                  height={1800}
                  className={`max-w-full max-h-full object-contain rounded-2xl transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  priority
                  style={{
                    maxWidth: 'min(90vw, 1200px)',
                    maxHeight: 'min(90vh, 1800px)',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Ayuda de controles */}
          <div className="absolute bottom-6 right-6 z-60 px-4 py-2 bg-black/50 rounded-lg backdrop-blur-md border border-white/20 text-white text-xs">
            <div className="flex items-center gap-4">
              <span>← → Navegar</span>
              <span>+ - Zoom</span>
              <span>0 Reset</span>
              <span>ESC Cerrar</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />
    </>
  );
} 