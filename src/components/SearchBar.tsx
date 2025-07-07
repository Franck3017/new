'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    year: '',
    genre: '',
    rating: '',
    sortBy: 'relevance'
  });
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Debounce optimizado para la query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // Reducido de 500ms a 300ms para mejor respuesta

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Función para actualizar historial
  const updateHistory = useCallback((newQuery: string) => {
    setSearchHistory(prevHistory => {
      const newHistory = [newQuery, ...prevHistory.filter(item => item !== newQuery)].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Efecto para manejar la búsqueda con debounced query
  useEffect(() => {
    if (debouncedQuery) {
      updateHistory(debouncedQuery);
      
      const params = new URLSearchParams();
      params.set('query', debouncedQuery.trim());
      if (filters.year) params.set('year', filters.year);
      if (filters.genre) params.set('genre', filters.genre);
      if (filters.rating) params.set('rating', filters.rating);
      if (filters.sortBy) params.set('sort', filters.sortBy);
      
      router.push(`/search?${params.toString()}`);
    }
  }, [debouncedQuery, filters, router]);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      updateHistory(query.trim());
      
      const params = new URLSearchParams();
      params.set('query', query.trim());
      if (filters.year) params.set('year', filters.year);
      if (filters.genre) params.set('genre', filters.genre);
      if (filters.rating) params.set('rating', filters.rating);
      if (filters.sortBy) params.set('sort', filters.sortBy);
      
      router.push(`/search?${params.toString()}`);
      setShowHistory(false);
    }
  }, [query, filters, router, updateHistory]);

  const handleHistoryClick = useCallback((historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

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
            className="w-full p-4 pr-20 pl-12 text-white bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400"
        />
          
          {/* Icono de búsqueda */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch className="h-5 w-5" />
          </div>

          {/* Botones de acción */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Botón de filtros */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
              aria-label="Mostrar filtros"
            >
              <FiFilter className="h-4 w-4" />
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
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Año</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Cualquier año</option>
                  {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Género</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
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
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
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
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="popularity">Popularidad</option>
                  <option value="rating">Rating</option>
                  <option value="date">Fecha</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Historial de búsquedas */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FiClock className="h-4 w-4" />
                Búsquedas recientes
              </h3>
              <button
                type="button"
                onClick={clearHistory}
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
                  onClick={() => handleHistoryClick(item)}
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
          onClick={() => {
            setShowFilters(false);
            setShowHistory(false);
          }}
        />
      )}
    </div>
  );
};

export default SearchBar;
