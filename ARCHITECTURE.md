# 🏗️ Arquitectura de CineGemini

Este documento describe la arquitectura escalable y modular de CineGemini, diseñada para facilitar el mantenimiento, la escalabilidad y el desarrollo colaborativo.

## 📋 Índice

1. [Principios de Diseño](#principios-de-diseño)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Patrones de Arquitectura](#patrones-de-arquitectura)
4. [Flujo de Datos](#flujo-de-datos)
5. [Componentes](#componentes)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Utilidades](#utilidades)
8. [Constantes](#constantes)
9. [Configuración](#configuración)
10. [Mejores Prácticas](#mejores-prácticas)

## 🎯 Principios de Diseño

### 1. Separación de Responsabilidades
- **Presentación**: Componentes UI puros
- **Lógica de Negocio**: Hooks personalizados
- **Datos**: Cliente API centralizado
- **Configuración**: Constantes y configuraciones

### 2. Modularidad
- Componentes reutilizables y autocontenidos
- Funciones puras y predecibles
- Interfaces bien definidas
- Acoplamiento bajo, cohesión alta

### 3. Escalabilidad
- Arquitectura preparada para crecimiento
- Patrones consistentes y repetibles
- Configuración centralizada
- Código DRY (Don't Repeat Yourself)

### 4. Mantenibilidad
- Código limpio y bien documentado
- Estructura de archivos lógica
- Convenciones de nomenclatura consistentes
- Testing integrado

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout raíz
│   ├── page.tsx                 # Página de inicio
│   ├── search/                  # Página de búsqueda
│   ├── movie/[id]/              # Detalles de película
│   ├── person/[id]/             # Detalles de persona
│   └── people/                  # Lista de personas
├── components/                   # Componentes React
│   ├── ui/                      # Componentes de UI básicos
│   ├── movies/                  # Componentes específicos de películas
│   ├── people/                  # Componentes específicos de personas
│   ├── layout/                  # Componentes de layout
│   ├── MovieCard.tsx            # Componentes compartidos
│   ├── SearchBar.tsx
│   ├── Navbar.tsx
│   ├── HorizontalScroll.tsx
│   ├── InfiniteScroll.tsx
│   ├── Notification.tsx
│   └── ErrorBoundary.tsx
├── hooks/                       # Custom hooks
│   └── useApi.ts               # Hook principal para API
├── utils/                       # Utilidades y helpers
│   ├── api.ts                  # Cliente API centralizado
│   └── formatting.ts           # Utilidades de formateo
├── constants/                   # Constantes y configuraciones
│   ├── api.ts                  # Configuración de API
│   ├── config.ts               # Configuración general
│   └── genres.ts               # Géneros de películas
├── context/                     # Contextos de React
│   └── ThemeContext.tsx        # Contexto de tema
├── lib/                         # Librerías y configuraciones
│   └── api.ts                  # Funciones de API (legacy)
└── types.ts                     # Tipos de TypeScript
```

## 🔄 Patrones de Arquitectura

### 1. Patrón Cliente-Servidor
```typescript
// Cliente API centralizado
class ApiClient {
  private baseURL: string;
  private apiKey: string;

  async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    // Implementación centralizada
  }
}

// Instancia singleton
export const apiClient = new ApiClient();
```

### 2. Patrón Hook Personalizado
```typescript
// Hook para manejo de API
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): ApiState<T> & { refetch: () => Promise<void> } {
  // Lógica centralizada para llamadas a API
}

// Hooks específicos
export function useMovies(category: string, page = 1) {
  return useApi(() => apiClient.getMovies(category, page), {
    cacheKey: `movies-${category}-${page}`
  });
}
```

### 3. Patrón Layout
```typescript
// Layout base
export function PageLayout({ children, showNavbar = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      {showNavbar && <Navbar />}
      <main>{children}</main>
      <NotificationContainer />
    </div>
  );
}

// Layouts específicos
export function ContainerLayout({ children }: PageLayoutProps) {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </PageLayout>
  );
}
```

## 📊 Flujo de Datos

### 1. Flujo de Llamadas a API
```
Componente → Hook → Cliente API → TMDB → Respuesta → Estado → UI
```

### 2. Flujo de Estado
```
Contexto Global → Hooks → Componentes → UI
```

### 3. Flujo de Eventos
```
Usuario → Evento → Handler → Hook → API → Estado → UI
```

## 🧩 Componentes

### Clasificación de Componentes

#### 1. Componentes de Presentación (UI)
- **Propósito**: Solo renderizar UI
- **Estado**: Mínimo o nulo
- **Props**: Bien definidas
- **Ejemplos**: `Button`, `Modal`, `Loading`

#### 2. Componentes de Contenedor
- **Propósito**: Manejar lógica de negocio
- **Estado**: Complejo
- **Hooks**: Usan hooks personalizados
- **Ejemplos**: `MovieSection`, `SearchPage`

#### 3. Componentes de Layout
- **Propósito**: Estructura de página
- **Composición**: Otros componentes
- **Reutilización**: Alta
- **Ejemplos**: `PageLayout`, `ContainerLayout`

#### 4. Componentes de Página
- **Propósito**: Páginas completas
- **Rutas**: Next.js App Router
- **Composición**: Múltiples componentes
- **Ejemplos**: `HomePage`, `MovieDetailPage`

## 🎣 Hooks Personalizados

### 1. Hook Principal: useApi
```typescript
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): ApiState<T> & { refetch: () => Promise<void> }
```

**Características:**
- Caché automático
- Estados de carga y error
- Prevención de llamadas duplicadas
- Reintentos automáticos
- Configuración flexible

### 2. Hooks Específicos
```typescript
// Para películas
export function useMovies(category: string, page = 1)
export function useMovieDetails(id: string)
export function useMovieSearch(query: string, page = 1)

// Para personas
export function usePersonDetails(id: string)
export function usePersonCredits(id: string)
export function usePersonImages(id: string)
```

## 🛠️ Utilidades

### 1. Cliente API
```typescript
class ApiClient {
  // Métodos para películas
  async getPopularMovies(page: number = 1)
  async getMovieDetails(id: string)
  async searchMovies(query: string, page: number = 1)
  
  // Métodos para personas
  async getPersonDetails(id: string)
  async getPersonCredits(id: string)
}
```

### 2. Utilidades de Formateo
```typescript
// Fechas
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string

// Duración
export const formatRuntime = (minutes: number): string

// Rating
export const formatRating = (rating: number): string

// Imágenes
export const getImageUrl = (path: string, size: string = 'w500'): string
```

## 📋 Constantes

### 1. Configuración de API
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  IMAGE_SIZES: { /* ... */ }
} as const;
```

### 2. Configuración de la Aplicación
```typescript
export const APP_CONFIG = {
  NAME: 'CineGemini',
  FEATURES: { /* ... */ },
  UI: { /* ... */ },
  PERFORMANCE: { /* ... */ },
  CACHE: { /* ... */ }
} as const;
```

### 3. Géneros de Películas
```typescript
export const MOVIE_GENRES = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  // ...
] as const;
```

## ⚙️ Configuración

### 1. Variables de Entorno
```env
# API Configuration
NEXT_PUBLIC_TMDB_API_KEY=tu-api-key

# App Configuration
NEXT_PUBLIC_APP_NAME=CineGemini
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA_ID=tu-google-analytics-id
```

### 2. Configuración de Next.js
```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
  },
  experimental: {
    appDir: true,
  },
};
```

### 3. Configuración de TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## ✅ Mejores Prácticas

### 1. Nomenclatura
- **Componentes**: PascalCase (`MovieCard`)
- **Hooks**: camelCase con prefijo `use` (`useMovies`)
- **Utilidades**: camelCase (`formatDate`)
- **Constantes**: UPPER_SNAKE_CASE (`API_CONFIG`)
- **Tipos**: PascalCase (`MovieProps`)

### 2. Estructura de Archivos
- Un componente por archivo
- Archivos de índice para exports
- Agrupación lógica por funcionalidad
- Separación clara de responsabilidades

### 3. Performance
- Lazy loading de componentes
- Memoización cuando sea necesario
- Optimización de imágenes
- Caché inteligente

### 4. Testing
- Tests unitarios para utilidades
- Tests de integración para hooks
- Tests de componentes con React Testing Library
- Tests E2E con Playwright

### 5. Accesibilidad
- Semántica HTML correcta
- ARIA labels y roles
- Navegación por teclado
- Contraste de colores adecuado

## 🚀 Escalabilidad

### 1. Agregar Nuevas Funcionalidades
1. Crear tipos en `types.ts`
2. Agregar endpoints en `constants/api.ts`
3. Implementar métodos en `utils/api.ts`
4. Crear hooks específicos en `hooks/useApi.ts`
5. Desarrollar componentes en `components/`
6. Crear páginas en `app/`

### 2. Agregar Nuevas Páginas
1. Crear directorio en `app/`
2. Implementar `page.tsx`
3. Usar layouts apropiados
4. Agregar rutas en `constants/routes.ts`
5. Actualizar navegación

### 3. Agregar Nuevos Componentes
1. Identificar el tipo de componente
2. Crear en el directorio apropiado
3. Definir interfaces claras
4. Implementar con props bien definidas
5. Agregar tests si es necesario

---

Esta arquitectura proporciona una base sólida para el crecimiento y mantenimiento del proyecto, siguiendo las mejores prácticas de desarrollo moderno con React y Next. 

# Arquitectura de la Aplicación - Separación de Lógica y Diseño

## 📋 Resumen

Este documento describe la arquitectura implementada para separar la lógica de negocio del diseño de la interfaz de usuario en la aplicación de películas y TV.

## 🏗️ Estructura de Separación

### 1. **Hooks Personalizados (Lógica de Negocio)**

Los hooks personalizados contienen toda la lógica de negocio, manejo de estado y efectos secundarios:

#### `src/hooks/useHomePage.ts`
- **Responsabilidades:**
  - Gestión de estado de películas populares, mejor valoradas, en cartelera y próximas
  - Lógica de carga inicial y paginación
  - Manejo de errores y notificaciones
  - Eliminación de duplicados
  - Control de estados de carga

#### `src/hooks/usePeoplePage.ts`
- **Responsabilidades:**
  - Gestión de estado de personas (actores, directores)
  - Búsqueda y filtrado avanzado
  - Paginación con navegación por teclado
  - Ordenamiento y estadísticas
  - Historial de búsquedas
  - Estados de carga y errores

#### `src/hooks/useMoviesPage.ts`
- **Responsabilidades:**
  - Gestión de géneros de películas
  - Filtros rápidos y avanzados
  - Contenido filtrado y ordenamiento
  - Estadísticas de filtros
  - Historial de filtros

### 2. **Componentes de UI (Diseño)**

Los componentes de UI se enfocan únicamente en la presentación y la interacción visual:

#### `src/components/pages/PeoplePageHeader.tsx`
- **Responsabilidades:**
  - Header premium con navegación
  - Búsqueda y controles principales
  - Métricas y estadísticas visuales
  - Breadcrumbs y navegación

#### `src/components/pages/PeoplePageFilters.tsx`
- **Responsabilidades:**
  - Controles de vista (grid/list)
  - Filtros expandibles
  - Historial de búsquedas
  - Información de resultados

#### `src/components/pages/PeoplePagePagination.tsx`
- **Responsabilidades:**
  - Paginación avanzada con navegación por teclado
  - Saltos rápidos
  - Indicadores de progreso
  - Estados de carga

## 🔄 Flujo de Datos

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Page Component│    │  Custom Hook     │    │  UI Components  │
│                 │    │                  │    │                 │
│ - Render UI     │───▶│ - Business Logic │───▶│ - Pure UI       │
│ - Handle Events │    │ - State Mgmt     │    │ - Props         │
│ - Layout        │    │ - API Calls      │    │ - Styling       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Estructura de Archivos

```
src/
├── hooks/                    # Lógica de negocio
│   ├── useHomePage.ts       # Hook para página principal
│   ├── usePeoplePage.ts     # Hook para página de personas
│   └── useMoviesPage.ts     # Hook para página de películas
│
├── components/
│   ├── pages/               # Componentes de página específicos
│   │   ├── PeoplePageHeader.tsx
│   │   ├── PeoplePageFilters.tsx
│   │   └── PeoplePagePagination.tsx
│   │
│   └── [otros componentes]  # Componentes reutilizables
│
└── app/                     # Páginas de Next.js
    ├── page.tsx            # Página principal (refactorizada)
    ├── people/
    │   └── page.tsx        # Página de personas (refactorizada)
    └── movies/
        └── page.tsx        # Página de películas (pendiente)
```

## 🎯 Beneficios de la Separación

### 1. **Mantenibilidad**
- **Lógica centralizada:** Toda la lógica de negocio está en hooks reutilizables
- **UI desacoplada:** Los componentes de UI son puros y fáciles de modificar
- **Testing simplificado:** Se puede testear la lógica independientemente del UI

### 2. **Reutilización**
- **Hooks reutilizables:** La lógica se puede usar en múltiples componentes
- **Componentes modulares:** Los componentes de UI se pueden reutilizar
- **Patrones consistentes:** Estructura uniforme en toda la aplicación

### 3. **Escalabilidad**
- **Fácil extensión:** Agregar nuevas funcionalidades sin afectar el UI
- **Separación clara:** Responsabilidades bien definidas
- **Arquitectura escalable:** Fácil de mantener a medida que crece

### 4. **Performance**
- **Optimización de re-renders:** Los hooks optimizan cuándo actualizar el estado
- **Memoización:** Lógica de memoización en los hooks
- **Carga lazy:** Componentes se cargan solo cuando son necesarios

## 🔧 Patrones Implementados

### 1. **Custom Hooks Pattern**
```typescript
const [state, actions] = usePeoplePage();
```

### 2. **State-Actions Pattern**
```typescript
interface PageState {
  // Estado de la página
}

interface PageActions {
  // Acciones disponibles
}
```

### 3. **Component Composition**
```typescript
<PeoplePageHeader state={state} actions={actions} />
<PeoplePageFilters state={state} actions={actions} />
<PeoplePagePagination state={state} actions={actions} />
```

## 🚀 Próximos Pasos

### 1. **Completar Refactorización**
- [ ] Refactorizar página de movies usando el mismo patrón
- [ ] Refactorizar página de TV
- [ ] Refactorizar página de búsqueda
- [ ] Refactorizar página de favoritos

### 2. **Mejorar Hooks**
- [ ] Agregar más hooks especializados (useSearch, usePagination, etc.)
- [ ] Implementar cache inteligente en hooks
- [ ] Agregar validación de tipos más estricta

### 3. **Optimizaciones**
- [ ] Implementar React.memo en componentes de UI
- [ ] Agregar lazy loading para componentes pesados
- [ ] Optimizar re-renders con useMemo y useCallback

### 4. **Testing**
- [ ] Tests unitarios para hooks
- [ ] Tests de integración para componentes
- [ ] Tests E2E para flujos completos

## 📊 Métricas de Calidad

### Antes de la Refactorización
- **Líneas por archivo:** 700+ líneas
- **Responsabilidades mezcladas:** Lógica y UI juntas
- **Reutilización:** Baja
- **Testing:** Difícil

### Después de la Refactorización
- **Líneas por archivo:** 50-200 líneas
- **Responsabilidades separadas:** Clara separación
- **Reutilización:** Alta
- **Testing:** Fácil

## 🎨 Convenciones de Nomenclatura

### Hooks
- `use[PageName]Page` - Hooks principales de página
- `use[Feature]` - Hooks especializados

### Componentes de UI
- `[PageName]Page[Section]` - Componentes de sección de página
- Props: `state` y `actions` para pasar datos y funciones

### Interfaces
- `[PageName]PageState` - Estado de la página
- `[PageName]PageActions` - Acciones de la página

## 🔍 Ejemplo de Uso

```typescript
// Página refactorizada
export default function PeoplePage() {
  const [state, actions] = usePeoplePage();
  
  return (
    <div>
      <PeoplePageHeader state={state} actions={actions} />
      <PeoplePageFilters state={state} actions={actions} />
      <PeoplePageContent state={state} actions={actions} />
      <PeoplePagePagination state={state} actions={actions} />
    </div>
  );
}
```

Esta arquitectura proporciona una base sólida para el crecimiento y mantenimiento de la aplicación, con una clara separación de responsabilidades y patrones consistentes. 