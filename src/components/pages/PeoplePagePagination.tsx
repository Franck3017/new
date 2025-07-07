import { FiArrowLeft } from "react-icons/fi";
import { PeoplePageState, PeoplePageActions } from "@/hooks/usePeoplePage";

interface PeoplePagePaginationProps {
  state: PeoplePageState;
  actions: PeoplePageActions;
}

export const PeoplePagePagination: React.FC<PeoplePagePaginationProps> = ({ state, actions }) => {
  const { 
    currentPage, 
    totalPages, 
    filteredPeople, 
    loading, 
    isPaginationLoading, 
    lastPageChange 
  } = state;

  const { changePage, jumpToPage } = actions;

  // Función para obtener páginas visibles de manera inteligente
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica inteligente para mostrar páginas relevantes
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Ajustar si estamos cerca del final
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-6 mt-8 pt-6 border-t border-gray-700/50">
      {/* Información de paginación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">{filteredPeople.length}</span> personas • 
            Página <span className="font-medium text-white">{currentPage}</span> de <span className="font-medium text-white">{totalPages}</span>
          </div>
          
          {/* Indicador de progreso */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round((currentPage / totalPages) * 100)}%
            </span>
          </div>
        </div>

        {/* Controles rápidos */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-xs bg-gray-600/20 text-gray-400 rounded border border-gray-600/30 hover:bg-gray-600/30 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="Ir a la primera página"
          >
            <FiArrowLeft className="h-3 w-3" />
            Primera
          </button>
          <button
            onClick={() => changePage(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 text-xs bg-gray-600/20 text-gray-400 rounded border border-gray-600/30 hover:bg-gray-600/30 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="Ir a la última página"
          >
            Última
            <FiArrowLeft className="h-3 w-3 rotate-180" />
          </button>
        </div>
      </div>

      {/* Controles principales de paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Botón Anterior */}
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 group"
          aria-label="Página anterior"
        >
          <FiArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        
        {/* Números de página */}
        <div className="flex items-center gap-1">
          {/* Página 1 si no está visible */}
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button
                onClick={() => changePage(1)}
                disabled={loading}
                className="px-3 py-2 rounded-lg transition-colors duration-300 bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 disabled:opacity-50"
                aria-label="Ir a página 1"
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {/* Páginas visibles */}
          {getVisiblePages().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => changePage(pageNum)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                currentPage === pageNum
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Ir a página ${pageNum}`}
              aria-current={currentPage === pageNum ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          {/* Última página si no está visible */}
          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => changePage(totalPages)}
                disabled={loading}
                className="px-3 py-2 rounded-lg transition-colors duration-300 bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 disabled:opacity-50"
                aria-label={`Ir a página ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        {/* Botón Siguiente */}
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 group"
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <FiArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Navegación por teclado y saltos rápidos */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-700/30">
        {/* Saltos rápidos */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Saltos rápidos:</span>
          <div className="flex gap-1">
            {[5, 10, 25, 50].map((jump) => {
              const targetPage = Math.min(totalPages, currentPage + jump);
              if (targetPage <= currentPage) return null;
              
              return (
                <button
                  key={jump}
                  onClick={() => jumpToPage(jump)}
                  disabled={loading || targetPage > totalPages}
                  className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-300 disabled:opacity-50"
                  title={`Saltar ${jump} páginas`}
                >
                  +{jump}
                </button>
              );
            })}
          </div>
        </div>

        {/* Información de navegación */}
        <div className="text-xs text-gray-500 text-center sm:text-left">
          <span>Usa ← → para navegar • Home/End para primera/última página</span>
        </div>
      </div>

      {/* Estado de carga para paginación */}
      {(loading || isPaginationLoading) && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">
            {isPaginationLoading ? `Cambiando a página ${currentPage}...` : 'Cargando página...'}
          </span>
        </div>
      )}

      {/* Información de tiempo de cambio */}
      {lastPageChange > 0 && (
        <div className="text-center text-xs text-gray-500">
          Último cambio: {new Date(lastPageChange).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}; 