# Plan de Mejora de Estructura de Carpetas

## Estado Actual - Problemas Identificados

### 1. Duplicación de Rutas
- `src/app/peliculas/` y `src/app/movies/`
- `src/app/pelicula/` y `src/app/movie/`
- `src/app/serie/` y `src/app/tv/`
- `src/app/genero/` y `src/app/genre/`

### 2. Carpetas de Prueba
- `src/app/test/`
- `src/app/test-search/`

### 3. Documentación Dispersa
- Múltiples archivos `.md` en la raíz del proyecto

### 4. Inconsistencia en Nombres
- Mezcla de español e inglés en nombres de carpetas

## Estructura Propuesta

```
src/
├── app/                          # App Router de Next.js 13+
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── auth-required/
│   ├── (movies)/                 # Grupo de rutas de películas
│   │   ├── movies/               # Lista de películas
│   │   ├── movie/[slug]/         # Detalle de película
│   │   └── category/[category]/  # Categorías de películas
│   ├── (tv)/                     # Grupo de rutas de series
│   │   ├── tv/                   # Lista de series
│   │   └── tv/[id]/              # Detalle de serie
│   ├── (people)/                 # Grupo de rutas de personas
│   │   ├── people/               # Lista de personas
│   │   └── person/[id]/          # Detalle de persona
│   ├── (favorites)/              # Grupo de rutas de favoritos
│   │   ├── favorites/
│   │   ├── favorites/movies/
│   │   ├── favorites/tv/
│   │   └── favorites/people/
│   ├── search/                   # Búsqueda
│   ├── genre/[id]/               # Géneros
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── globals.css
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes de UI básicos
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/                   # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── features/                 # Componentes específicos de features
│   │   ├── movies/
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieList.tsx
│   │   │   └── MovieFilters.tsx
│   │   ├── tv/
│   │   │   ├── TVCard.tsx
│   │   │   └── TVList.tsx
│   │   ├── people/
│   │   │   ├── PersonCard.tsx
│   │   │   └── PersonList.tsx
│   │   └── search/
│   │       ├── SearchBar.tsx
│   │       └── SearchResults.tsx
│   ├── common/                   # Componentes comunes
│   │   ├── Loading.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Notification.tsx
│   │   └── InfiniteScroll.tsx
│   └── pages/                    # Componentes específicos de páginas
│       ├── HomePage.tsx
│       ├── MoviesPage.tsx
│       └── TVShowPage.tsx
├── hooks/                        # Custom hooks
│   ├── api/                      # Hooks relacionados con API
│   │   ├── useApi.ts
│   │   ├── useMovies.ts
│   │   └── useTVShows.ts
│   ├── ui/                       # Hooks de UI
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   └── features/                 # Hooks específicos de features
│       ├── useSearch.ts
│       ├── useFavorites.ts
│       └── usePagination.ts
├── lib/                          # Configuraciones y utilidades de librerías
│   ├── api/                      # Configuración de API
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── cache/                    # Sistema de cache
│   │   ├── memory.ts
│   │   └── localStorage.ts
│   ├── config/                   # Configuraciones
│   │   ├── app.ts
│   │   ├── api.ts
│   │   └── constants.ts
│   └── utils/                    # Utilidades de librerías
│       ├── performance.ts
│       └── validation.ts
├── utils/                        # Utilidades de la aplicación
│   ├── api/                      # Utilidades de API
│   │   ├── requests.ts
│   │   └── responses.ts
│   ├── formatting/               # Utilidades de formateo
│   │   ├── dates.ts
│   │   ├── numbers.ts
│   │   └── text.ts
│   ├── navigation/               # Utilidades de navegación
│   │   ├── routes.ts
│   │   └── breadcrumbs.ts
│   └── helpers/                  # Utilidades generales
│       ├── storage.ts
│       └── validation.ts
├── types/                        # Tipos TypeScript
│   ├── api.ts                    # Tipos de API
│   ├── components.ts             # Tipos de componentes
│   ├── pages.ts                  # Tipos de páginas
│   └── global.ts                 # Tipos globales
├── constants/                    # Constantes de la aplicación
│   ├── api.ts                    # Constantes de API
│   ├── routes.ts                 # Constantes de rutas
│   ├── genres.ts                 # Constantes de géneros
│   └── config.ts                 # Configuraciones
├── context/                      # Contextos de React
│   ├── ThemeContext.tsx
│   ├── FavoritesContext.tsx
│   └── AuthContext.tsx
└── styles/                       # Estilos adicionales
    ├── components.css
    └── utilities.css
```

## Archivos de Configuración en Raíz

```
/
├── docs/                         # Documentación del proyecto
│   ├── architecture.md
│   ├── api.md
│   ├── components.md
│   └── deployment.md
├── scripts/                      # Scripts de desarrollo
│   ├── build.js
│   ├── deploy.js
│   └── analyze.js
├── public/                       # Archivos estáticos
├── .env.example                  # Variables de entorno de ejemplo
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

## Beneficios de la Nueva Estructura

### 1. Organización Clara
- Separación clara entre componentes de UI, features y páginas
- Agrupación lógica de rutas relacionadas
- Eliminación de duplicaciones

### 2. Escalabilidad
- Fácil agregar nuevas features
- Estructura predecible para nuevos desarrolladores
- Separación de responsabilidades

### 3. Mantenibilidad
- Componentes relacionados agrupados
- Hooks organizados por funcionalidad
- Utilidades categorizadas

### 4. Performance
- Mejor tree-shaking
- Lazy loading más eficiente
- Código más modular

## Plan de Migración

### Fase 1: Limpieza
1. Eliminar carpetas duplicadas
2. Remover carpetas de prueba
3. Mover documentación a `/docs`

### Fase 2: Reorganización
1. Crear nueva estructura de carpetas
2. Mover archivos a sus nuevas ubicaciones
3. Actualizar imports

### Fase 3: Optimización
1. Actualizar barrel exports
2. Optimizar imports
3. Verificar que todo funcione correctamente

## Consideraciones

### Rutas en Español vs Inglés
- **Recomendación**: Usar inglés para rutas técnicas
- **Alternativa**: Mantener español para rutas públicas si es requerido
- **Solución**: Usar grupos de rutas para organizar

### Compatibilidad
- Mantener rutas existentes durante transición
- Usar redirects para rutas antiguas
- Actualizar documentación de API

### Testing
- Verificar que todas las rutas funcionen
- Comprobar que los imports estén correctos
- Validar que el build funcione 