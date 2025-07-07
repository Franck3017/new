'use client';

import { useState, useEffect, useCallback } from 'react';
import { MOVIE_GENRES } from '@/constants/genres';
import { 
  getMoviesByGenre, 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies 
} from '@/lib/api';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import HorizontalScroll from '@/components/HorizontalScroll';
// Notificaciones eliminadas
import { 
  FiFilm, 
  FiTrendingUp, 
  FiStar, 
  FiPlay, 
  FiCalendar,
  FiArrowLeft,
  FiChevronRight,
  FiSearch,
} from 'react-icons/fi';
import Link from 'next/link';

// Cache optimizado ya está en lib/cache.ts

export default function MoviesPage() {
  const [genreData, setGenreData] = useState<Record<number, Movie[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estados para funcionalidades premium
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [filteredGenres, setFilteredGenres] = useState(() => [...MOVIE_GENRES]);

  // Nuevos estados para filtros rápidos mejorados
  const [filteredContent, setFilteredContent] = useState<Movie[]>([]);
  const [filteredContentLoading, setFilteredContentLoading] = useState(false);
  const [showFilteredContent, setShowFilteredContent] = useState(false);
  
  // Estados adicionales para funcionalidades premium
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date' | 'name'>('popularity');
  const [filterStats, setFilterStats] = useState<{
    totalMovies: number;
    averageRating: number;
    genres: string[];
    years: number[];
  }>({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
  const [filterHistory, setFilterHistory] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Función para eliminar duplicados y procesar datos de películas
  const removeDuplicates = (movies: Movie[]): Movie[] => {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    }).map(movie => ({
      ...movie,
      media_type: 'movie' // Agregar el tipo de medio para que MovieCard sepa que es una película
    }));
  };

  // Función de búsqueda simplificada
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Función para filtros rápidos mejorada
  const handleQuickFilter = async (filter: string) => {
    setQuickFilters(prev => {
      const newFilters = prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter];
      
      // Guardar en historial si es un nuevo filtro
      if (!prev.includes(filter)) {
        setFilterHistory(prevHistory => {
          const newHistory = [filter, ...prevHistory.filter(f => f !== filter)].slice(0, 5);
          return newHistory;
        });
      }
      
      // Si no hay filtros activos, mostrar contenido normal por géneros
      if (newFilters.length === 0) {
        setShowFilteredContent(false);
        setFilteredContent([]);
        setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
        return newFilters;
      }
      
      // Si hay filtros activos, cargar contenido filtrado
      loadFilteredContent(newFilters);
      return newFilters;
    });
  };

  // Función para aplicar filtro desde historial
  const applyFilterFromHistory = (filter: string) => {
    if (!quickFilters.includes(filter)) {
      handleQuickFilter(filter);
    }
  };

  // Función para ordenar contenido
  const sortContent = (content: Movie[], sortType: typeof sortBy) => {
    const sorted = [...content];
    
    switch (sortType) {
      case 'popularity':
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.release_date || '1900-01-01');
          const dateB = new Date(b.release_date || '1900-01-01');
          return dateB.getTime() - dateA.getTime();
        });
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = (a.title || '').toLowerCase();
          const nameB = (b.title || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      default:
        return sorted;
    }
  };

  // Función para calcular estadísticas del filtro
  const calculateFilterStats = (movies: Movie[]) => {
    if (movies.length === 0) {
      return { totalMovies: 0, averageRating: 0, genres: [], years: [] };
    }

    const ratings = movies.map(movie => movie.vote_average || 0).filter(rating => rating > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    // Usar genre_ids si existe, sino usar un array vacío
    const genres = Array.from(new Set(movies.flatMap(movie => (movie as any).genre_ids || [])));
    const years = Array.from(new Set(movies.map(movie => {
      const date = movie.release_date;
      return date ? new Date(date).getFullYear() : null;
    }).filter(year => year !== null))).sort((a, b) => b - a);

    return {
      totalMovies: movies.length,
      averageRating: Math.round(averageRating * 10) / 10,
      genres: genres.map(id => MOVIE_GENRES.find(g => g.id === id)?.name || '').filter(name => name),
      years: years as number[]
    };
  };

  // Función para cargar contenido filtrado mejorada
  const loadFilteredContent = async (filters: string[]) => {
    setFilteredContentLoading(true);
    setShowFilteredContent(true);
    
    try {
      const allMovies: Movie[] = [];
      
      // Cargar contenido para cada filtro activo
      for (const filter of filters) {
        let response;
        
        switch (filter) {
          case 'live':
            response = await getNowPlayingMovies(1);
            break;
          case 'rated':
            response = await getTopRatedMovies(1);
            break;
          case 'trending':
            response = await getPopularMovies(1);
            break;
          case 'new':
            response = await getUpcomingMovies(1);
            break;
          default:
            continue;
        }
        
        if (response?.results) {
          const movies = response.results.map((movie: any) => ({
            ...movie,
            media_type: 'movie'
          }));
          allMovies.push(...movies);
        }
      }
      
      // Eliminar duplicados y limitar a 30 películas para más opciones
      const uniqueMovies = removeDuplicates(allMovies).slice(0, 30);
      
      // Ordenar contenido según el criterio seleccionado
      const sortedMovies = sortContent(uniqueMovies, sortBy);
      
      // Calcular estadísticas
      const stats = calculateFilterStats(sortedMovies);
      
      setFilteredContent(sortedMovies);
      setFilterStats(stats);
      
    } catch (error) {
      console.error('Error loading filtered content:', error);
      setFilteredContent([]);
      setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
    } finally {
      setFilteredContentLoading(false);
    }
  };

  // Función para filtro de vista
  const handleViewFilter = (filter: string) => {
    setViewFilter(filter);
    // Aquí se podría implementar lógica adicional para filtrar el contenido
  };

  // Función para manejar favoritos (placeholder)
  const handleFavorites = () => {
    // Redirigir a la página de favoritos
    window.location.href = '/favorites';
  };

  // Cache optimizado ya está manejado en lib/api.ts

  // Función para cargar películas por género
  const fetchMoviesByGenre = async (genreId: number) => {
    // Verificar si ya se está cargando
    if (loading[genreId]) {
      return;
    }

    // Marcar como cargando
    setLoading(prev => ({ ...prev, [genreId]: true }));

    try {
      const response = await getMoviesByGenre(genreId.toString(), 1);
      const movies = removeDuplicates(response.results || []);
      
      setGenreData(prev => ({
        ...prev,
        [genreId]: movies
      }));
    } catch (error) {
      console.error(`Error fetching movies for genre ${genreId}:`, error);
      // Error toast eliminado
    } finally {
      setLoading(prev => ({ ...prev, [genreId]: false }));
    }
  };

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      // Cargar los primeros 8 géneros en paralelo
      const initialGenres = MOVIE_GENRES.slice(0, 8);
      const promises = initialGenres.map(genre => fetchMoviesByGenre(genre.id));
      await Promise.all(promises);

      // Cargar géneros restantes en segundo plano
      setTimeout(async () => {
        const remainingGenres = MOVIE_GENRES.slice(8);
        
        // Cargar en paralelo con límite de 3 a la vez
        for (let i = 0; i < remainingGenres.length; i += 3) {
          const batch = remainingGenres.slice(i, i + 3);
          const batchPromises = batch.map(genre => fetchMoviesByGenre(genre.id));
          await Promise.all(batchPromises);
        }
      }, 1000);

    } catch (error) {
      console.error('Error loading initial data:', error);
      // Toast eliminado
    } finally {
      setInitialLoading(false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredGenres(() => [...MOVIE_GENRES]);
        return;
      }

      const searchTerm = searchQuery.toLowerCase();
      const filtered = MOVIE_GENRES.filter(genre => 
        genre.name.toLowerCase().includes(searchTerm) ||
        // También buscar en las películas de cada género si están cargadas
        (genreData[genre.id] && genreData[genre.id].some(movie => 
          (movie.title || '').toLowerCase().includes(searchTerm)
        ))
      );
      setFilteredGenres(() => [...filtered]);
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, genreData]);

  // Efecto para actualizar ordenamiento cuando cambie
  useEffect(() => {
    if (filteredContent.length > 0) {
      const sorted = sortContent(filteredContent, sortBy);
      setFilteredContent(sorted);
    }
  }, [sortBy]);

  // Función para refrescar filtros actuales
  const refreshCurrentFilters = () => {
    if (quickFilters.length > 0) {
      loadFilteredContent(quickFilters);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="h-16 bg-gray-700 rounded-lg animate-pulse mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
          </div>
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        {/* Header Premium con Funcionalidades */}
        <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-b border-gray-700/50">
          {/* Contenido del header */}
          <div className="container mx-auto px-4 py-6 sm:py-8">
            {/* Navegación superior */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-4 sm:gap-6">
                <Link 
                  href="/"
                  className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm text-white rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
                >
                  <FiArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-medium text-sm sm:text-base">Inicio</span>
                </Link>
                
                {/* Breadcrumb premium */}
                <div className="hidden sm:flex items-center gap-2 text-gray-400">
                  <span className="text-sm">Inicio</span>
                  <FiChevronRight className="h-4 w-4" />
                  <span className="text-white font-medium text-sm">Películas</span>
                </div>
              </div>
              
              {/* Estadísticas premium */}
              <div className="flex sm:hidden lg:flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <FiFilm className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm text-white font-medium">{MOVIE_GENRES.length}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <FiTrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-xs sm:text-sm text-white font-medium">Trend</span>
                </div>
              </div>
            </div>

            {/* Título y controles premium */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-white/10">
                  <FiFilm className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Películas</h1>
                  <p className="text-gray-400 text-xs sm:text-sm">Explora por géneros y categorías</p>
                </div>
              </div>
              
              {/* Controles premium */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Búsqueda rápida */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar géneros o películas..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 pl-10 bg-white/5 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-400 text-sm sm:text-base"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Descripción y métricas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Descubre películas organizadas por géneros. Explora contenido premium, 
                  encuentra nuevas películas y mantente al día con las últimas tendencias del cine.
                </p>
              </div>
              
              {/* Métricas premium */}
              <div className="flex items-center justify-start lg:justify-end gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">{MOVIE_GENRES.length}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Géneros</div>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">∞</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Películas</div>
                </div>
              </div>
            </div>

            {/* Filtros rápidos premium mejorados */}
            <div className="flex flex-col gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700/50">
              {/* Filtros principales */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-400 font-medium">Filtros rápidos:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => handleQuickFilter('live')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition-all duration-300 ${
                      quickFilters.includes('live') 
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' 
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    <FiPlay className="inline h-3 w-3 mr-1" />
                    En Cines
                  </button>
                  <button 
                    onClick={() => handleQuickFilter('rated')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition-all duration-300 ${
                      quickFilters.includes('rated') 
                        ? 'bg-blue-500/30 text-blue-300 border-blue-500/50' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                    }`}
                  >
                    <FiStar className="inline h-3 w-3 mr-1" />
                    Mejor Valoradas
                  </button>
                  <button 
                    onClick={() => handleQuickFilter('trending')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition-all duration-300 ${
                      quickFilters.includes('trending') 
                        ? 'bg-purple-500/30 text-purple-300 border-purple-500/50' 
                        : 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30'
                    }`}
                  >
                    <FiTrendingUp className="inline h-3 w-3 mr-1" />
                    Tendencias
                  </button>
                  <button 
                    onClick={() => handleQuickFilter('new')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition-all duration-300 ${
                      quickFilters.includes('new') 
                        ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' 
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
                    }`}
                  >
                    <FiCalendar className="inline h-3 w-3 mr-1" />
                    Próximas
                  </button>
                </div>
                
                {/* Botón para expandir filtros avanzados */}
                <button 
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded border border-gray-600/30 hover:bg-gray-600/30 transition-colors duration-300 self-start sm:self-auto"
                >
                  {isFilterExpanded ? 'Ocultar' : 'Más filtros'}
                </button>
              </div>

              {/* Filtros avanzados expandibles */}
              {isFilterExpanded && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  {/* Ordenar por */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Ordenar por:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as typeof sortBy);
                        if (filteredContent.length > 0) {
                          const sorted = sortContent(filteredContent, e.target.value as typeof sortBy);
                          setFilteredContent(sorted);
                        }
                      }}
                      className="px-2 py-1 bg-gray-700/50 text-white text-xs rounded border border-gray-600/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    >
                      <option value="popularity">Popularidad</option>
                      <option value="rating">Calificación</option>
                      <option value="date">Fecha</option>
                      <option value="name">Nombre</option>
                    </select>
                  </div>

                  {/* Historial de filtros */}
                  {filterHistory.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Recientes:</span>
                      <div className="flex flex-wrap gap-1">
                        {filterHistory.slice(0, 3).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => applyFilterFromHistory(filter)}
                            className="px-2 py-1 bg-gray-600/20 text-gray-300 text-xs rounded border border-gray-600/30 hover:bg-gray-600/30 transition-colors duration-300"
                          >
                            {filter === 'live' ? 'En Cines' : 
                             filter === 'rated' ? 'Mejor Valoradas' : 
                             filter === 'trending' ? 'Tendencias' : 'Próximas'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de refrescar */}
                  {quickFilters.length > 0 && (
                    <button
                      onClick={refreshCurrentFilters}
                      disabled={filteredContentLoading}
                      className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded border border-emerald-600/30 hover:bg-emerald-600/30 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <FiTrendingUp className="h-3 w-3" />
                      {filteredContentLoading ? 'Actualizando...' : 'Refrescar'}
                    </button>
                  )}
                </div>
              )}
              
              {/* Indicador de filtros activos */}
              {(searchQuery || quickFilters.length > 0 || viewFilter !== 'all') && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                  <span className="text-xs text-gray-500">Filtros activos:</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {searchQuery && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">
                        Búsqueda: &quot;{searchQuery}&quot;
                      </span>
                    )}
                    {quickFilters.map(filter => (
                      <span key={filter} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                        {filter === 'live' ? 'En Cines' : 
                         filter === 'rated' ? 'Mejor Valoradas' : 
                         filter === 'trending' ? 'Tendencias' : 'Próximas'}
                      </span>
                    ))}
                    {viewFilter !== 'all' && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                        {viewFilter === 'popular' ? 'Populares' : 
                         viewFilter === 'recent' ? 'Recientes' : 'Mejor Valoradas'}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setQuickFilters([]);
                      setViewFilter('all');
                      setShowFilteredContent(false);
                      setFilteredContent([]);
                      setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
                    }}
                    className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded border border-gray-500/30 hover:bg-gray-500/30 transition-colors duration-300 self-start sm:self-auto"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-8">
          {/* Indicador de resultados de búsqueda */}
          {searchQuery && (
            <div className="mb-6 p-3 sm:p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  <span className="text-white font-medium text-sm sm:text-base">
                    Búsqueda: &quot;{searchQuery}&quot;
                  </span>
                  <span className="text-emerald-400 text-xs sm:text-sm">
                    {filteredGenres.length} {filteredGenres.length === 1 ? 'resultado' : 'resultados'} encontrado{filteredGenres.length === 1 ? '' : 's'}
                  </span>
                </div>
                <button 
                  onClick={() => handleSearch('')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm rounded transition-colors duration-300 self-start sm:self-auto"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Contenido filtrado por filtros rápidos */}
          {showFilteredContent && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                    <FiFilm className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {quickFilters.length === 1 
                        ? (quickFilters[0] === 'live' ? 'Películas en Cines' :
                           quickFilters[0] === 'rated' ? 'Películas Mejor Valoradas' :
                           quickFilters[0] === 'trending' ? 'Películas en Tendencia' :
                           'Películas Próximas')
                        : 'Películas Filtradas'
                      }
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {filterStats.totalMovies} películas • Calificación promedio: {filterStats.averageRating}/10
                      {filterStats.years.length > 0 && ` • ${filterStats.years[0]} - ${filterStats.years[filterStats.years.length - 1]}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Contador de resultados */}
                  <div className="px-3 py-1 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <span className="text-white text-sm font-medium">
                      {filteredContent.length} de {filterStats.totalMovies}
                    </span>
                  </div>
                  
                  {/* Botón para volver a géneros */}
                  <button 
                    onClick={() => {
                      setQuickFilters([]);
                      setShowFilteredContent(false);
                      setFilteredContent([]);
                      setFilterStats({ totalMovies: 0, averageRating: 0, genres: [], years: [] });
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-300 flex items-center gap-2"
                  >
                    <FiArrowLeft className="h-4 w-4" />
                    Ver géneros
                  </button>
                </div>
              </div>

              {/* Información adicional de filtros */}
              {filterStats.genres.length > 0 && (
                <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-400 text-sm">Géneros encontrados:</span>
                    {filterStats.genres.map((genre, index) => (
                      <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filteredContentLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <MovieCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredContent.length > 0 ? (
                <HorizontalScroll>
                  {filteredContent.map((movie, index) => (
                    <div key={`filtered-${movie.id}-${index}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
                      <MovieCard movie={movie} mediaType="movie" />
                    </div>
                  ))}
                </HorizontalScroll>
              ) : (
                <div className="text-center py-12">
                  <FiFilm className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No se encontraron películas</h3>
                  <p className="text-gray-400 mb-4">
                    No hay películas disponibles con los filtros seleccionados.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => {
                        setQuickFilters([]);
                        setShowFilteredContent(false);
                        setFilteredContent([]);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-300"
                    >
                      Ver géneros
                    </button>
                    <button 
                      onClick={() => {
                        setQuickFilters(['trending']);
                        loadFilteredContent(['trending']);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                    >
                      Ver tendencias
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contenido por géneros (solo si no hay filtros activos) */}
          {!showFilteredContent && (
            <>
              {filteredGenres.length === 0 ? (
                <div className="text-center py-16">
                  <FiFilm className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-400 mb-6">
                    {searchQuery ? (
                      <>
                        No se encontraron géneros o películas que coincidan con &quot;{searchQuery}&quot;.
                        <br />
                        <span className="text-sm">Intenta con otros términos de búsqueda.</span>
                      </>
                    ) : (
                      'No hay géneros disponibles en este momento.'
                    )}
                  </p>
                  {searchQuery && (
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => handleSearch('')}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-300"
                      >
                        Limpiar búsqueda
                      </button>
                      <button 
                        onClick={() => setFilteredGenres(() => [...MOVIE_GENRES])}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300"
                      >
                        Ver todos los géneros
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredGenres.map((genre) => {
                  const GenreIcon = genre.icon;
                  const movies = genreData[genre.id];
                  const isLoading = loading[genre.id];

                  return (
                    <section key={genre.id} className="mb-16">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <GenreIcon className="h-6 w-6 text-green-400" />
                          </div>
                          <h2 className="text-3xl font-bold text-white">{genre.name}</h2>
                        </div>
                        
                        <Link
                          href={`/genre/${genre.id}?type=movie`}
                          className="px-5 py-2 rounded-lg font-semibold transition-all duration-200 border border-transparent shadow-sm hover:scale-105 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-800/50"
                        >
                          Ver todas
                        </Link>
                      </div>

                      {/* Contenido del género */}
                      {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                          {Array.from({ length: 12 }).map((_, index) => (
                            <MovieCardSkeleton key={index} />
                          ))}
                        </div>
                      ) : movies && movies.length > 0 ? (
                        <HorizontalScroll>
                          {movies.map((movie, index) => (
                            <div key={`${genre.id}-${movie.id}-${index}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
                              <MovieCard movie={movie} mediaType="movie" />
                            </div>
                          ))}
                        </HorizontalScroll>
                      ) : (
                        <div className="text-center py-12">
                          <FiFilm className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">No hay películas disponibles en este género</p>
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      {/* Contenedor de notificaciones eliminado */}
    </>
  );
} 