# Sistema de Rutas Amigables - CineGemini

## 📋 Descripción General

El sistema de rutas amigables de CineGemini transforma las URLs técnicas en enlaces legibles y SEO-friendly, mejorando la experiencia del usuario y el posicionamiento en buscadores.

## 🎯 Beneficios

### Para Usuarios
- **URLs legibles**: `/pelicula/123-avengers-endgame` en lugar de `/movie/123`
- **Navegación intuitiva**: Los usuarios pueden entender el contenido desde la URL
- **Compartir fácil**: URLs más atractivas para compartir en redes sociales
- **Mejor UX**: Navegación más natural y comprensible

### Para SEO
- **Palabras clave en URLs**: Incluye títulos y categorías relevantes
- **Estructura jerárquica**: Organización clara del contenido
- **URLs canónicas**: Evita contenido duplicado
- **Mejor indexación**: Los motores de búsqueda comprenden mejor el contenido

### Para Desarrolladores
- **Código mantenible**: Utilidades centralizadas para generar URLs
- **Consistencia**: Mismo formato en toda la aplicación
- **Escalabilidad**: Fácil agregar nuevas rutas
- **Validación**: Verificación automática de URLs válidas

## 🏗️ Estructura de Rutas

### Rutas Principales
```
/                           → Página de inicio
/peliculas                  → Catálogo de películas
/series                     → Catálogo de series
/personas                   → Catálogo de personas
/buscar                     → Página de búsqueda
/favoritos                  → Favoritos del usuario
/generos                    → Lista de géneros
/categorias                 → Lista de categorías
```

### Rutas de Contenido
```
/pelicula/{id}-{titulo}     → Detalles de película
/serie/{id}-{titulo}        → Detalles de serie
/persona/{id}-{nombre}      → Perfil de persona
/genero/{nombre}-{id}       → Películas/series por género
/categoria/{categoria}      → Contenido por categoría
```

### Ejemplos de URLs
```
/pelicula/299536-avengers-infinity-war
/serie/1399-game-of-thrones
/persona/976-jason-statham
/genero/accion-28
/categoria/populares
```

## 🛠️ Utilidades Implementadas

### Archivo: `src/utils/urlHelpers.ts`

#### Constantes
```typescript
export const ROUTES = {
  HOME: '/',
  MOVIES: '/peliculas',
  TV: '/series',
  PEOPLE: '/personas',
  SEARCH: '/buscar',
  FAVORITES: '/favoritos',
  GENRES: '/generos',
  CATEGORIES: '/categorias',
} as const;

export const MEDIA_TYPES = {
  MOVIE: 'pelicula',
  TV: 'serie',
  PERSON: 'persona',
} as const;
```

#### Funciones de Generación de URLs
```typescript
// Genera slug amigable
generateSlug(text: string): string

// URLs para diferentes tipos de contenido
generateMovieUrl(id: number, title: string): string
generateTVUrl(id: number, title: string): string
generatePersonUrl(id: number, name: string): string
generateGenreUrl(id: number, name: string, mediaType?: 'movie' | 'tv'): string
generateCategoryUrl(category: string): string
```

#### Funciones de Parsing
```typescript
// Extrae información de URLs
extractIdFromUrl(url: string): number | null
extractSlugFromUrl(url: string): string
isValidFriendlyUrl(url: string): boolean
```

#### Utilidades de Navegación
```typescript
// Genera breadcrumbs automáticamente
generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }>

// Obtiene título de página
getPageTitle(pathname: string): string

// Enlaces de navegación
getMainNavigationLinks(): Array<{ label: string; href: string; icon: string }>
getQuickNavigationLinks(): Array<{ label: string; href: string }>
```

## 📁 Estructura de Archivos

### Nuevas Rutas Implementadas
```
src/app/
├── pelicula/[slug]/page.tsx      → Detalles de película
├── serie/[slug]/page.tsx         → Detalles de serie
├── persona/[slug]/page.tsx       → Perfil de persona
├── peliculas/page.tsx            → Catálogo de películas
├── series/page.tsx               → Catálogo de series
├── personas/page.tsx             → Catálogo de personas
├── genero/[slug]/page.tsx        → Contenido por género
└── categoria/[category]/page.tsx → Contenido por categoría
```

### Componentes Actualizados
```
src/components/
├── MovieCard.tsx                 → Usa generateMovieUrl/generateTVUrl
├── CastMemberCard.tsx            → Usa generatePersonUrl
└── CreditCard.tsx                → Usa generateMovieUrl/generateTVUrl
```

## 🔧 Implementación Técnica

### 1. Generación de Slugs
```typescript
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
```

### 2. Extracción de IDs
```typescript
export const extractIdFromUrl = (url: string): number | null => {
  const match = url.match(/(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};
```

### 3. Validación de URLs
```typescript
export const isValidFriendlyUrl = (url: string): boolean => {
  const pattern = /^\d+-[a-z0-9-]+$/;
  return pattern.test(url);
};
```

## 🎨 Características de UX

### Breadcrumbs Automáticos
- Navegación contextual basada en la ruta actual
- Enlaces de regreso intuitivos
- Etiquetas amigables en español

### Estados de Carga
- Indicadores visuales durante la carga
- Mensajes de error descriptivos
- Botones de regreso al inicio

### Navegación Responsiva
- Controles adaptados a diferentes tamaños de pantalla
- Botones de cambio de vista (grid/list)
- Filtros de ordenamiento

## 🔍 SEO y Metadatos

### URLs Canónicas
```typescript
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cinegemini.com';
  return `${baseUrl}${path}`;
};
```

### Metadatos Dinámicos
```typescript
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
```

## 🚀 Uso en Componentes

### Ejemplo: MovieCard
```typescript
import { generateMovieUrl, generateTVUrl } from '@/utils/urlHelpers';

const mediaUrl = useMemo(() => {
  return isTV 
    ? generateTVUrl(movie.id, displayTitle)
    : generateMovieUrl(movie.id, displayTitle);
}, [movie.id, displayTitle, isTV]);
```

### Ejemplo: Página de Película
```typescript
import { extractIdFromUrl, ROUTES } from '@/utils/urlHelpers';

// Extraer ID del slug
const movieId = extractIdFromUrl(resolvedParams.slug);

// Validar URL
const isValidId = movieId !== null && movieId > 0;
```

## 📊 Mapeo de Categorías

### Categorías de Películas
```typescript
const categoryConfig = {
  'populares': {
    title: 'Películas Populares',
    icon: FiTrendingUp,
    color: 'from-red-500 to-pink-500',
    apiFunction: getPopularMovies
  },
  'mejor-valoradas': {
    title: 'Películas Mejor Valoradas',
    icon: FiAward,
    color: 'from-yellow-500 to-orange-500',
    apiFunction: getTopRatedMovies
  },
  // ... más categorías
};
```

### Géneros
```typescript
const genreNames: Record<number, string> = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  // ... más géneros
};
```

## 🔒 Seguridad y Validación

### Sanitización de URLs
```typescript
export const sanitizeUrl = (url: string): string => {
  return url
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};
```

### Validación de Rutas
```typescript
export const isValidRoute = (path: string): boolean => {
  const validRoutes = [
    ROUTES.HOME,
    ROUTES.MOVIES,
    ROUTES.TV,
    // ... todas las rutas válidas
  ];
  
  return validRoutes.some(route => path.startsWith(route));
};
```

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Redirecciones 301 para URLs antiguas
- [ ] Sitemap automático con URLs amigables
- [ ] URLs multilenguaje
- [ ] Compresión de URLs largas
- [ ] Analytics de rutas más populares

### Optimizaciones Técnicas
- [ ] Cache de URLs generadas
- [ ] Lazy loading de rutas
- [ ] Prefetching de rutas relacionadas
- [ ] Compresión de slugs

## 📝 Notas de Desarrollo

### Convenciones de Nomenclatura
- URLs en español para mejor SEO local
- Slugs en minúsculas con guiones
- IDs numéricos al inicio para identificación rápida
- Títulos descriptivos al final

### Consideraciones de Rendimiento
- Memoización de URLs generadas
- Validación client-side para mejor UX
- Lazy loading de componentes de ruta
- Optimización de imágenes por ruta

### Mantenimiento
- Actualizar constantes cuando se agreguen nuevas rutas
- Revisar mapeos de géneros y categorías regularmente
- Monitorear URLs rotas con herramientas de SEO
- Mantener documentación actualizada

---

**Sistema de Rutas Amigables v1.0** - CineGemini
*Mejorando la experiencia del usuario una URL a la vez* 🚀 