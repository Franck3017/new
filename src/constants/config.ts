// Configuración general de la aplicación
export const APP_CONFIG = {
  NAME: 'CineGemini',
  DESCRIPTION: 'Explora un universo de películas con las mejores recomendaciones',
  VERSION: '1.0.0',
  AUTHOR: 'CineGemini Team',
  
  // Configuración de la aplicación
  FEATURES: {
    SEARCH: true,
    FAVORITES: true,
    NOTIFICATIONS: true,
    INFINITE_SCROLL: false, // Deshabilitado por defecto
    HORIZONTAL_SCROLL: true,
    CACHE: true,
    OFFLINE_SUPPORT: false
  },
  
  // Configuración de UI
  UI: {
    THEME: {
      PRIMARY: '#3B82F6', // blue-500
      SECONDARY: '#8B5CF6', // violet-500
      SUCCESS: '#10B981', // emerald-500
      WARNING: '#F59E0B', // amber-500
      ERROR: '#EF4444', // red-500
      BACKGROUND: '#111827', // gray-900
      SURFACE: '#1F2937', // gray-800
      TEXT_PRIMARY: '#F9FAFB', // gray-50
      TEXT_SECONDARY: '#9CA3AF' // gray-400
    },
    
    ANIMATIONS: {
      DURATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
      },
      EASING: {
        DEFAULT: 'ease-out',
        BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    
    BREAKPOINTS: {
      MOBILE: 640,
      TABLET: 768,
      LAPTOP: 1024,
      DESKTOP: 1280,
      WIDE: 1536
    },
    
    GRID: {
      COLUMNS: {
        MOBILE: 2,
        TABLET: 3,
        LAPTOP: 4,
        DESKTOP: 5,
        WIDE: 6
      },
      GAP: 24 // 6 * 4px
    }
  },
  
  // Configuración de rendimiento
  PERFORMANCE: {
    LAZY_LOADING: true,
    IMAGE_OPTIMIZATION: true,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    MAX_CONCURRENT_REQUESTS: 3,
    REQUEST_TIMEOUT: 10000 // 10 segundos
  },
  
  // Configuración de caché
  CACHE: {
    ENABLED: true,
    DURATION: {
      SHORT: 2 * 60 * 1000, // 2 minutos
      MEDIUM: 5 * 60 * 1000, // 5 minutos
      LONG: 30 * 60 * 1000, // 30 minutos
      PERMANENT: 24 * 60 * 60 * 1000 // 24 horas
    },
    MAX_SIZE: 100,
    STRATEGY: 'LRU' // Least Recently Used
  },
  
  // Configuración de errores
  ERROR_HANDLING: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    SHOW_ERROR_MESSAGES: true,
    LOG_ERRORS: true
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    AUTO_HIDE: true,
    AUTO_HIDE_DELAY: 5000, // 5 segundos
    MAX_VISIBLE: 5,
    POSITION: 'top-right'
  },
  
  // Configuración de búsqueda
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
    MAX_RESULTS: 20,
    ENABLE_FILTERS: true,
    ENABLE_SORT: true
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    ENABLE_INFINITE_SCROLL: false,
    ENABLE_LOAD_MORE: true
  }
} as const;

// Configuración de rutas
export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  MOVIE_DETAILS: '/movie/[id]',
  PERSON_DETAILS: '/person/[id]',
  PEOPLE: '/people',
  FAVORITES: '/favorites',
  ABOUT: '/about',
  SETTINGS: '/settings'
} as const;

// Configuración de SEO
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'CineGemini - Descubre las mejores películas',
  DEFAULT_DESCRIPTION: 'Explora un universo de películas con las mejores recomendaciones, búsquedas inteligentes y una experiencia cinematográfica única.',
  DEFAULT_KEYWORDS: 'películas, cine, streaming, recomendaciones, TMDB, CineGemini',
  SITE_URL: 'https://cinegemini.com',
  TWITTER_HANDLE: '@CineGemini',
  FACEBOOK_APP_ID: 'your-facebook-app-id'
} as const;

// Configuración de analytics
export const ANALYTICS_CONFIG = {
  ENABLED: false,
  GOOGLE_ANALYTICS_ID: '',
  FACEBOOK_PIXEL_ID: '',
  HOTJAR_ID: ''
} as const;

// Configuración de características experimentales
export const EXPERIMENTAL_FEATURES = {
  DARK_MODE: true,
  ANIMATIONS: true,
  GLASSMORPHISM: true,
  PARALLAX_EFFECTS: false,
  VOICE_SEARCH: false,
  OFFLINE_MODE: false
} as const; 