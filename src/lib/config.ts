// Configuración de la aplicación
export const config = {
  // API Configuration
  tmdb: {
    apiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY || 'fa340e8a8a245ed0d539ccf24d85e2e3',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/',
  },
  
  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'CineGemini',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: 'Tu aplicación de películas favorita',
  },
  
  // Features
  features: {
    enableNotifications: true,
    enableFavorites: true,
    enableSharing: true,
    enableSearch: true,
  },
  
  // UI Configuration
  ui: {
    defaultLanguage: 'es-ES',
    defaultTheme: 'dark',
    itemsPerPage: 20,
    maxSearchResults: 100,
  }
};

// Función para validar la configuración
export const validateConfig = () => {
  const issues: string[] = [];
  
  if (!config.tmdb.apiKey || config.tmdb.apiKey === 'tu_api_key_aqui') {
    issues.push('API key de TMDB no configurada correctamente');
  }
  
  if (issues.length > 0) {
    console.warn('Configuración con problemas:', issues);
    return false;
  }
  
  return true;
};

// Función para obtener la API key de forma segura
export const getApiKey = () => {
  const apiKey = config.tmdb.apiKey;
  
  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    console.warn('API key no configurada, usando key por defecto');
    return 'fa340e8a8a245ed0d539ccf24d85e2e3';
  }
  
  return apiKey;
};

// Función para construir URLs de imágenes
export const getImageUrl = (path: string, size: string = 'w500') => {
  if (!path) return null;
  return `${config.tmdb.imageBaseUrl}${size}${path}`;
};

// Función para obtener el tamaño de imagen apropiado
export const getImageSize = (containerWidth: number) => {
  if (containerWidth <= 640) return 'w342'; // mobile
  if (containerWidth <= 1024) return 'w500'; // tablet
  if (containerWidth <= 1280) return 'w780'; // desktop
  return 'original'; // large screens
}; 