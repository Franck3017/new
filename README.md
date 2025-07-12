# 🎬 CineGemini

Una aplicación web moderna y escalable para explorar películas, construida con Next.js, React, TypeScript y Tailwind CSS. Diseñada con una arquitectura modular y componentes reutilizables para facilitar el mantenimiento y la escalabilidad.

## ✨ Características

- 🎯 **Búsqueda inteligente** con filtros avanzados
- 🎭 **Detalles completos** de películas y actores
- 📱 **Diseño responsivo** optimizado para todos los dispositivos
- ⚡ **Rendimiento optimizado** con caché y lazy loading
- 🎨 **UI moderna** con animaciones suaves
- 🔄 **Scroll horizontal** para navegación fluida
- 🔔 **Sistema de notificaciones** en tiempo real
- ⭐ **Favoritos** para guardar películas preferidas
- 🎬 **Reproducción de videos** integrada
- 🌙 **Tema oscuro** por defecto

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js App Router
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   ├── search/            # Página de búsqueda
│   ├── movie/[id]/        # Detalles de película
│   ├── person/[id]/       # Detalles de persona
│   └── people/            # Lista de personas
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI básicos
│   ├── movies/           # Componentes específicos de películas
│   ├── people/           # Componentes específicos de personas
│   └── layout/           # Componentes de layout
├── hooks/                # Custom hooks
├── utils/                # Utilidades y helpers
├── constants/            # Constantes y configuraciones
├── context/              # Contextos de React
├── lib/                  # Librerías y configuraciones
└── types.ts              # Tipos de TypeScript
```

### Principios de Diseño

- **Modularidad**: Componentes reutilizables y bien estructurados
- **Escalabilidad**: Arquitectura preparada para crecimiento
- **Mantenibilidad**: Código limpio y bien documentado
- **Performance**: Optimizaciones de rendimiento integradas
- **Accesibilidad**: Cumplimiento con estándares WCAG

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Estado**: React Hooks + Context API
- **API**: TMDB (The Movie Database)
- **Iconos**: React Icons (Feather Icons)
- **Imágenes**: Next.js Image Optimization

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/cinegemini.git
   cd cinegemini
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` y agregar tu API key de TMDB:
   ```
   NEXT_PUBLIC_TMDB_API_KEY=tu-api-key-aqui
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔧 Configuración

### Variables de Entorno

```env
# API Configuration
NEXT_PUBLIC_TMDB_API_KEY=tu-api-key-de-tmdb

# App Configuration
NEXT_PUBLIC_APP_NAME=CineGemini
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=tu-google-analytics-id
```

### Configuración de la Aplicación

El archivo `src/constants/config.ts` contiene todas las configuraciones de la aplicación:

- **Features**: Habilitar/deshabilitar funcionalidades
- **UI**: Colores, animaciones, breakpoints
- **Performance**: Configuraciones de rendimiento
- **Cache**: Configuraciones de caché
- **Error Handling**: Manejo de errores

## 🎯 Características Principales

### 1. Sistema de API Modular

```typescript
// Cliente API centralizado
import { apiClient } from '@/utils/api';

// Hooks personalizados para diferentes entidades
import { useMovies, useMovieDetails, useMovieSearch } from '@/hooks/useApi';

// Uso en componentes
const { data: movies, loading, error } = useMovies('popular');
```

### 2. Componentes Reutilizables

```typescript
// Sección de películas con scroll horizontal
import MovieSection from '@/components/movies/MovieSection';

<MovieSection
  title="Películas Populares"
  movies={popularMovies}
  icon={<FiTrendingUp />}
  loading={loading}
  error={error}
/>
```

### 3. Layouts Flexibles

```typescript
// Layouts predefinidos
import { ContainerLayout, DetailLayout } from '@/components/layout/PageLayout';

// Para páginas con contenedor
<ContainerLayout>
  <h1>Mi Página</h1>
</ContainerLayout>

// Para páginas de detalles
<DetailLayout>
  <HeroSection />
  <ContentSection />
</DetailLayout>
```

### 4. Utilidades de Formateo

```typescript
import { 
  formatDate, 
  formatRuntime, 
  formatRating,
  getImageUrl 
} from '@/utils/formatting';

// Uso
const formattedDate = formatDate('2024-01-15');
const runtime = formatRuntime(120); // "2h 0m"
const imageUrl = getImageUrl('/path/to/image.jpg', 'w500');
```

## 🎨 Componentes Principales

### MovieSection
Componente reutilizable para mostrar secciones de películas con scroll horizontal.

**Props:**
- `title`: Título de la sección
- `movies`: Array de películas
- `icon`: Icono de la sección
- `loading`: Estado de carga
- `error`: Estado de error
- `showFilter`: Mostrar botón de filtro
- `skeletonCount`: Número de skeletons

### HorizontalScroll
Componente para scroll horizontal con flechas de navegación.

**Características:**
- Flechas de navegación automáticas
- Scroll táctil en móvil
- Barra de scroll oculta
- Indicadores visuales

### useApi Hook
Hook personalizado para manejar llamadas a la API.

**Características:**
- Caché automático
- Estados de carga y error
- Prevención de llamadas duplicadas
- Reintentos automáticos

## 🔄 Flujo de Datos

1. **Componente** → Llama a hook personalizado
2. **Hook** → Usa cliente API centralizado
3. **Cliente API** → Hace llamada a TMDB
4. **Respuesta** → Se procesa y se guarda en caché
5. **Estado** → Se actualiza en el componente
6. **UI** → Se renderiza con los datos

## 🚀 Optimizaciones de Rendimiento

### 1. Caché Inteligente
- Caché en memoria con TTL configurable
- Estrategia LRU para gestión de memoria
- Caché específico por tipo de contenido

### 2. Lazy Loading
- Carga diferida de imágenes
- Componentes cargados bajo demanda
- Suspense boundaries para mejor UX

### 3. Optimización de Imágenes
- Next.js Image Optimization
- Formatos modernos (WebP, AVIF)
- Tamaños responsivos automáticos

### 4. Bundle Splitting
- Código dividido por rutas
- Componentes cargados dinámicamente
- Tree shaking automático



## 📱 Responsive Design

La aplicación está optimizada para todos los dispositivos:

- **Mobile**: 320px - 640px
- **Tablet**: 768px - 1024px
- **Desktop**: 1280px+
- **Wide**: 1536px+

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Netlify

1. Conectar repositorio a Netlify
2. Configurar build command: `npm run build`
3. Configurar variables de entorno

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [TMDB](https://www.themoviedb.org/) por proporcionar la API
- [Next.js](https://nextjs.org/) por el framework
- [Tailwind CSS](https://tailwindcss.com/) por los estilos
- [React Icons](https://react-icons.github.io/react-icons/) por los iconos

## 📞 Soporte

Si tienes alguna pregunta o problema:

- 📧 Email: soporte@cinegemini.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/cinegemini/issues)
- 📖 Documentación: [Wiki](https://github.com/tu-usuario/cinegemini/wiki)

---

**CineGemini** - Descubre el universo del cine 🎬 