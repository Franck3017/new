// Géneros de películas
import {
  FiZap, FiMap, FiSmile, FiFilm, FiUser, FiFeather, FiBookOpen, FiAlertTriangle, FiMusic,
  FiEye, FiHeart, FiCpu, FiTv, FiAlertCircle, FiShield, FiFlag, FiSun, FiStar
} from 'react-icons/fi';

export const MOVIE_GENRES = [
  { id: 28, name: 'Acción', color: 'from-red-600 to-orange-500', icon: FiZap, bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { id: 12, name: 'Aventura', color: 'from-green-600 to-blue-400', icon: FiMap, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 16, name: 'Animación', color: 'from-pink-500 to-yellow-400', icon: FiSmile, bg: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80' },
  { id: 35, name: 'Comedia', color: 'from-yellow-400 to-pink-500', icon: FiSmile, bg: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80' },
  { id: 80, name: 'Crimen', color: 'from-gray-700 to-gray-900', icon: FiAlertTriangle, bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
  { id: 99, name: 'Documental', color: 'from-blue-800 to-green-400', icon: FiBookOpen, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 18, name: 'Drama', color: 'from-purple-700 to-pink-700', icon: FiUser, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 10751, name: 'Familiar', color: 'from-yellow-300 to-green-300', icon: FiFeather, bg: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80' },
  { id: 14, name: 'Fantasía', color: 'from-indigo-500 to-purple-500', icon: FiStar, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 36, name: 'Historia', color: 'from-yellow-800 to-yellow-500', icon: FiBookOpen, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 27, name: 'Terror', color: 'from-gray-900 to-black', icon: FiAlertCircle, bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { id: 10402, name: 'Música', color: 'from-pink-400 to-purple-400', icon: FiMusic, bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { id: 9648, name: 'Misterio', color: 'from-gray-700 to-blue-900', icon: FiEye, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 10749, name: 'Romance', color: 'from-pink-500 to-red-400', icon: FiHeart, bg: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80' },
  { id: 878, name: 'Ciencia ficción', color: 'from-blue-500 to-cyan-400', icon: FiCpu, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 10770, name: 'Película de TV', color: 'from-green-400 to-blue-400', icon: FiTv, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 53, name: 'Suspense', color: 'from-gray-700 to-gray-900', icon: FiShield, bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { id: 10752, name: 'Guerra', color: 'from-yellow-900 to-gray-700', icon: FiFlag, bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
  { id: 37, name: 'Western', color: 'from-yellow-700 to-yellow-400', icon: FiSun, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' }
] as const;

// Función para obtener el nombre del género por ID
export const getGenreName = (id: number): string => {
  const genre = MOVIE_GENRES.find(g => g.id === id);
  return genre?.name || 'Desconocido';
};

// Función para obtener múltiples géneros por IDs
export const getGenreNames = (ids: number[]): string[] => {
  return ids.map(id => getGenreName(id));
};

// Función para obtener géneros como string separado por comas
export const getGenreString = (ids: number[]): string => {
  return getGenreNames(ids).join(', ');
};

// Géneros de series de TV
export const TV_GENRES = [
  { id: 10759, name: 'Acción y Aventura', color: 'from-red-600 to-orange-500', icon: FiZap, bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { id: 16, name: 'Animación', color: 'from-pink-500 to-yellow-400', icon: FiSmile, bg: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80' },
  { id: 35, name: 'Comedia', color: 'from-yellow-400 to-pink-500', icon: FiSmile, bg: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80' },
  { id: 80, name: 'Crimen', color: 'from-gray-700 to-gray-900', icon: FiAlertTriangle, bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
  { id: 99, name: 'Documental', color: 'from-blue-800 to-green-400', icon: FiBookOpen, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 18, name: 'Drama', color: 'from-purple-700 to-pink-700', icon: FiUser, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 10751, name: 'Familiar', color: 'from-yellow-300 to-green-300', icon: FiFeather, bg: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80' },
  { id: 10762, name: 'Kids', color: 'from-green-400 to-blue-400', icon: FiFeather, bg: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80' },
  { id: 9648, name: 'Misterio', color: 'from-gray-700 to-blue-900', icon: FiEye, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 10763, name: 'News', color: 'from-blue-600 to-blue-800', icon: FiBookOpen, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 10764, name: 'Reality', color: 'from-pink-400 to-purple-400', icon: FiTv, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 10765, name: 'Sci-Fi & Fantasy', color: 'from-indigo-500 to-purple-500', icon: FiStar, bg: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 10766, name: 'Soap', color: 'from-pink-500 to-red-400', icon: FiHeart, bg: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80' },
  { id: 10767, name: 'Talk', color: 'from-yellow-600 to-orange-500', icon: FiUser, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
  { id: 10768, name: 'War & Politics', color: 'from-yellow-900 to-gray-700', icon: FiFlag, bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
  { id: 37, name: 'Western', color: 'from-yellow-700 to-yellow-400', icon: FiSun, bg: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' }
] as const;

// Función para obtener el nombre del género de TV por ID
export const getTVGenreName = (id: number): string => {
  const genre = TV_GENRES.find(g => g.id === id);
  return genre?.name || 'Desconocido';
};

// Función para obtener múltiples géneros de TV por IDs
export const getTVGenreNames = (ids: number[]): string[] => {
  return ids.map(id => getTVGenreName(id));
};

// Función para obtener géneros de TV como string separado por comas
export const getTVGenreString = (ids: number[]): string => {
  return getTVGenreNames(ids).join(', ');
}; 