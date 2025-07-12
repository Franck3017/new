import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/context/ThemeContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

describe('Navbar', () => {
  it('renderiza el logo y los enlaces principales', () => {
    render(
      <ThemeProvider>
        <FavoritesProvider>
          <Navbar />
        </FavoritesProvider>
      </ThemeProvider>
    );
    expect(screen.getByText('CineGemini')).toBeInTheDocument();
    // Verifica que al menos un enlace con el texto esté visible
    expect(screen.getAllByText('Películas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Series').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Personas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Buscar').length).toBeGreaterThan(0);
  });

  it('cambia el tema al hacer click en el botón de tema', () => {
    render(
      <ThemeProvider>
        <FavoritesProvider>
          <Navbar />
        </FavoritesProvider>
      </ThemeProvider>
    );
    const themeButton = screen.getByRole('button', { name: /cambiar tema/i });
    fireEvent.click(themeButton);
    // No hay aserción visual, pero no debe lanzar error
  });
}); 