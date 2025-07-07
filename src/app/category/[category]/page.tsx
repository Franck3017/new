'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCategoryMovies } from '@/hooks/useCategoryMovies';
import { categoryConfig } from '@/constants/categoryConfig';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { CategoryControls } from '@/components/category/CategoryControls';
import { CategoryContent } from '@/components/category/CategoryContent';
import { NotificationContainer } from '@/components/Notification';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const config = categoryConfig[category];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hook personalizado para manejar la lógica de películas
  const {
    movies,
    filteredMovies,
    loading,
    error,
    hasMore,
    sortBy,
    sortOrder,
    searchQuery,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    loadMore,
    retry,
  } = useCategoryMovies({ config, category });

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Categoría no encontrada</h1>
          <p className="text-gray-400">La categoría solicitada no existe.</p>
        </div>
      </div>
    );
  }

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NotificationContainer notifications={[]} />
      
      {/* Header de la categoría */}
      <CategoryHeader
        title={config.title}
        description={config.description}
        color={config.color}
        icon={<IconComponent className="w-8 h-8" />}
        moviesCount={movies.length}
        filteredCount={filteredMovies.length}
      />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles */}
        <CategoryControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          categoryTitle={config.title}
        />

        {/* Contenido */}
        <CategoryContent
          movies={filteredMovies}
          loading={loading}
          error={error}
          viewMode={viewMode}
          hasMore={hasMore}
          onRetry={retry}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
} 