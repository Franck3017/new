import Link from "next/link";
import { 
  FiArrowLeft,
  FiChevronRight,
  FiUser,
  FiTrendingUp,
  FiSearch,
  FiHeart
} from "react-icons/fi";
import { PeoplePageState, PeoplePageActions } from "@/hooks/usePeoplePage";

interface PeoplePageHeaderProps {
  state: PeoplePageState;
  actions: PeoplePageActions;
}

export const PeoplePageHeader: React.FC<PeoplePageHeaderProps> = ({ state, actions }) => {
  const { filterStats, searchQuery } = state;
  const { handleSearch, handleFormSubmit } = actions;

  return (
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
              <span className="text-white font-medium text-sm">Personas</span>
            </div>
          </div>
          
          {/* Estadísticas premium */}
          <div className="flex sm:hidden lg:flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <FiUser className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
              <span className="text-xs sm:text-sm text-white font-medium">{filterStats.totalPeople}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <FiTrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              <span className="text-xs sm:text-sm text-white font-medium">Populares</span>
            </div>
          </div>
        </div>

        {/* Título y controles premium */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-white/10">
              <FiUser className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Personas</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Explora actores, directores y personal</p>
            </div>
          </div>
          
          {/* Controles premium */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Búsqueda rápida */}
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar actores, directores..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 bg-white/5 backdrop-blur-sm text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-400 text-sm sm:text-base"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
            
          </div>
        </div>

        {/* Descripción y métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Descubre actores, directores y personal del mundo del entretenimiento. 
              Explora perfiles detallados, filmografías y biografías de las personas más populares.
            </p>
          </div>
          
          {/* Métricas premium */}
          <div className="flex items-center justify-start lg:justify-end gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-white">{filterStats.totalPeople}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Personas</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-white">{filterStats.averagePopularity}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Popularidad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 