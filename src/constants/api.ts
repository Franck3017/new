// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || 'tu-api-key-aqui',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  IMAGE_SIZES: {
    POSTER: {
      SMALL: 'w185',
      MEDIUM: 'w342',
      LARGE: 'w500',
      ORIGINAL: 'original'
    },
    BACKDROP: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280',
      ORIGINAL: 'original'
    },
    PROFILE: {
      SMALL: 'w45',
      MEDIUM: 'w185',
      LARGE: 'h632',
      ORIGINAL: 'original'
    }
  }
} as const;

// Endpoints de la API
export const API_ENDPOINTS = {
  MOVIES: {
    POPULAR: '/movie/popular',
    TOP_RATED: '/movie/top_rated',
    NOW_PLAYING: '/movie/now_playing',
    UPCOMING: '/movie/upcoming',
    DETAILS: (id: string) => `/movie/${id}`,
    CREDITS: (id: string) => `/movie/${id}/credits`,
    VIDEOS: (id: string) => `/movie/${id}/videos`,
    SIMILAR: (id: string) => `/movie/${id}/similar`,
    SEARCH: '/search/movie'
  },
  PEOPLE: {
    POPULAR: '/person/popular',
    DETAILS: (id: string) => `/person/${id}`,
    CREDITS: (id: string) => `/person/${id}/combined_credits`,
    IMAGES: (id: string) => `/person/${id}/images`
  }
} as const;

// Parámetros por defecto
export const DEFAULT_PARAMS = {
  LANGUAGE: 'es-ES',
  REGION: 'ES',
  PAGE: 1,
  INCLUDE_ADULT: false
} as const;

// Configuración de caché
export const CACHE_CONFIG = {
  DURATION: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100 // máximo 100 items en caché
} as const; 