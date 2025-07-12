/**
 * Utilidades para generar URLs amigables y manejar rutas
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const ROUTES = {
  HOME: '/',
  MOVIES: '/peliculas',
  TV: '/series',
  PEOPLE: '/personas',
  SEARCH: '/buscar',
  FAVORITES: '/favoritos',
  FAVORITES_MOVIES: '/favoritos/peliculas',
  FAVORITES_TV: '/favoritos/series',
  FAVORITES_PEOPLE: '/favoritos/personas',
  GENRES: '/generos',
  CATEGORIES: '/categorias',
  PRIVACY: '/privacidad',
  TERMS: '/terminos',
  ABOUT: '/acerca-de',
} as const;

export const MEDIA_TYPES = {
  MOVIE: 'pelicula',
  TV: 'serie',
  PERSON: 'persona',
} as const;

// ============================================================================
// URL GENERATION FUNCTIONS
// ============================================================================

/**
 * Genera un slug amigable para URLs
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Genera URL amigable para películas
 */
export const generateMovieUrl = (id: number, title: string): string => {
  const slug = generateSlug(title);
  return `/${MEDIA_TYPES.MOVIE}/${id}-${slug}`;
};

/**
 * Genera URL amigable para series de TV
 */
export const generateTVUrl = (id: number, title: string): string => {
  const slug = generateSlug(title);
  return `/${MEDIA_TYPES.TV}/${id}-${slug}`;
};

/**
 * Genera URL amigable para personas
 */
export const generatePersonUrl = (id: number, name: string): string => {
  const slug = generateSlug(name);
  return `/${MEDIA_TYPES.PERSON}/${id}-${slug}`;
};

/**
 * Genera URL amigable para géneros
 */
export const generateGenreUrl = (id: number, name: string, mediaType: 'movie' | 'tv' = 'movie'): string => {
  const slug = generateSlug(name);
  const typeParam = mediaType === 'tv' ? '?type=tv' : '?type=movie';
  return `/genero/${slug}-${id}${typeParam}`;
};

/**
 * Mapeo de categorías para URLs amigables
 */
const CATEGORY_SLUG_MAP: Record<string, string> = {
  popular: 'populares',
  top_rated: 'mejor-valoradas',
  now_playing: 'en-cines',
  upcoming: 'proximas',
  popularTV: 'series-populares',
  topRatedTV: 'series-mejor-valoradas',
  onAirTV: 'series-en-emision',
  airingTodayTV: 'series-hoy',
};

/**
 * Genera URL amigable para categorías
 */
export const generateCategoryUrl = (category: string): string => {
  const slug = CATEGORY_SLUG_MAP[category] || category;
  return `/categoria/${slug}`;
};

/**
 * Convierte un slug de categoría de vuelta a la clave original
 */
export const parseCategorySlug = (slug: string): string => {
  const reverseMap: Record<string, string> = Object.fromEntries(
    Object.entries(CATEGORY_SLUG_MAP).map(([key, value]) => [value, key])
  );
  return reverseMap[slug] || slug;
};

// ============================================================================
// URL PARSING FUNCTIONS
// ============================================================================

/**
 * Extrae el ID de una URL amigable
 */
export const extractIdFromUrl = (url: string): number | null => {
  const match = url.match(/(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Extrae el slug de una URL amigable
 */
export const extractSlugFromUrl = (url: string): string => {
  const match = url.match(/\d+-(.+)$/);
  return match ? match[1] : '';
};

/**
 * Valida si una URL amigable es válida
 */
export const isValidFriendlyUrl = (url: string): boolean => {
  const pattern = /^\d+-[a-z0-9-]+$/;
  return pattern.test(url);
};

// ============================================================================
// ROUTE HELPERS
// ============================================================================

/**
 * Obtiene la ruta base según el tipo de medio
 */
export const getBaseRoute = (mediaType: 'movie' | 'tv' | 'person'): string => {
  switch (mediaType) {
    case 'movie':
      return ROUTES.MOVIES;
    case 'tv':
      return ROUTES.TV;
    case 'person':
      return ROUTES.PEOPLE;
    default:
      return ROUTES.HOME;
  }
};

/**
 * Genera breadcrumbs para una ruta
 */
export const generateBreadcrumbs = (pathname: string): Array<{ label: string; href: string }> => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: 'Inicio', href: ROUTES.HOME }
  ];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Mapear segmentos a etiquetas amigables
    const labelMap: Record<string, string> = {
      pelicula: 'Película',
      serie: 'Serie',
      persona: 'Persona',
      peliculas: 'Películas',
      series: 'Series',
      personas: 'Personas',
      buscar: 'Búsqueda',
      favoritos: 'Favoritos',
      generos: 'Géneros',
      genero: 'Género',
      categorias: 'Categorías',
      categoria: 'Categoría',
      populares: 'Populares',
      'mejor-valoradas': 'Mejor Valoradas',
      'en-cines': 'En Cines',
      proximas: 'Próximas',
      'series-populares': 'Series Populares',
      'series-mejor-valoradas': 'Series Mejor Valoradas',
      'series-en-emision': 'Series en Emisión',
      'series-hoy': 'Series de Hoy',
    };

    const label = labelMap[segment] || segment;
    
    // No agregar breadcrumb para el último segmento (página actual)
    if (index < segments.length - 1) {
      breadcrumbs.push({ label, href: currentPath });
    }
  });

  return breadcrumbs;
};

/**
 * Obtiene el título de la página basado en la ruta
 */
export const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'CineGemini - Descubre Películas y Series';
  
  const lastSegment = segments[segments.length - 1];
  
  const titleMap: Record<string, string> = {
    peliculas: 'Películas - CineGemini',
    series: 'Series de TV - CineGemini',
    personas: 'Personas - CineGemini',
    buscar: 'Búsqueda - CineGemini',
    favoritos: 'Mis Favoritos - CineGemini',
    generos: 'Géneros - CineGemini',
    categorias: 'Categorías - CineGemini',
  };

  return titleMap[lastSegment] || 'CineGemini';
};

// ============================================================================
// SEO HELPERS
// ============================================================================

/**
 * Genera metadatos SEO para una página
 */
export const generateSeoMetadata = (
  title: string,
  description: string,
  image?: string,
  url?: string
) => {
  return {
    title: `${title} - CineGemini`,
    description,
    openGraph: {
      title: `${title} - CineGemini`,
      description,
      images: image ? [{ url: image }] : [],
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - CineGemini`,
      description,
      images: image ? [image] : [],
    },
  };
};

/**
 * Genera URL canónica
 */
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cinegemini.com';
  return `${baseUrl}${path}`;
};

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Obtiene enlaces de navegación principales
 */
export const getMainNavigationLinks = () => [
  { label: 'Inicio', href: ROUTES.HOME, icon: 'home' },
  { label: 'Películas', href: ROUTES.MOVIES, icon: 'film' },
  { label: 'Series', href: ROUTES.TV, icon: 'tv' },
  { label: 'Personas', href: ROUTES.PEOPLE, icon: 'users' },
  { label: 'Géneros', href: ROUTES.GENRES, icon: 'tag' },
  { label: 'Favoritos', href: ROUTES.FAVORITES, icon: 'heart' },
];

/**
 * Obtiene enlaces de navegación rápida
 */
export const getQuickNavigationLinks = () => [
  { label: 'Películas Populares', href: generateCategoryUrl('popular') },
  { label: 'Mejor Valoradas', href: generateCategoryUrl('top_rated') },
  { label: 'En Cines', href: generateCategoryUrl('now_playing') },
  { label: 'Series Populares', href: generateCategoryUrl('popularTV') },
  { label: 'Búsqueda', href: ROUTES.SEARCH },
];

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida si una ruta es válida
 */
export const isValidRoute = (path: string): boolean => {
  const validRoutes = [
    ROUTES.HOME,
    ROUTES.MOVIES,
    ROUTES.TV,
    ROUTES.PEOPLE,
    ROUTES.SEARCH,
    ROUTES.FAVORITES,
    ROUTES.GENRES,
    ROUTES.CATEGORIES,
  ];
  
  return validRoutes.some(route => path.startsWith(route));
};

/**
 * Sanitiza una URL para evitar inyección
 */
export const sanitizeUrl = (url: string): string => {
  return url
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}; 