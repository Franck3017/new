'use client';

import { useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children: React.ReactNode;
  threshold?: number;
}

const InfiniteScroll = ({ 
  onLoadMore, 
  hasMore, 
  loading, 
  children, 
  threshold = 0.8 
}: InfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin: '100px',
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return (
    <div className="relative">
      {children}
      
      {/* Elemento observador para infinite scroll */}
      <div ref={loadingRef} className="h-10 flex items-center justify-center">
        {loading && hasMore && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Cargando más películas...</span>
          </div>
        )}
        
        {!hasMore && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Has llegado al final</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll; 