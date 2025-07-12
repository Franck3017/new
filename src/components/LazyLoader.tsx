'use client';

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';
import { LOADING_CONFIG } from '@/lib/performance';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

// Componente de skeleton optimizado
const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-800/50 rounded-lg ${className}`}>
    <div className="aspect-[2/3] bg-gray-700"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

// Componente de lista de skeletons
const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ 
  count = LOADING_CONFIG.SKELETON_COUNT, 
  className = '' 
}) => (
  <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonLoader key={index} />
    ))}
  </div>
);

// Hook para lazy loading con intersection observer
function useLazyLoad(options: IntersectionObserverOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  const markAsLoaded = useCallback(() => {
    setHasLoaded(true);
  }, []);

  return {
    elementRef,
    isVisible,
    hasLoaded,
    markAsLoaded
  };
}

// Componente principal de lazy loading
const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = <SkeletonLoader />,
  threshold = 0.1,
  className = '',
  onLoad,
  onError
}) => {
  const { elementRef, isVisible, hasLoaded, markAsLoaded } = useLazyLoad({
    threshold,
    rootMargin: '100px'
  });

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      markAsLoaded();
      onLoad?.();
    }
  }, [isVisible, hasLoaded, markAsLoaded, onLoad]);

  if (error) {
    onError?.(error);
    return (
      <div className={`text-center p-4 text-red-500 ${className}`}>
        <p>Error al cargar el contenido</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? (
        <ErrorBoundary onError={(error) => setError(error)}>
          {children}
        </ErrorBoundary>
      ) : (
        fallback
      )}
    </div>
  );
};

// Error boundary para manejar errores de carga
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 text-red-500">
          <p>Algo salió mal</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente para lazy loading de imágenes
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/placeholder-movie.webp',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const { elementRef, isVisible } = useLazyLoad({ threshold: 0.1 });

  useEffect(() => {
    if (isVisible && !imageSrc) {
      setImageSrc(src);
    }
  }, [isVisible, src, imageSrc]);

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    } else {
      onError?.();
    }
  };

  return (
    <div ref={elementRef} className={className}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${hasError ? 'opacity-50' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <SkeletonLoader />
      )}
    </div>
  );
};

// Hook para carga progresiva
function useProgressiveLoading<T>(
  items: T[],
  options: {
    batchSize?: number;
    initialLoad?: number;
    delay?: number;
  } = {}
) {
  const {
    batchSize = LOADING_CONFIG.BATCH_SIZE,
    initialLoad = LOADING_CONFIG.INITIAL_LOAD,
    delay = 100
  } = options;

  const [visibleItems, setVisibleItems] = useState(initialLoad);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const loadMore = useCallback(() => {
    if (visibleItems >= items.length || isLoading) return;

    setIsLoading(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, delay);
  }, [visibleItems, items.length, isLoading, batchSize, delay]);

  const reset = useCallback(() => {
    setVisibleItems(initialLoad);
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [initialLoad]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    visibleItems: items.slice(0, visibleItems),
    hasMore: visibleItems < items.length,
    isLoading,
    loadMore,
    reset,
    totalItems: items.length,
    loadedCount: visibleItems
  };
}

// Componente de lista con carga progresiva
interface ProgressiveListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  batchSize?: number;
  initialLoad?: number;
  className?: string;
  onLoadMore?: () => void;
}

function ProgressiveList<T>({
  items,
  renderItem,
  batchSize,
  initialLoad,
  className = '',
  onLoadMore
}: ProgressiveListProps<T>) {
  const {
    visibleItems,
    hasMore,
    isLoading,
    loadMore
  } = useProgressiveLoading(items, { batchSize, initialLoad });

  useEffect(() => {
    if (hasMore && !isLoading) {
      onLoadMore?.();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visibleItems.map((item, index) => (
          <LazyLoader key={index} fallback={<SkeletonLoader />}>
            {renderItem(item, index)}
          </LazyLoader>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}

export {
  LazyLoader,
  LazyImage,
  SkeletonLoader,
  SkeletonList,
  ProgressiveList,
  useProgressiveLoading
}; 