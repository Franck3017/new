'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiSliders } from 'react-icons/fi';
import { ROUTES } from '@/utils/urlHelpers';

interface SearchFilters {
  year: string;
  genre: string;
  rating: string;
  sortBy: string;
  includeAdult: boolean;
}

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Estado del componente
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    year: '',
    genre: '',
    rating: '',
    sortBy: 'relevance',
    includeAdult: false
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Cargar estado inicial desde URL
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    const urlYear = searchParams.get('year') || '';
    const urlGenre = searchParams.get('genre') || '';
    const urlRating = searchParams.get('rating') || '';
    const urlSortBy = searchParams.get('sort') || 'relevance';
    const urlIncludeAdult = searchParams.get('include_adult') === 'true';

    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
    setFilters({
      year: urlYear,
      genre: urlGenre,
      rating: urlRating,
      sortBy: urlSortBy,
      includeAdult: urlIncludeAdult
    });
  }, [searchParams]);

  // Calcular filtros activos
  useEffect(() => {
    const activeCount = Object.values(filters).filter(value => 
      value !== '' && value !== 'relevance' && value !== false
    ).length;
    setActiveFiltersCount(activeCount);
  }, [filters]);

  // Cargar historial desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Error parsing search history:', error);
          localStorage.removeItem('searchHistory');
        }
      }
    }
  }, []);

  // Debounce optimizado para la query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Función para actualizar historial
  const updateHistory = useCallback((newQuery: string) => {
    if (!newQuery.trim()) return;
    
    setSearchHistory(prevHistory => {
      const newHistory = [newQuery, ...prevHistory.filter(item => item !== newQuery)].slice(0, 8);
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
      return newHistory;
    });
  }, []);

  // Función para construir URL con parámetros
  const buildSearchUrl = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim());
    }
    
    if (searchFilters.year) params.set('year', searchFilters.year);
    if (searchFilters.genre) params.set('genre', searchFilters.genre);
    if (searchFilters.rating) params.set('rating', searchFilters.rating);
    if (searchFilters.sortBy && searchFilters.sortBy !== 'relevance') params.set('sort', searchFilters.sortBy);
    if (searchFilters.includeAdult) params.set('include_adult', 'true');
    
    const queryString = params.toString();
    return queryString ? `${ROUTES.SEARCH}?${queryString}` : ROUTES.SEARCH;
  }, []);

  // Efecto para manejar la búsqueda con debounced query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      updateHistory(debouncedQuery);
      const searchUrl = buildSearchUrl(debouncedQuery, filters);
      router.push(searchUrl);
    }
  }, [debouncedQuery, filters, router, updateHistory, buildSearchUrl]);

  // Función para manejar búsqueda manual
  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      updateHistory(query.trim());
      const searchUrl = buildSearchUrl(query, filters);
      router.push(searchUrl);
      setShowHistory(false);
    }
  }, [query, filters, router, updateHistory, buildSearchUrl]);

  // Función para manejar cambio de filtros
  const handleFilterChange = useCallback((filterKey: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  // Función para manejar clic en elementos del filtro sin cerrar el panel
  const handleFilterClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      year: '',
      genre: '',
      rating: '',
      sortBy: 'relevance',
      includeAdult: false
    });
  }, []);

  // Función para aplicar filtros
  const applyFilters = useCallback(() => {
    if (query.trim()) {
      const searchUrl = buildSearchUrl(query, filters);
      router.push(searchUrl);
      setShowFilters(false);
    }
  }, [query, filters, router, buildSearchUrl]);

  // Función para manejar click en historial
  const handleHistoryClick = useCallback((historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
  }, []);

  // Función para limpiar historial
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('searchHistory');
    }
  }, []);

  // Función para cerrar dropdowns
  const closeDropdowns = useCallback(() => {
    setShowFilters(false);
    setShowHistory(false);
  }, []);

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar si el clic fue dentro del componente SearchBar
      if (inputRef.current && inputRef.current.contains(target)) {
        return; // No cerrar si el clic fue dentro del input
      }
      
      // Verificar si el clic fue dentro del panel de filtros
      const filtersPanel = document.querySelector('[data-filters-panel]');
      if (filtersPanel && filtersPanel.contains(target)) {
        return; // No cerrar si el clic fue dentro del panel de filtros
      }
      
      // Verificar si el clic fue dentro del panel de historial
      const historyPanel = document.querySelector('[data-history-panel]');
      if (historyPanel && historyPanel.contains(target)) {
        return; // No cerrar si el clic fue dentro del panel de historial
      }
      
      // Si no fue dentro de ninguno de los paneles, cerrar
      closeDropdowns();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdowns]);

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSearch} className="relative" role="search">
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">Buscar películas</label>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="Buscar películas, actores, géneros..."
            className="w-full p-4 pr-24 pl-12 text-white bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400"
          />

          {/* Icono de búsqueda */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch className="h-5 w-5" />
          </div>

          {/* Botones de acción */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Botón de filtros con indicador */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFilters(!showFilters);
              }}
              className={`relative p-2 rounded-lg transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-500 text-white'
                  : activeFiltersCount > 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
              aria-label="Mostrar filtros"
            >
              <FiSliders className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Botón de búsqueda */}
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              aria-label="Buscar"
            >
              <FiSearch className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div 
            data-filters-panel 
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Año</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  onClick={handleFilterClick}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Cualquier año</option>
                  {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Género</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  onClick={handleFilterClick}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Cualquier género</option>
                  <option value="28">Acción</option>
                  <option value="12">Aventura</option>
                  <option value="16">Animación</option>
                  <option value="35">Comedia</option>
                  <option value="80">Crimen</option>
                  <option value="99">Documental</option>
                  <option value="18">Drama</option>
                  <option value="10751">Familiar</option>
                  <option value="14">Fantasía</option>
                  <option value="36">Historia</option>
                  <option value="27">Terror</option>
                  <option value="10402">Música</option>
                  <option value="9648">Misterio</option>
                  <option value="10749">Romance</option>
                  <option value="878">Ciencia ficción</option>
                  <option value="10770">Película de TV</option>
                  <option value="53">Suspense</option>
                  <option value="10752">Guerra</option>
                  <option value="37">Western</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rating mínimo</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  onClick={handleFilterClick}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Cualquier rating</option>
                  <option value="9">9+</option>
                  <option value="8">8+</option>
                  <option value="7">7+</option>
                  <option value="6">6+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  onClick={handleFilterClick}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="popularity.desc">Popularidad</option>
                  <option value="vote_average.desc">Rating</option>
                  <option value="release_date.desc">Fecha</option>
                  <option value="title.asc">Título A-Z</option>
                </select>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="mt-4 pt-4 border-t border-gray-600/50">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.includeAdult}
                    onChange={(e) => handleFilterChange('includeAdult', e.target.checked)}
                    onClick={handleFilterClick}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  Incluir contenido para adultos
                </label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyFilters();
                    }}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial de búsquedas */}
        {showHistory && searchHistory.length > 0 && (
          <div 
            data-history-panel 
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FiClock className="h-4 w-4" />
                Búsquedas recientes
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
                className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                aria-label="Limpiar historial"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHistoryClick(item);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <FiTrendingUp className="h-4 w-4 text-gray-500" />
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Overlay para cerrar filtros/historial */}
      {(showFilters || showHistory) && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdowns}
        />
      )}
    </div>
  );
};

export default SearchBar;
