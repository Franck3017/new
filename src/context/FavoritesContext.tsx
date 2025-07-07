'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Movie, Person } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FavoriteMovie extends Movie {
  addedAt: string;
  note?: string;
}

interface FavoriteTV extends Movie {
  addedAt: string;
  note?: string;
}

interface FavoritePerson extends Person {
  addedAt: string;
  note?: string;
}

interface FavoritesContextType {
  favoriteMovies: FavoriteMovie[];
  favoriteTV: FavoriteTV[];
  favoritePeople: FavoritePerson[];
  addMovieToFavorites: (movie: Movie, note?: string) => void;
  addTVToFavorites: (tv: Movie, note?: string) => void;
  addPersonToFavorites: (person: Person, note?: string) => void;
  removeMovieFromFavorites: (movieId: number) => void;
  removeTVFromFavorites: (tvId: number) => void;
  removePersonFromFavorites: (personId: number) => void;
  isMovieFavorite: (movieId: number) => boolean;
  isTVFavorite: (tvId: number) => boolean;
  isPersonFavorite: (personId: number) => boolean;
  moviesCount: number;
  tvCount: number;
  peopleCount: number;
  totalFavoritesCount: number;
  clearAllFavorites: () => void;
  clearMovieFavorites: () => void;
  clearTVFavorites: () => void;
  clearPeopleFavorites: () => void;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favoriteMovies, setFavoriteMovies, moviesLoaded] = useLocalStorage<FavoriteMovie[]>('favoriteMovies', []);
  const [favoriteTV, setFavoriteTV, tvLoaded] = useLocalStorage<FavoriteTV[]>('favoriteTV', []);
  const [favoritePeople, setFavoritePeople, peopleLoaded] = useLocalStorage<FavoritePerson[]>('favoritePeople', []);
  
  const isLoaded = moviesLoaded && tvLoaded && peopleLoaded;

  const addMovieToFavorites = (movie: Movie, note?: string) => {
    setFavoriteMovies((prev: FavoriteMovie[]) => {
      // Verificar si ya existe
      const exists = prev.find((fav: FavoriteMovie) => fav.id === movie.id);
      if (exists) {
        return prev; // Ya existe, no hacer nada
      }

      const newFavorite: FavoriteMovie = {
        ...movie,
        addedAt: new Date().toISOString(),
        note
      };

      return [...prev, newFavorite];
    });
  };

  const addTVToFavorites = (tv: Movie, note?: string) => {
    setFavoriteTV((prev: FavoriteTV[]) => {
      // Verificar si ya existe
      const exists = prev.find((fav: FavoriteTV) => fav.id === tv.id);
      if (exists) {
        return prev; // Ya existe, no hacer nada
      }

      const newFavorite: FavoriteTV = {
        ...tv,
        addedAt: new Date().toISOString(),
        note
      };

      return [...prev, newFavorite];
    });
  };

  const addPersonToFavorites = (person: Person, note?: string) => {
    setFavoritePeople((prev: FavoritePerson[]) => {
      // Verificar si ya existe
      const exists = prev.find((fav: FavoritePerson) => fav.id === person.id);
      if (exists) {
        return prev; // Ya existe, no hacer nada
      }

      const newFavorite: FavoritePerson = {
        ...person,
        addedAt: new Date().toISOString(),
        note
      };

      return [...prev, newFavorite];
    });
  };

  const removeMovieFromFavorites = (movieId: number) => {
    setFavoriteMovies((prev: FavoriteMovie[]) => prev.filter((fav: FavoriteMovie) => fav.id !== movieId));
  };

  const removeTVFromFavorites = (tvId: number) => {
    setFavoriteTV((prev: FavoriteTV[]) => prev.filter((fav: FavoriteTV) => fav.id !== tvId));
  };

  const removePersonFromFavorites = (personId: number) => {
    setFavoritePeople((prev: FavoritePerson[]) => prev.filter((fav: FavoritePerson) => fav.id !== personId));
  };

  const isMovieFavorite = (movieId: number) => {
    return favoriteMovies.some(fav => fav.id === movieId);
  };

  const isTVFavorite = (tvId: number) => {
    return favoriteTV.some(fav => fav.id === tvId);
  };

  const isPersonFavorite = (personId: number) => {
    return favoritePeople.some(fav => fav.id === personId);
  };

  const clearAllFavorites = () => {
    setFavoriteMovies([]);
    setFavoriteTV([]);
    setFavoritePeople([]);
  };

  const clearMovieFavorites = () => {
    setFavoriteMovies([]);
  };

  const clearTVFavorites = () => {
    setFavoriteTV([]);
  };

  const clearPeopleFavorites = () => {
    setFavoritePeople([]);
  };

  const value: FavoritesContextType = {
    favoriteMovies,
    favoriteTV,
    favoritePeople,
    addMovieToFavorites,
    addTVToFavorites,
    addPersonToFavorites,
    removeMovieFromFavorites,
    removeTVFromFavorites,
    removePersonFromFavorites,
    isMovieFavorite,
    isTVFavorite,
    isPersonFavorite,
    moviesCount: favoriteMovies.length,
    tvCount: favoriteTV.length,
    peopleCount: favoritePeople.length,
    totalFavoritesCount: favoriteMovies.length + favoriteTV.length + favoritePeople.length,
    clearAllFavorites,
    clearMovieFavorites,
    clearTVFavorites,
    clearPeopleFavorites,
    isLoaded,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 