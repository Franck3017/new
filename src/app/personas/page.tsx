'use client';

import { FiUser } from "react-icons/fi";
import { useNotifications, NotificationContainer } from "@/components/Notification";
import PersonCard from "@/components/PersonCard";
import { usePeoplePage } from "@/hooks/usePeoplePage";
import { PeoplePageHeader } from "@/components/pages/PeoplePageHeader";
import { PeoplePageFilters } from "@/components/pages/PeoplePageFilters";
import { PeoplePagePagination } from "@/components/pages/PeoplePagePagination";

export default function PeoplePage() {
  const [state, actions] = usePeoplePage();
  const { notifications } = useNotifications();

  const { 
    loading, 
    filteredPeople, 
    searchQuery, 
    viewMode 
  } = state;

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        {/* Header Premium con Funcionalidades */}
        <PeoplePageHeader state={state} actions={actions} />

        {/* Filtros y controles */}
        <div className="container mx-auto px-4">
          <PeoplePageFilters state={state} actions={actions} />
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando personas...</p>
              </div>
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-800/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FiUser className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
              <p className="text-gray-400 mb-4">Intenta con otros términos de búsqueda</p>
              {searchQuery.trim() && (
                <button
                  onClick={() => {
                    actions.setSearchQuery('');
                    actions.setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-600/30 hover:bg-emerald-600/30 transition-colors duration-300"
                >
                  Mostrar todas las personas
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid/List de personas */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
                : "space-y-4"
              }>
                {filteredPeople.map((person) => (
                  <PersonCard 
                    key={person.id} 
                    person={person} 
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Paginación mejorada */}
              <PeoplePagePagination state={state} actions={actions} />
            </>
          )}
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />
    </>
  );
} 