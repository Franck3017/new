import { 
  FiGrid,
  FiList,
  FiTrendingUp,
  FiStar,
  FiUser,
  FiClock
} from "react-icons/fi";
import { PeoplePageState, PeoplePageActions } from "@/hooks/usePeoplePage";

interface PeoplePageFiltersProps {
  state: PeoplePageState;
  actions: PeoplePageActions;
}

export const PeoplePageFilters: React.FC<PeoplePageFiltersProps> = ({ state, actions }) => {
  const { 
    viewMode, 
    isFilterExpanded, 
    sortBy, 
    searchHistory, 
    filteredPeople, 
    filterStats,
    loading,
    isPaginationLoading,
    lastPageChange
  } = state;

  const { 
    setViewMode, 
    setIsFilterExpanded, 
    setSortBy, 
    applySearchFromHistory, 
    refreshCurrentSearch 
  } = actions;

  return (
    <div className="flex flex-col gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700/50">
      {/* Controles principales */}
      <div className="flex flex-row sm:items-center gap-3 sm:gap-4">
        <span className="text-xs sm:text-sm text-gray-400 font-medium">Vista:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              viewMode === 'grid' 
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
            }`}
          >
            <FiGrid className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Cuadrícula</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              viewMode === 'list' 
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
            }`}
          >
            <FiList className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Lista</span>
          </button>
        </div>
        
        {/* Botón para expandir filtros avanzados */}
        <button 
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded border border-gray-600/30 hover:bg-gray-600/30 transition-colors duration-300 self-start sm:self-auto"
        >
          {isFilterExpanded ? 'Ocultar' : 'Más opciones'}
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
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2 py-1 bg-gray-700/50 text-white text-xs rounded border border-gray-600/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="popularity">Popularidad</option>
              <option value="name">Nombre</option>
              <option value="known_for">Departamento</option>
            </select>
          </div>

          {/* Historial de búsquedas */}
          {searchHistory.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Recientes:</span>
              <div className="flex flex-wrap gap-1">
                {searchHistory.slice(0, 3).map((query) => (
                  <button
                    key={query}
                    onClick={() => applySearchFromHistory(query)}
                    className="px-2 py-1 bg-gray-600/20 text-gray-300 text-xs rounded border border-gray-600/30 hover:bg-gray-600/30 transition-colors duration-300"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón de refrescar */}
          <button
            onClick={refreshCurrentSearch}
            disabled={loading || isPaginationLoading}
            className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded border border-emerald-600/30 hover:bg-emerald-600/30 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isPaginationLoading ? (
              <>
                <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                Actualizando...
              </>
            ) : (
              <>
                <FiTrendingUp className="h-3 w-3" />
                Refrescar
              </>
            )}
          </button>

          {/* Información de tiempo de búsqueda */}
          {lastPageChange > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiClock className="h-3 w-3" />
              Última búsqueda: {new Date(lastPageChange).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Información de resultados */}
      {filteredPeople.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-purple-400" />
            <span className="text-white text-sm font-medium">{filteredPeople.length} personas</span>
          </div>
          <div className="flex items-center gap-2">
            <FiStar className="h-4 w-4 text-yellow-400" />
            <span className="text-white text-sm">Popularidad: {filterStats.averagePopularity}</span>
          </div>
          {filterStats.departments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Departamentos:</span>
              <div className="flex flex-wrap gap-1">
                {filterStats.departments.slice(0, 3).map((dept, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded">
                    {dept}
                  </span>
                ))}
                {filterStats.departments.length > 3 && (
                  <span className="text-gray-400 text-xs">+{filterStats.departments.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 