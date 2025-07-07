'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import { useNotifications } from '@/components/Notification';
import { useFavorites } from '@/context/FavoritesContext';
import { ContainerLayout } from '@/components/layout/PageLayout';
import { 
  FiHeart, 
  FiTrash2, 
  FiFilter, 
  FiGrid, 
  FiList,
  FiSearch,
  FiStar,
  FiCalendar,
  FiTrendingUp,
  FiTv
} from 'react-icons/fi';
import Image from 'next/image';

export default function TVFavoritesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'rating' | 'year'>('added');
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { notifications, showSuccess, showError } = useNotifications();
  const { favoriteTV, removeTVFromFavorites, clearTVFavorites } = useFavorites();

  // Mostrar toast de bienvenida solo en la primera carga
  useEffect(() => {
    if (!isInitialLoad && favoriteTV.length > 0) {
      showSuccess(
        'Favoritos de TV cargados', 
        `Tienes ${favoriteTV.length} serie${favoriteTV.length !== 1 ? 's' : ''} en favoritos`
      );
    } else if (!isInitialLoad && favoriteTV.length === 0) {
      showSuccess(
        'Sin favoritos de TV', 
        'Aún no tienes series en favoritos. ¡Explora y agrega algunas!'
      );
    }
  }, [favoriteTV.length, isInitialLoad, showSuccess]);

  // Eliminar de favoritos
  const handleRemoveFromFavorites = (tvId: number) => {
    try {
      removeTVFromFavorites(tvId);
      
      const tv = favoriteTV.find(t => t.id === tvId);
      showSuccess(
        'Eliminado de favoritos', 
        `${tv?.name || 'Serie'} se eliminó de tus favoritos`
      );
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showError('Error', 'No se pudo eliminar de favoritos');
    }
  };

  // Limpiar todos los favoritos
  const clearAllFavorites = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los favoritos de TV?')) {
      try {
        clearTVFavorites();
        showSuccess('Favoritos de TV limpiados', 'Se eliminaron todos los favoritos de TV');
      } catch (error) {
        console.error('Error clearing favorites:', error);
        showError('Error', 'No se pudieron eliminar todos los favoritos de TV');
      }
    }
  };

  // Filtrar y ordenar favoritos
  const filteredAndSortedFavorites = favoriteTV
    .filter(tv => {
      const matchesSearch = tv.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = !filterGenre || tv.genres?.some(genre => genre.id === parseInt(filterGenre));
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.name?.localeCompare(b.name || '') || 0;
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'year':
          return (b.first_air_date || '').localeCompare(a.first_air_date || '');
        case 'added':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  // Obtener géneros únicos de los favoritos
  const uniqueGenres = Array.from(
    new Set(
      favoriteTV.flatMap(tv => tv.genres?.map((genre: any) => genre.id) || [])
    )
  ).sort();

  // No necesitamos loading state ya que los favoritos se cargan desde el contexto

  return (
    <ContainerLayout>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FiTv className="h-8 w-8 text-purple-400" />
          Mis Series Favoritas
        </h1>
        <p className="text-gray-400">
          {favoriteTV.length > 0 
            ? `${favoriteTV.length} serie${favoriteTV.length !== 1 ? 's' : ''} guardada${favoriteTV.length !== 1 ? 's' : ''}`
            : 'Aún no tienes series favoritas'
          }
        </p>
      </div>

      {/* Controles */}
      {favoriteTV.length > 0 && (
        <div className="mb-8 space-y-4">
          {/* Barra de búsqueda y controles principales */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar en favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Controles de vista y filtros */}
            <div className="flex items-center gap-2">
              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  showFilters 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <FiFilter className="h-4 w-4" />
              </button>

              {/* Cambiar vista */}
              <div className="flex bg-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiList className="h-4 w-4" />
                </button>
              </div>

              {/* Limpiar todos */}
              <button
                onClick={clearAllFavorites}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                title="Eliminar todos los favoritos de TV"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filtros avanzados */}
          {showFilters && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="added">Fecha de agregado</option>
                    <option value="title">Título</option>
                    <option value="rating">Rating</option>
                    <option value="year">Año</option>
                  </select>
                </div>

                {/* Filtrar por género */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Todos los géneros</option>
                    {uniqueGenres.map(genreId => (
                      <option key={genreId} value={genreId}>
                        Género {genreId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {favoriteTV.length === 0 ? (
        <div className="text-center py-16">
          <FiTv className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No tienes series favoritas</h3>
          <p className="text-gray-400 mb-6">
            Explora series y agrega tus favoritas haciendo clic en el corazón
          </p>
          <a
            href="/tv"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            <FiTrendingUp className="h-4 w-4" />
            Explorar Series
          </a>
        </div>
      ) : filteredAndSortedFavorites.length === 0 ? (
        <div className="text-center py-16">
          <FiSearch className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-400">
            No hay series que coincidan con tu búsqueda
          </p>
        </div>
      ) : (
        <div>
          {/* Información de resultados */}
          <div className="mb-6">
            <p className="text-gray-300">
              Mostrando {filteredAndSortedFavorites.length} de {favoriteTV.length} serie{filteredAndSortedFavorites.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid de series */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredAndSortedFavorites.map((tv, index) => (
                <div key={`${tv.id}-${index}`} className="relative group">
                  <MovieCard movie={tv} mediaType="tv" />
                </div>
              ))}
            </div>
          ) : (
            /* Vista de lista */
            <div className="space-y-4">
              {filteredAndSortedFavorites.map((tv, index) => (
                <div
                  key={`${tv.id}-${index}`}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Imagen */}
                    <div className="w-16 h-24 flex-shrink-0">
                      {tv.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${tv.poster_path}`}
                          alt={tv.name || ''}
                          className="w-full h-full object-cover rounded-lg"
                          width={100}
                          height={150}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                          <FiTv className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate group-hover:text-purple-400 transition-colors duration-200">
                        {tv.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {tv.first_air_date?.substring(0, 4)} • {tv.vote_average?.toFixed(1)} ⭐
                      </p>
                      <p className="text-gray-500 text-xs">
                        Agregado el {new Date(tv.addedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`/tv/${tv.id}`}
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors duration-200"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => handleRemoveFromFavorites(tv.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                        title="Eliminar de favoritos"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ContainerLayout>
  );
} 