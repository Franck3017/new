import { FiGrid, FiList, FiChevronUp, FiChevronDown, FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface CategoryControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: 'popularity' | 'rating' | 'date';
  onSortByChange: (sort: 'popularity' | 'rating' | 'date') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  categoryTitle: string;
  totalMovies?: number;
  filteredCount?: number;
}

export const CategoryControls = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  categoryTitle,
  totalMovies = 0,
  filteredCount = 0
}: CategoryControlsProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Cargar historial de búsqueda desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`search-history-${categoryTitle.toLowerCase()}`);
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, [categoryTitle]);

  // Guardar búsqueda en historial
  const saveToHistory = (query: string) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 4)]; // Mantener solo 5 elementos
      setSearchHistory(newHistory);
      localStorage.setItem(`search-history-${categoryTitle.toLowerCase()}`, JSON.stringify(newHistory));
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
    }
    setIsSearchFocused(false);
  };

  const handleSearchSuggestion = (suggestion: string) => {
    onSearchChange(suggestion);
    saveToHistory(suggestion);
    setIsSearchFocused(false);
  };

  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchHistory = isSearchFocused && searchHistory.length > 0 && !hasSearchQuery;
  const isFiltered = hasSearchQuery && totalMovies > 0 && filteredCount !== totalMovies;

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Búsqueda mejorada */}
      <div className="flex-1">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder={`Buscar en ${categoryTitle.toLowerCase()}...`}
            className="w-full p-3 pl-10 pr-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400"
            aria-label={`Buscar en ${categoryTitle}`}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          
          {/* Botón para limpiar búsqueda */}
          {hasSearchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Limpiar búsqueda"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}

          {/* Historial de búsqueda */}
          {showSearchHistory && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs text-gray-400 mb-2 px-2">Búsquedas recientes:</div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearchSuggestion(item)}
                    className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
                  >
                    <FiSearch className="h-3 w-3 text-gray-500" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
        
        {/* Indicadores de búsqueda mejorados */}
        <div className="mt-2 flex items-center gap-4 text-sm">
          {hasSearchQuery && (
            <div className="text-blue-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Buscando: &quot;{searchQuery}&quot;</span>
            </div>
          )}
          
          {isFiltered && (
            <div className="text-green-400 flex items-center gap-2">
              <FiFilter className="h-3 w-3" />
              <span>{filteredCount} de {totalMovies} resultados</span>
            </div>
          )}
          
          {hasSearchQuery && filteredCount === 0 && (
            <div className="text-yellow-400 flex items-center gap-2">
              <span>No se encontraron resultados para &quot;{searchQuery}&quot;</span>
            </div>
          )}
        </div>
      </div>

      {/* Controles de vista y ordenamiento */}
      <div className="flex items-center gap-4">
        {/* Modo de vista */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Vista de cuadrícula"
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Vista de lista"
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Ordenar por"
          >
            <option value="popularity">Popularidad</option>
            <option value="rating">Calificación</option>
            <option value="date">Fecha</option>
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
          >
            {sortOrder === 'asc' ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}; 