import React, { Suspense, lazy, useState, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';

// Componente de skeleton optimizado
const SkeletonCard = () => (
  <div className="bg-gray-800/50 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-[2/3] bg-gray-700"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

// Componente de skeleton para listas
export const SkeletonList = ({ count = 6, className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" }: { count?: number; className?: string }) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

// Componente de skeleton para scroll horizontal
export const SkeletonHorizontalScroll = ({ count = 6 }: { count?: number }) => (
  <div className="flex gap-6 overflow-x-auto pb-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
        <SkeletonCard />
      </div>
    ))}
  </div>
);

// Componente de carga con progreso
interface ProgressLoaderProps {
  progress: number;
  message?: string;
  className?: string;
}

export const ProgressLoader = ({ progress, message = "Cargando...", className = "" }: ProgressLoaderProps) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <div className="relative w-16 h-16 mb-4">
      <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
      <div 
        className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full"
        style={{
          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((progress * 360 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((progress * 360 - 90) * Math.PI / 180)}%, 50% 50%)`
        }}
      ></div>
    </div>
    <p className="text-gray-400 text-sm">{message}</p>
    <p className="text-blue-400 text-xs mt-1">{Math.round(progress * 100)}%</p>
  </div>
);

// Componente de carga con spinner
export const Spinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FiLoader className={`${sizeClasses[size]} animate-spin text-blue-500`} />
    </div>
  );
};

// Componente de carga con retry
interface RetryLoaderProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export const RetryLoader = ({ error, onRetry, className = "" }: RetryLoaderProps) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <div className="text-red-400 mb-4">
      <FiLoader className="w-12 h-12 mx-auto mb-2" />
      <p className="text-center">{error}</p>
    </div>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
    >
      Intentar de nuevo
    </button>
  </div>
);

// Componente de carga lazy con fallback
interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyLoader = ({ children, fallback, className = "" }: LazyLoaderProps) => (
  <Suspense fallback={fallback || <SkeletonList />}>
    <div className={className}>
      {children}
    </div>
  </Suspense>
);

// Hook para carga progresiva
export const useProgressiveLoading = (items: any[], batchSize = 6) => {
  const [visibleItems, setVisibleItems] = useState(batchSize);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    if (visibleItems < items.length) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleItems(prev => Math.min(prev + batchSize, items.length));
        setIsLoading(false);
      }, 100);
    }
  };

  const reset = () => {
    setVisibleItems(batchSize);
    setIsLoading(false);
  };

  return {
    visibleItems: items.slice(0, visibleItems),
    hasMore: visibleItems < items.length,
    isLoading,
    loadMore,
    reset
  };
};

// Componente de carga con virtualización básica
interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualizedList = ({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  className = "" 
}: VirtualizedListProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
        </div>
      </div>
    </div>
  );
};

// Componente de carga con intersection observer
interface IntersectionLoaderProps {
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  children: React.ReactNode;
  className?: string;
}

export const IntersectionLoader = ({ 
  onIntersect, 
  threshold = 0.1, 
  rootMargin = "100px",
  children,
  className = ""
}: IntersectionLoaderProps) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
  }, [ref, onIntersect, threshold, rootMargin]);

  return (
    <div ref={setRef} className={className}>
      {children}
    </div>
  );
}; 