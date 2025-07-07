'use client';

import { useState, useEffect } from 'react';
import { FiHeart, FiSearch, FiFilter, FiGrid, FiList, FiTrash2, FiUser } from 'react-icons/fi';
import { useNotifications } from '@/components/Notification';
import { useFavorites } from '@/context/FavoritesContext';
import PersonCard from '@/components/PersonCard';
import { ContainerLayout } from '@/components/layout/PageLayout';
import Image from 'next/image';

export default function PeopleFavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'added' | 'name' | 'popularity' | 'department'>('added');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Estado para mostrar toast de bienvenida solo en la primera carga

  const { notifications, showSuccess, showError } = useNotifications();
  const { favoritePeople, removePersonFromFavorites, clearPeopleFavorites } = useFavorites();

  // Mostrar toast de bienvenida solo en la primera carga
  useEffect(() => {
    if (!isInitialLoad && favoritePeople.length > 0) {
      showSuccess(
        'Favoritos cargados', 
        `Tienes ${favoritePeople.length} persona${favoritePeople.length !== 1 ? 's' : ''} en favoritos`
      );
    } else if (!isInitialLoad && favoritePeople.length === 0) {
      showSuccess(
        'Sin favoritos', 
        'Aún no tienes personas en favoritos. ¡Explora y agrega algunas!'
      );
    }
  }, [favoritePeople.length, isInitialLoad, showSuccess]);

  // Eliminar de favoritos
  const handleRemoveFromFavorites = (personId: number) => {
    try {
      removePersonFromFavorites(personId);
      
      const person = favoritePeople.find(p => p.id === personId);
      showSuccess(
        'Eliminado de favoritos', 
        `${person?.name || 'Persona'} se eliminó de tus favoritos`
      );
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showError('Error', 'No se pudo eliminar de favoritos');
    }
  };

  // Limpiar todos los favoritos
  const clearAllFavorites = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los favoritos de personas?')) {
      try {
        clearPeopleFavorites();
        showSuccess('Favoritos limpiados', 'Se eliminaron todos los favoritos de personas');
      } catch (error) {
        console.error('Error clearing favorites:', error);
        showError('Error', 'No se pudieron eliminar todos los favoritos');
      }
    }
  };

  // Filtrar y ordenar favoritos
  const filteredAndSortedFavorites = favoritePeople
    .filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = filterDepartment === 'all' || 
        person.known_for_department === filterDepartment;
      
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'department':
          return (a.known_for_department || '').localeCompare(b.known_for_department || '');
        case 'added':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  // Obtener departamentos únicos de los favoritos
  const uniqueDepartments = Array.from(
    new Set(
      favoritePeople.map(person => person.known_for_department).filter(Boolean)
    )
  ).sort();

  // No necesitamos loading state ya que los favoritos se cargan desde el contexto

  return (
    <ContainerLayout notifications={notifications} showNavbar={false}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FiHeart className="h-8 w-8 text-red-400" />
          Mis Personas Favoritas
        </h1>
        <p className="text-gray-400">
          {favoritePeople.length > 0 
            ? `${favoritePeople.length} persona${favoritePeople.length !== 1 ? 's' : ''} guardada${favoritePeople.length !== 1 ? 's' : ''}`
            : 'Aún no tienes personas favoritas'
          }
        </p>
      </div>

      {/* Controles */}
      {favoritePeople.length > 0 && (
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
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Controles de vista y filtros */}
            <div className="flex items-center gap-2">
              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-500 text-white' 
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
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
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
                title="Eliminar todos los favoritos"
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
                    className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="added">Fecha de agregado</option>
                    <option value="name">Nombre</option>
                    <option value="popularity">Popularidad</option>
                    <option value="department">Departamento</option>
                  </select>
                </div>

                {/* Filtrar por departamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Departamento</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">Todos los departamentos</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
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
      {favoritePeople.length === 0 ? (
        <div className="text-center py-16">
          <FiHeart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No tienes favoritos</h3>
          <p className="text-gray-400 mb-6">
            Explora personas y agrega tus favoritas haciendo clic en el corazón
          </p>
          <a
            href="/people"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <FiUser className="h-4 w-4" />
            Explorar Personas
          </a>
        </div>
      ) : filteredAndSortedFavorites.length === 0 ? (
        <div className="text-center py-16">
          <FiSearch className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-400">
            No hay personas que coincidan con tu búsqueda
          </p>
        </div>
      ) : (
        <div>
          {/* Información de resultados */}
          <div className="mb-6">
            <p className="text-gray-300">
              Mostrando {filteredAndSortedFavorites.length} de {favoritePeople.length} persona{filteredAndSortedFavorites.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid de personas */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredAndSortedFavorites.map((person, index) => (
                <div key={`${person.id}-${index}`} className="relative group">
                  <PersonCard person={person} viewMode="grid" />
                </div>
              ))}
            </div>
          ) : (
            /* Vista de lista */
            <div className="space-y-4">
              {filteredAndSortedFavorites.map((person, index) => (
                <div
                  key={`${person.id}-${index}`}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Imagen */}
                    <div className="w-16 h-24 flex-shrink-0">
                      {person.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-full object-cover rounded-lg"
                          width={100}
                          height={150}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                          <FiUser className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
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
                      {person.birthday && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(person.birthday).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {!person.deathday && ` (${new Date().getFullYear() - new Date(person.birthday).getFullYear()} años)`}
                        </p>
                      )}
                    </div>

                    {/* Botón de eliminar */}
                    <button
                      onClick={() => handleRemoveFromFavorites(person.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                      title="Eliminar de favoritos"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
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