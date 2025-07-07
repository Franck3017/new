import { useState, useEffect, useCallback } from 'react';
import { getPopularPeople, searchPeople } from "@/lib/api";
import { Person } from "@/types";
import { useNotifications } from "@/components/Notification";

export interface PeoplePageState {
  people: Person[];
  loading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  viewMode: 'grid' | 'list';
  isInitialLoad: boolean;
  filteredPeople: Person[];
  sortBy: 'popularity' | 'name' | 'known_for';
  filterStats: {
    totalPeople: number;
    averagePopularity: number;
    departments: string[];
    knownFor: string[];
  };
  isFilterExpanded: boolean;
  searchHistory: string[];
  isPaginationLoading: boolean;
  lastPageChange: number;
}

export interface PeoplePageActions {
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: 'popularity' | 'name' | 'known_for') => void;
  setIsFilterExpanded: (expanded: boolean) => void;
  changePage: (newPage: number) => void;
  handleSearch: (query: string) => void;
  clearSearch: () => void;
  applySearchFromHistory: (query: string) => void;
  jumpToPage: (jump: number) => void;
  refreshCurrentSearch: () => Promise<void>;
  handleFormSubmit: (e: React.FormEvent) => void;
}

export const usePeoplePage = (): [PeoplePageState, PeoplePageActions] => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estados para funcionalidades premium
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'known_for'>('popularity');
  const [filterStats, setFilterStats] = useState<{
    totalPeople: number;
    averagePopularity: number;
    departments: string[];
    knownFor: string[];
  }>({ totalPeople: 0, averagePopularity: 0, departments: [], knownFor: [] });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Estados para mejorar UX de paginación
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [lastPageChange, setLastPageChange] = useState<number>(0);

  const { showSuccess, showError } = useNotifications();

  // Función para ordenar personas
  const sortPeople = (peopleList: Person[], sortType: typeof sortBy) => {
    const sorted = [...peopleList];
    
    switch (sortType) {
      case 'popularity':
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'known_for':
        return sorted.sort((a, b) => {
          const knownForA = a.known_for_department || '';
          const knownForB = b.known_for_department || '';
          return knownForA.localeCompare(knownForB);
        });
      default:
        return sorted;
    }
  };

  // Función para calcular estadísticas
  const calculateStats = (peopleList: Person[]) => {
    if (peopleList.length === 0) {
      return { totalPeople: 0, averagePopularity: 0, departments: [], knownFor: [] };
    }

    const popularities = peopleList.map(person => person.popularity || 0).filter(pop => pop > 0);
    const averagePopularity = popularities.length > 0 ? popularities.reduce((a, b) => a + b, 0) / popularities.length : 0;
    
    const departments = Array.from(new Set(peopleList.map(person => person.known_for_department).filter(dept => dept)));
    const knownFor = Array.from(new Set(peopleList.flatMap(person => 
      person.known_for?.map(work => work.media_type || '') || []
    ).filter(type => type)));

    return {
      totalPeople: peopleList.length,
      averagePopularity: Math.round(averagePopularity * 10) / 10,
      departments: departments as string[],
      knownFor: knownFor as string[]
    };
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);
      let data;
      
      if (searchQuery.trim()) {
        data = await searchPeople(searchQuery, currentPage);
      } else {
        data = await getPopularPeople(currentPage);
      }
      
      const sortedPeople = sortPeople(data.results, sortBy);
      setPeople(sortedPeople);
      setFilteredPeople(sortedPeople);
      setTotalPages(data.total_pages);
      
      // Calcular estadísticas
      const stats = calculateStats(sortedPeople);
      setFilterStats(stats);
      
      if (searchQuery.trim() && !isInitialLoad) {
        showSuccess('Búsqueda completada', `Se encontraron ${data.results.length} resultados`);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
      showError('Error al cargar personas', 'Inténtalo de nuevo más tarde');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Función de búsqueda mejorada con debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Guardar en historial si es una nueva búsqueda
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => {
        const newHistory = [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 5);
        return newHistory;
      });
    }
  }, [searchHistory]);

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Función para aplicar búsqueda desde historial
  const applySearchFromHistory = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Función para cambiar página con mejor UX
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage || loading) {
      return;
    }
    
    setIsPaginationLoading(true);
    setLastPageChange(Date.now());
    setCurrentPage(newPage);
    
    // Scroll suave hacia arriba
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Función para saltar páginas rápidamente
  const jumpToPage = (jump: number) => {
    const targetPage = Math.min(totalPages, Math.max(1, currentPage + jump));
    changePage(targetPage);
  };

  // Función para refrescar con indicador visual
  const refreshCurrentSearch = async () => {
    setIsPaginationLoading(true);
    try {
      await fetchPeople();
      showSuccess('Actualizado', 'Los datos se han actualizado correctamente');
    } catch (error) {
      showError('Error al actualizar', 'No se pudieron actualizar los datos');
    } finally {
      setIsPaginationLoading(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPeople();
  };

  useEffect(() => {
    fetchPeople();
  }, [currentPage, searchQuery]);

  // Efecto para actualizar ordenamiento cuando cambie
  useEffect(() => {
    if (people.length > 0) {
      const sorted = sortPeople(people, sortBy);
      setFilteredPeople(sorted);
      const stats = calculateStats(sorted);
      setFilterStats(stats);
    }
  }, [sortBy, people]);

  // Efecto para manejar estados de carga de paginación
  useEffect(() => {
    if (loading) {
      setIsPaginationLoading(false);
    }
  }, [loading]);

  const state: PeoplePageState = {
    people,
    loading,
    searchQuery,
    currentPage,
    totalPages,
    viewMode,
    isInitialLoad,
    filteredPeople,
    sortBy,
    filterStats,
    isFilterExpanded,
    searchHistory,
    isPaginationLoading,
    lastPageChange
  };

  const actions: PeoplePageActions = {
    setSearchQuery,
    setCurrentPage,
    setViewMode,
    setSortBy,
    setIsFilterExpanded,
    changePage,
    handleSearch,
    clearSearch,
    applySearchFromHistory,
    jumpToPage,
    refreshCurrentSearch,
    handleFormSubmit
  };

  return [state, actions];
}; 