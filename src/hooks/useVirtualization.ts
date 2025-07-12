import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

interface VirtualizationReturn<T> {
  virtualItems: Array<{
    index: number;
    data: T;
    offsetTop: number;
    height: number;
  }>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollToIndex: (index: number) => void;
  scrollToItem: (predicate: (item: T) => boolean) => void;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): VirtualizationReturn<T> {
  const { itemHeight, containerHeight, overscan = 5, threshold = 100 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  // Calcular índices virtuales
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor(scrollTop / itemHeight) + visibleCount + overscan
    );
    
    return {
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Generar items virtuales
  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        result.push({
          index: i,
          data: items[i],
          offsetTop: i * itemHeight,
          height: itemHeight
        });
      }
    }
    return result;
  }, [startIndex, endIndex, items, itemHeight]);

  // Manejar scroll con throttling
  const handleScroll = useCallback((event: Event) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const target = event.target as HTMLElement;
      setScrollTop(target.scrollTop);
    });
  }, []);

  // Configurar event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }
  }, [handleScroll]);

  // Función para scroll a un índice específico
  const scrollToIndex = useCallback((index: number) => {
    const newScrollTop = index * itemHeight;
    setScrollTop(newScrollTop);
    
    if (containerRef.current) {
      containerRef.current.scrollTop = newScrollTop;
    }
  }, [itemHeight]);

  // Función para scroll a un elemento específico
  const scrollToItem = useCallback((predicate: (item: T) => boolean) => {
    const index = items.findIndex(predicate);
    if (index !== -1) {
      scrollToIndex(index);
    }
  }, [items, scrollToIndex]);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollTop,
    setScrollTop,
    containerRef,
    scrollToIndex,
    scrollToItem
  };
}

// Hook para infinite scroll virtualizado
export function useInfiniteVirtualization<T>(
  items: T[],
  options: VirtualizationOptions & {
    onLoadMore: () => Promise<void>;
    hasMore: boolean;
    loading: boolean;
  }
) {
  const virtualization = useVirtualization(items, options);
  const { onLoadMore, hasMore, loading } = options;

  // Detectar cuando estamos cerca del final
  useEffect(() => {
    const { endIndex, scrollTop, containerRef } = virtualization;
    const container = containerRef.current;
    
    if (!container || loading || !hasMore) return;

    const isNearEnd = endIndex >= items.length - 10; // 10 items antes del final
    const scrollBottom = scrollTop + container.clientHeight;
    const totalHeight = items.length * options.itemHeight;
    
    if (isNearEnd && scrollBottom >= totalHeight - (options.threshold || 100)) {
      onLoadMore();
    }
  }, [virtualization.endIndex, virtualization.scrollTop, items.length, loading, hasMore, onLoadMore, options.itemHeight, options.threshold]);

  return virtualization;
}

// Hook para grid virtualizado
export function useVirtualizedGrid<T>(
  items: T[],
  options: {
    itemWidth: number;
    itemHeight: number;
    containerWidth: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const { itemWidth, itemHeight, containerWidth, containerHeight, overscan = 5 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calcular layout del grid
  const { columns, rows, totalHeight, virtualItems } = useMemo(() => {
    const columns = Math.floor(containerWidth / itemWidth);
    const rows = Math.ceil(items.length / columns);
    const totalHeight = rows * itemHeight;
    
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = Math.min(
      rows - 1,
      Math.floor(scrollTop / itemHeight) + Math.ceil(containerHeight / itemHeight) + overscan
    );
    
    const virtualItems = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          virtualItems.push({
            index,
            data: items[index],
            row,
            col,
            offsetTop: row * itemHeight,
            offsetLeft: col * itemWidth,
            width: itemWidth,
            height: itemHeight
          });
        }
      }
    }
    
    return { columns, rows, totalHeight, virtualItems };
  }, [items, containerWidth, containerHeight, itemWidth, itemHeight, scrollTop, overscan]);

  return {
    virtualItems,
    totalHeight,
    columns,
    rows,
    scrollTop,
    setScrollTop,
    containerRef
  };
} 