import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryControls } from '@/components/category/CategoryControls';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CategoryControls', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    viewMode: 'grid' as const,
    onViewModeChange: jest.fn(),
    sortBy: 'popularity' as const,
    onSortByChange: jest.fn(),
    sortOrder: 'desc' as const,
    onSortOrderChange: jest.fn(),
    categoryTitle: 'Películas',
    totalMovies: 100,
    filteredCount: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders search input with correct placeholder', () => {
    render(<CategoryControls {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar en películas...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', () => {
    render(<CategoryControls {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar en películas...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when search query exists', () => {
    render(<CategoryControls {...defaultProps} searchQuery="test" />);
    
    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    expect(clearButton).toBeInTheDocument();
  });

  it('calls onSearchChange with empty string when clear button is clicked', () => {
    render(<CategoryControls {...defaultProps} searchQuery="test" />);
    
    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    fireEvent.click(clearButton);
    
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
  });

  it('shows search history when input is focused and history exists', async () => {
    const mockHistory = ['película 1', 'película 2'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
    
    render(<CategoryControls {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar en películas...');
    fireEvent.focus(searchInput);
    
    await waitFor(() => {
      expect(screen.getByText('Búsquedas recientes:')).toBeInTheDocument();
      expect(screen.getByText('película 1')).toBeInTheDocument();
      expect(screen.getByText('película 2')).toBeInTheDocument();
    });
  });

  it('shows filtered results count when search is active', () => {
    render(
      <CategoryControls 
        {...defaultProps} 
        searchQuery="test"
        totalMovies={100}
        filteredCount={25}
      />
    );
    
    expect(screen.getByText('25 de 100 resultados')).toBeInTheDocument();
  });

  it('shows no results message when search returns no results', () => {
    render(
      <CategoryControls 
        {...defaultProps} 
        searchQuery="test"
        totalMovies={100}
        filteredCount={0}
      />
    );
    
    expect(screen.getByText(/No se encontraron resultados para/)).toBeInTheDocument();
  });

  it('saves search query to history when form is submitted', () => {
    render(<CategoryControls {...defaultProps} searchQuery="new search" />);
    
    const searchInput = screen.getByPlaceholderText('Buscar en películas...');
    fireEvent.submit(searchInput);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'search-history-películas',
      JSON.stringify(['new search'])
    );
  });

  it('changes view mode when grid button is clicked', () => {
    render(<CategoryControls {...defaultProps} viewMode="list" />);
    
    const gridButton = screen.getByLabelText('Vista de cuadrícula');
    fireEvent.click(gridButton);
    
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('grid');
  });

  it('changes view mode when list button is clicked', () => {
    render(<CategoryControls {...defaultProps} viewMode="grid" />);
    
    const listButton = screen.getByLabelText('Vista de lista');
    fireEvent.click(listButton);
    
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('changes sort order when sort order button is clicked', () => {
    render(<CategoryControls {...defaultProps} sortOrder="asc" />);
    
    const sortOrderButton = screen.getByLabelText('Ordenar descendente');
    fireEvent.click(sortOrderButton);
    
    expect(defaultProps.onSortOrderChange).toHaveBeenCalledWith('desc');
  });

  it('changes sort by when select value changes', () => {
    render(<CategoryControls {...defaultProps} />);
    
    const sortSelect = screen.getByLabelText('Ordenar por');
    fireEvent.change(sortSelect, { target: { value: 'rating' } });
    
    expect(defaultProps.onSortByChange).toHaveBeenCalledWith('rating');
  });
}); 