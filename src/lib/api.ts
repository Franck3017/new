import { MoviesResponse, Movie, CreditsResponse, VideosResponse } from "@/types";
import { config, getApiKey, getImageUrl } from "./config";
import { movieCache, genreCache, personCache, searchCache } from "./cache";

// Función para construir URLs con parámetros
const buildUrl = (endpoint: string, params: Record<string, any> = {}) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key no configurada');
  }
  
  const url = new URL(`${config.tmdb.baseUrl}${endpoint}`);
  
  // Agregar API key
  url.searchParams.append('api_key', apiKey);
  
  // Agregar otros parámetros
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value.toString());
    }
  });
  
  return url.toString();
};

// Función para hacer peticiones a la API con cache
const fetchFromAPI = async (endpoint: string, params: Record<string, any> = {}, cacheInstance?: any) => {
  const url = buildUrl(endpoint, params);
  
  // Verificar cache si se proporciona una instancia
  if (cacheInstance) {
    const cached = cacheInstance.get(endpoint, params);
    if (cached) {
      console.log(`Cache hit for ${endpoint}`);
      return cached;
    }
  }

  try {
    console.log(`Fetching from TMDB API: ${endpoint}`);
    
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      if (response.status === 401) {
        throw new Error('API key inválida. Por favor, verifica tu configuración.');
      } else if (response.status === 404) {
        throw new Error('Recurso no encontrado.');
      } else if (response.status === 429) {
        throw new Error('Demasiadas peticiones. Inténtalo de nuevo más tarde.');
      } else {
        throw new Error(`Error de API: ${response.status} - ${errorText}`);
      }
    }
    
    // Verificar si la respuesta tiene contenido
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON Parse Error:', jsonError);
      console.error('Response Text:', responseText);
      throw new Error('Respuesta del servidor no es un JSON válido');
    }
    
    // Guardar en cache si se proporciona una instancia
    if (cacheInstance) {
      cacheInstance.set(endpoint, params, data);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching from TMDB API:', error);
    console.error('URL:', url);
    
    // Manejar diferentes tipos de errores
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    if (error.name === 'AbortError') {
      throw new Error('La petición tardó demasiado tiempo. Inténtalo de nuevo.');
    }
    
    if (error.message && error.message.includes('JSON')) {
      throw new Error('Error al procesar la respuesta del servidor.');
    }
    
    throw error;
  }
};

// Películas populares
export const getPopularMovies = async (page: number = 1) => {
  return fetchFromAPI('/movie/popular', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Películas en cartelera
export const getNowPlayingMovies = async (page: number = 1) => {
  return fetchFromAPI('/movie/now_playing', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Películas mejor valoradas
export const getTopRatedMovies = async (page: number = 1) => {
  return fetchFromAPI('/movie/top_rated', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Películas próximas
export const getUpcomingMovies = async (page: number = 1) => {
  return fetchFromAPI('/movie/upcoming', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Detalles de una película
export const getMovieDetails = async (movieId: string) => {
  return fetchFromAPI(`/movie/${movieId}`, { 
    language: config.ui.defaultLanguage,
    append_to_response: 'credits,videos,similar,recommendations'
  }, movieCache);
};

// Créditos de una película
export const getMovieCredits = async (movieId: string) => {
  return fetchFromAPI(`/movie/${movieId}/credits`, { language: config.ui.defaultLanguage }, movieCache);
};

// Videos de una película
export const getMovieVideos = async (movieId: string) => {
  return fetchFromAPI(`/movie/${movieId}/videos`, { language: config.ui.defaultLanguage }, movieCache);
};

// Películas similares
export const getSimilarMovies = async (movieId: string, page: number = 1) => {
  return fetchFromAPI(`/movie/${movieId}/similar`, { page, language: config.ui.defaultLanguage }, movieCache);
};

// Películas recomendadas
export const getRecommendedMovies = async (movieId: string, page: number = 1) => {
  return fetchFromAPI(`/movie/${movieId}/recommendations`, { page, language: config.ui.defaultLanguage }, movieCache);
};

// Búsqueda de películas
export const searchMovies = async (query: string, page: number = 1) => {
  return fetchFromAPI('/search/movie', { 
    query, 
    page, 
    language: config.ui.defaultLanguage,
    include_adult: false
  }, searchCache);
};

// Búsqueda de personas
export const searchPeople = async (query: string, page: number = 1) => {
  return fetchFromAPI('/search/person', { 
    query, 
    page, 
    language: config.ui.defaultLanguage,
    include_adult: false
  }, searchCache);
};

// Detalles de una persona
export const getPersonDetails = async (personId: string) => {
  return fetchFromAPI(`/person/${personId}`, { 
    language: config.ui.defaultLanguage,
    append_to_response: 'external_ids,images'
  }, personCache);
};

// Créditos de una persona
export const getPersonCredits = async (personId: string) => {
  return fetchFromAPI(`/person/${personId}/combined_credits`, { language: config.ui.defaultLanguage }, personCache);
};

// Imágenes de una persona
export const getPersonImages = async (personId: string) => {
  return fetchFromAPI(`/person/${personId}/images`, {}, personCache);
};

// Películas por género
export const getMoviesByGenre = async (genreId: string, page: number = 1) => {
  return fetchFromAPI('/discover/movie', { 
    with_genres: genreId,
    page,
    language: config.ui.defaultLanguage,
    sort_by: 'popularity.desc'
  }, genreCache);
};

// Géneros de películas
export const getMovieGenres = async () => {
  return fetchFromAPI('/genre/movie/list', { language: config.ui.defaultLanguage }, genreCache);
};

// Personas populares
export const getPopularPeople = async (page: number = 1) => {
  return fetchFromAPI('/person/popular', { page, language: config.ui.defaultLanguage }, personCache);
};

// Configuración de la API (para imágenes)
export const getAPIConfiguration = async () => {
  return fetchFromAPI('/configuration', {}, movieCache);
};

// Función para verificar la API key
export const verifyAPIKey = async () => {
  try {
    const response = await fetchFromAPI('/authentication', {}, null);
    return { valid: true, data: response };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
};

// ===== FUNCIONES PARA SERIES DE TV =====

// Series populares
export const getPopularTVShows = async (page: number = 1) => {
  return fetchFromAPI('/tv/popular', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Series mejor valoradas
export const getTopRatedTVShows = async (page: number = 1) => {
  return fetchFromAPI('/tv/top_rated', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Series en emisión
export const getOnAirTVShows = async (page: number = 1) => {
  return fetchFromAPI('/tv/on_the_air', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Series que se emiten hoy
export const getAiringTodayTVShows = async (page: number = 1) => {
  return fetchFromAPI('/tv/airing_today', { page, language: config.ui.defaultLanguage }, movieCache);
};

// Detalles de una serie de TV
export const getTVShowDetails = async (tvId: string) => {
  return fetchFromAPI(`/tv/${tvId}`, { 
    language: config.ui.defaultLanguage,
    append_to_response: 'credits,videos,similar,recommendations'
  }, movieCache);
};

// Créditos de una serie de TV
export const getTVShowCredits = async (tvId: string) => {
  return fetchFromAPI(`/tv/${tvId}/credits`, { language: config.ui.defaultLanguage }, movieCache);
};

// Videos de una serie de TV
export const getTVShowVideos = async (tvId: string) => {
  return fetchFromAPI(`/tv/${tvId}/videos`, { language: config.ui.defaultLanguage }, movieCache);
};

// Series similares
export const getSimilarTVShows = async (tvId: string, page: number = 1) => {
  return fetchFromAPI(`/tv/${tvId}/similar`, { page, language: config.ui.defaultLanguage }, movieCache);
};

// Series recomendadas
export const getRecommendedTVShows = async (tvId: string, page: number = 1) => {
  return fetchFromAPI(`/tv/${tvId}/recommendations`, { page, language: config.ui.defaultLanguage }, movieCache);
};

// Series por género
export const getTVShowsByGenre = async (genreId: string, page: number = 1) => {
  return fetchFromAPI('/discover/tv', { 
    with_genres: genreId,
    page,
    language: config.ui.defaultLanguage,
    sort_by: 'popularity.desc'
  }, genreCache);
};

// Géneros de series de TV
export const getTVGenres = async () => {
  return fetchFromAPI('/genre/tv/list', { language: config.ui.defaultLanguage }, genreCache);
};

// Búsqueda de series
export const searchTVShows = async (query: string, page: number = 1) => {
  return fetchFromAPI('/search/tv', { 
    query, 
    page, 
    language: config.ui.defaultLanguage,
    include_adult: false
  }, searchCache);
};

// Exportar funciones de utilidad
export { getImageUrl, getApiKey, config };
