import { FiGrid, FiList, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';

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
  categoryTitle
}: CategoryControlsProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Búsqueda */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Buscar en ${categoryTitle.toLowerCase()}...`}
            className="w-full p-3 pl-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
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
          >
            <option value="popularity">Popularidad</option>
            <option value="rating">Calificación</option>
            <option value="date">Fecha</option>
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {sortOrder === 'asc' ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}; 