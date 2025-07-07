'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { 
  FiSearch, FiPlay, FiStar, FiHeart,
  FiEye, FiShare2, FiBookmark, FiX, FiVolume2, FiVolumeX
} from 'react-icons/fi';
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, searchMovies } from '@/lib/api';
import { Movie } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { useNotifications, NotificationContainer } from '@/components/Notification';
import Link from 'next/link';

interface HeroSectionProps {
  onMovieSelect?: (movie: Movie) => void;
}

export default function HeroSection({ onMovieSelect }: HeroSectionProps) {
  // Estados principales
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // Estados de búsqueda avanzada
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados de vista rápida
  const [quickViewMovie, setQuickViewMovie] = useState<Movie | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Referencias
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const quickViewRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { 
    isMovieFavorite, 
    isTVFavorite,
    addMovieToFavorites, 
    addTVToFavorites,
    removeMovieFromFavorites,
    removeTVFromFavorites
  } = useFavorites();
  const { showSuccess, showError } = useNotifications();

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [popular, topRated] = await Promise.all([
          getPopularMovies(1),
          getTopRatedMovies(1)
        ]);
        
        setFeaturedMovies([...popular.results.slice(0, 3), ...topRated.results.slice(0, 2)]);
        
      } catch (error) {
        console.error('Error fetching movies:', error);
        showError('Error al cargar datos', 'No se pudieron cargar las películas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  // Autoplay del slider
  useEffect(() => {
    if (isPlaying && featuredMovies.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
      }, 7000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, featuredMovies.length]);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Búsqueda de películas reales
          const movieResults = await searchMovies(searchQuery.trim(), 1);
          setSearchResults(movieResults.results.slice(0, 5)); // Mostrar solo 5 resultados
          
          // Generar sugerencias basadas en los resultados
          const movieTitles = movieResults.results.slice(0, 3).map((movie: Movie) => movie.title);
          const suggestions = [...movieTitles, ...searchHistory.filter(term => 
            term.toLowerCase().includes(searchQuery.toLowerCase())
          )];
          
          setSearchSuggestions([...new Set(suggestions)].slice(0, 8));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching movies:', error);
          // Fallback a sugerencias locales
          const suggestions = searchHistory.filter(term => 
            term.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchSuggestions(suggestions.slice(0, 8));
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // Debounce de 300ms
    } else {
      setSearchResults([]);
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchHistory]);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;
      
      const totalItems = searchResults.length + searchSuggestions.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev < totalItems - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev > 0 ? prev - 1 : totalItems - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestion >= 0) {
            if (selectedSuggestion < searchResults.length) {
              // Seleccionar película de resultados
              const movie = searchResults[selectedSuggestion];
              handleMovieSelect(movie);
            } else {
              // Seleccionar sugerencia de texto
              const suggestionIndex = selectedSuggestion - searchResults.length;
              const query = searchSuggestions[suggestionIndex];
              if (query.trim()) {
                handleSearch(query);
              }
            }
          } else if (searchQuery.trim()) {
            handleSearch(searchQuery);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, searchResults, searchSuggestions, selectedSuggestion, searchQuery]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (quickViewRef.current && !quickViewRef.current.contains(event.target as Node)) {
        setShowQuickView(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones principales mejoradas
  const handleSearch = (query: string) => {
    if (query.trim()) {
      const trimmedQuery = query.trim();
      
      // Añadir a historial (evitar duplicados)
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== trimmedQuery);
        return [trimmedQuery, ...filtered].slice(0, 5);
      });
      
      setSearchQuery(trimmedQuery);
      setShowSuggestions(false);
      
      // Mostrar notificación de búsqueda
      showSuccess('Búsqueda iniciada', `Buscando: "${trimmedQuery}"`);
      
      // Navegar a la página de búsqueda
      window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    setShowSuggestions(false);
    setSearchQuery('');
    
    if (onMovieSelect) {
      onMovieSelect(movie);
    } else {
      // Navegar a la página de la película con el slug
      const slug = movie.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '';
      window.location.href = `/movie/${movie.id}-${encodeURIComponent(slug)}`;
    }
  };

  const handleQuickView = (movie: Movie) => {
    setQuickViewMovie(movie);
    setShowQuickView(true);
  };

  const handleFavoriteClick = (movie: Movie) => {
    // Determinar si es una serie de TV basándose en el media_type o la presencia de name vs title
    const isTV = movie.media_type === 'tv' || (movie.name && !movie.title);
    
    if (isTV) {
      const isFavorite = isTVFavorite(movie.id);
      
      if (isFavorite) {
        removeTVFromFavorites(movie.id);
        showSuccess('Removido de favoritos', `${movie.name} se eliminó de tus favoritos de TV`);
      } else {
        addTVToFavorites(movie);
        showSuccess('Agregado a favoritos', `${movie.name} se agregó a tus favoritos de TV`);
      }
    } else {
      const isFavorite = isMovieFavorite(movie.id);
      
      if (isFavorite) {
        removeMovieFromFavorites(movie.id);
        showSuccess('Removido de favoritos', `${movie.title} se eliminó de tus favoritos`);
      } else {
        addMovieToFavorites(movie);
        showSuccess('Agregado a favoritos', `${movie.title} se agregó a tus favoritos`);
      }
    }
  };

  const handleShare = async (movie: Movie) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title || 'Película',
          text: `Mira ${movie.title} en CineGemini`,
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

  const handleAddToWatchlist = (movie: Movie) => {
    // Simular añadir a watchlist
    showSuccess('Añadido a Watchlist', `${movie.title} se agregó a tu lista de pendientes`);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    showSuccess('Historial limpiado', 'Se ha limpiado tu historial de búsqueda');
  };

  const currentMovie = featuredMovies[currentSlide];

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400 text-lg font-medium">Cargando CineGemini Premium</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative min-h-screen flex justify-center overflow-hidden bg-gray-900">
        {/* Fondo con patrón sutil */}
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-gray-800/10"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Contenido izquierdo */}
            <div className="text-center lg:text-left space-y-6 sm:space-y-8 lg:space-y-10">
              {/* Título principal */}
              <div className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none tracking-tight">
                    <span className="block text-blue-400 drop-shadow-lg">Cine</span>
                    <span className="block text-purple-400 drop-shadow-lg">Gemini</span>
                  </h1>
                  <div className="absolute inset-0 blur-3xl opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-400 rounded-full"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-purple-400 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light text-balance">
                  Descubre el universo cinematográfico con{' '}
                  <span className="text-blue-400 font-semibold">inteligencia artificial</span> avanzada.
                </p>
              </div>

              {/* Búsqueda inteligente avanzada */}
              <div className="max-w-lg mx-auto lg:mx-0" ref={searchRef}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(searchQuery);
                  }}
                  className="relative group"
                >
                  <div className={`relative transition-all duration-300 ${showSuggestions ? 'scale-102' : ''}`}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar películas, series, actores..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full px-6 py-4 sm:py-5 bg-gray-800/40 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800/60 transition-all duration-300 text-base sm:text-lg shadow-lg pr-16"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 group-hover:scale-105 shadow-md"
                      >
                        {isSearching ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiSearch className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sugerencias inteligentes mejoradas */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                      {/* Resultados de películas en tiempo real */}
                      {searchResults.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-700/50 border-b border-gray-600/50 flex items-center gap-2">
                            <FiSearch className="h-4 w-4 text-green-400" />
                            Películas encontradas
                          </div>
                          {searchResults.map((movie, index) => (
                            <Link
                              key={movie.id}
                              href={`/movie/${movie.id}-${encodeURIComponent(movie.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '')}`}
                              className={`w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-3 ${
                                index === selectedSuggestion ? 'bg-gray-700/50 text-white' : ''
                              }`}
                            >
                              <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : '/placeholder-movie.webp'}
                                  alt={movie.title || 'Película'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">{movie.title}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  <span>{movie.release_date?.split('-')[0]}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <FiStar className="h-3 w-3 text-yellow-400" />
                                    <span>{movie.vote_average?.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Ayuda */}
                      <div className="p-3 border-t border-gray-700/50">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>↑↓ Navegar • Enter Seleccionar</span>
                          <span>ESC Cerrar</span>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

            </div>

            {/* Contenido derecho - Slider premium */}
            <div className="relative">
              {currentMovie && (
                <div className="relative group">
                  {/* Película destacada */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 group-hover:scale-105">
                    <Image
                      src={currentMovie.backdrop_path ? `https://image.tmdb.org/t/p/w500${currentMovie.backdrop_path}` : 
                           currentMovie.poster_path ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` : 
                           '/placeholder-movie.webp'}
                      alt={currentMovie.title || 'Película'}
                      width={600}
                      height={400}
                      className="w-full h-72 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px] object-cover"
                    />
                    
                    {/* Overlay premium */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                    
                    {/* Información de la película */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-yellow-400/30">
                          <FiStar className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                          <span className="text-white font-bold text-base sm:text-lg">{currentMovie.vote_average?.toFixed(1)}</span>
                        </div>
                        <div className="bg-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-400/30">
                          <span className="text-white text-sm sm:text-base font-bold">#{currentSlide + 1}</span>
                        </div>
                        <div className="bg-purple-500/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-purple-400/30">
                          <span className="text-white text-sm sm:text-base font-bold">
                            {currentMovie.release_date?.split('-')[0]}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3 sm:mb-4 line-clamp-2 leading-tight">
                        {currentMovie.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm sm:text-base line-clamp-3 mb-4 sm:mb-6 leading-relaxed">
                        {currentMovie.overview}
                      </p>
                      
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                          href={`/movie/${currentMovie.id}-${encodeURIComponent(currentMovie.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '')}`}
                          className="flex items-center gap-2 sm:gap-3 bg-gray-800/20 backdrop-blur-sm hover:bg-gray-800/30 text-white px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base font-semibold border border-gray-700/50"
                        >
                          <FiPlay className="h-5 w-5 sm:h-6 sm:w-6" />
                          Ver Detalles
                        </Link>
                        
                        <button 
                          onClick={() => handleFavoriteClick(currentMovie)}
                          className={`p-3 sm:p-4 backdrop-blur-sm text-white rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700/50 ${
                            isMovieFavorite(currentMovie.id) 
                              ? 'bg-red-500/80 hover:bg-red-600/80' 
                              : 'bg-gray-800/20 hover:bg-gray-800/30'
                          }`}
                        >
                          <FiHeart className={`h-5 w-5 sm:h-6 sm:w-6 ${isMovieFavorite(currentMovie.id) ? 'fill-current' : ''}`} />
                        </button>

                        <button 
                          onClick={() => handleShare(currentMovie)}
                          className="p-3 sm:p-4 bg-gray-800/20 backdrop-blur-sm hover:bg-gray-800/30 text-white rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700/50"
                        >
                          <FiShare2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* Controles del slider */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 p-3 sm:p-4 bg-black/50 backdrop-blur-sm text-white rounded-2xl hover:bg-black/70 transition-all duration-300 shadow-lg"
                  >
                    {isPlaying ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-l-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiPlay className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>

                  {/* Control de audio */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-4 sm:top-6 right-16 sm:right-20 p-3 sm:p-4 bg-black/50 backdrop-blur-sm text-white rounded-2xl hover:bg-black/70 transition-all duration-300 shadow-lg"
                  >
                    {isMuted ? (
                      <FiVolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <FiVolume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de scroll */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 sm:w-8 sm:h-12 border-2 border-gray-600 rounded-full flex justify-center">
              <div className="w-1 h-3 sm:h-4 bg-gray-400 rounded-full mt-2 sm:mt-3 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Vista rápida modal */}
        {showQuickView && quickViewMovie && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
              ref={quickViewRef}
              className="bg-gray-800/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{quickViewMovie.title}</h2>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
                    <Image
                      src={quickViewMovie.poster_path ? `https://image.tmdb.org/t/p/w500${quickViewMovie.poster_path}` : '/placeholder-movie.webp'}
                      alt={quickViewMovie.title || 'Película'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2 space-y-4">
                  <p className="text-gray-300 leading-relaxed">{quickViewMovie.overview}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-xl">
                      <FiStar className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-bold">{quickViewMovie.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-2 rounded-xl">
                      <FiEye className="h-4 w-4 text-blue-400" />
                      <span className="text-white">{quickViewMovie.popularity?.toFixed(0)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300">
                      <FiPlay className="h-4 w-4" />
                      Ver Ahora {quickViewMovie.title}
                    </button>
                    <button 
                      onClick={() => handleFavoriteClick(quickViewMovie)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        isMovieFavorite(quickViewMovie.id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      <FiHeart className={`h-4 w-4 ${isMovieFavorite(quickViewMovie.id) ? 'fill-current' : ''}`} />
                      {isMovieFavorite(quickViewMovie.id) ? 'En Favoritos' : 'Añadir a Favoritos'}
                    </button>
                    <button 
                      onClick={() => handleAddToWatchlist(quickViewMovie)}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
                    >
                      <FiBookmark className="h-4 w-4" />
                      Watchlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
} 