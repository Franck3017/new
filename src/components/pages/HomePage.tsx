import { useState } from 'react';
import { useHomePage } from '@/hooks/useHomePage';
import { 
  MovieSection, 
  SectionDivider, 
  LoadingState, 
  SectionIcons 
} from './HomePageSections';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import APITest from '@/components/APITest';
import { useNotifications, NotificationContainer } from '@/components/Notification';

export default function HomePage() {
  const {
    // State
    popularMovies,
    topRatedMovies,
    nowPlayingMovies,
    upcomingMovies,
    popularTVShows,
    topRatedTVShows,
    onAirTVShows,
    airingTodayTVShows,
    activeSection,
    isLoading,
    hasData,
    loadInitialData
  } = useHomePage();

  const { notifications } = useNotifications();
  const [retrying, setRetrying] = useState(false);

  // Si está cargando, mostrar estado de carga
  if (isLoading) {
    return <LoadingState />;
  }

  // Si no hay datos, mostrar estado de error
  if (!hasData) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No se pudieron cargar los datos</h1>
          <p className="text-gray-400 mb-6">Intenta recargar la página</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={async () => {
              setRetrying(true);
              await loadInitialData();
              setRetrying(false);
            }}
            disabled={retrying}
          >
            {retrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Hero Section - Fuera del contenedor principal para full-width */}
      <HeroSection />

      <main className="container mx-auto px-4 pt-12 pb-8">
        {/* Sección de Películas */}
        <SectionDivider title="PELÍCULAS" />
        
        {/* Películas Populares */}
        <MovieSection
          title="Películas Populares"
          movies={popularMovies}
          icon={SectionIcons.trending}
          sectionKey="popular"
          activeSection={activeSection}
        />

        {/* Mejor Valoradas */}
        <MovieSection
          title="Mejor Valoradas"
          movies={topRatedMovies}
          icon={SectionIcons.star}
          sectionKey="top_rated"
          activeSection={activeSection}
        />

        {/* Actualmente en Cines */}
        <MovieSection
          title="Actualmente en Cines"
          movies={nowPlayingMovies}
          icon={SectionIcons.play}
          sectionKey="now_playing"
          activeSection={activeSection}
        />

        {/* Próximas Películas */}
        <MovieSection
          title="Próximas Películas"
          movies={upcomingMovies}
          icon={SectionIcons.calendar}
          sectionKey="upcoming"
          activeSection={activeSection}
        />

        {/* Sección de Series */}
        <SectionDivider title="SERIES DE TELEVISIÓN" />

        {/* Series Populares */}
        <MovieSection
          title="Series de TV Populares"
          movies={popularTVShows}
          icon={SectionIcons.tv}
          sectionKey="popularTV"
          activeSection={activeSection}
        />

        {/* Series Mejor Valoradas */}
        <MovieSection
          title="Series de TV Mejor Valoradas"
          movies={topRatedTVShows}
          icon={SectionIcons.star}
          sectionKey="topRatedTV"
          activeSection={activeSection}
        />

        {/* Series en Emisión */}
        <MovieSection
          title="Series Actualmente en Emisión"
          movies={onAirTVShows}
          icon={SectionIcons.play}
          sectionKey="onAirTV"
          activeSection={activeSection}
        />

        {/* Series que se Emiten Hoy */}
        <MovieSection
          title="Series que se Emiten Hoy"
          movies={airingTodayTVShows}
          icon={SectionIcons.calendar}
          sectionKey="airingTodayTV"
          activeSection={activeSection}
        />

        {/* API Test Component - Temporal para debugging */}
        <div className="mt-16">
          <APITest />
        </div>
      </main>

      {/* Contenedor de notificaciones */}
      <NotificationContainer notifications={notifications} />

      {/* Footer */}
      <Footer />
    </>
  );
} 