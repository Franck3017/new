'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children: React.ReactNode;
  threshold?: number;
  loadingText?: string;
  endText?: string;
  error?: string | null;
  onRetry?: () => void;
}

const InfiniteScroll = ({ 
  onLoadMore, 
  hasMore, 
  loading, 
  children, 
  threshold = 0.8,
  loadingText = "Cargando más contenido...",
  endText = "Has llegado al final",
  error = null,
  onRetry
}: InfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      const isIntersecting = target.isIntersecting;
      setIsVisible(isIntersecting);
      
      if (isIntersecting && hasMore && !loading && !error) {
        // Delay para transición suave y evitar múltiples llamadas
        const timeoutId = setTimeout(() => {
          setLoadAttempts(prev => prev + 1);
          onLoadMore();
        }, 200);
        
        return () => clearTimeout(timeoutId);
      }
    },
    [hasMore, loading, onLoadMore, error]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin: '200px', // Aumentado para mejor detección
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  // Reset load attempts when error is cleared
  useEffect(() => {
    if (!error) {
      setLoadAttempts(0);
    }
  }, [error]);

  const renderLoadingState = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex items-center gap-2 text-red-400">
            <FiAlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Error al cargar</span>
          </div>
          <p className="text-gray-400 text-sm text-center max-w-md">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      );
    }

    if (loading && hasMore) {
      return (
        <div className="flex items-center justify-center gap-3 py-6 animate-fade-in">
          <div className="relative">
            <div className="w-6 h-6 border-2 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-300 text-sm font-medium">{loadingText}</span>
            {loadAttempts > 0 && (
              <span className="text-gray-500 text-xs">Cargando más contenido...</span>
            )}
          </div>
        </div>
      );
    }

    if (!hasMore) {
      return (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="flex items-center gap-2 text-green-400">
            <FiCheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Contenido completo</span>
          </div>
          <p className="text-gray-400 text-sm">{endText}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      {children}
      
      {/* Elemento observador para infinite scroll */}
      <div 
        ref={loadingRef} 
        className={`transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-50'
        }`}
      >
        {renderLoadingState()}
      </div>
    </div>
  );
};

export default InfiniteScroll; 