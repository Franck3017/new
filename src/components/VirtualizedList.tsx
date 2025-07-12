'use client';

import React, { useCallback, useMemo } from 'react';
import { useVirtualization, useVirtualizedGrid } from '@/hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  scrollToIndex
}: VirtualizedListProps<T>) {
  
  const {
    virtualItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    containerRef,
    scrollToIndex: scrollToIndexFn
  } = useVirtualization(items, {
    itemHeight,
    containerHeight,
    overscan
  });

  // Scroll a índice específico si se proporciona
  React.useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0) {
      scrollToIndexFn(scrollToIndex);
    }
  }, [scrollToIndex, scrollToIndexFn]);

  // Notificar cambios de scroll
  React.useEffect(() => {
    onScroll?.(scrollTop);
  }, [scrollTop, onScroll]);

  // Renderizar items virtuales
  const renderedItems = useMemo(() => {
    return virtualItems.map(({ index, data, offsetTop }) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          top: offsetTop,
          height: itemHeight,
          width: '100%'
        }}
      >
        {renderItem(data, index)}
      </div>
    ));
  }, [virtualItems, itemHeight, renderItem]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: containerHeight,
        position: 'relative'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {renderedItems}
      </div>
    </div>
  );
}

export default React.memo(VirtualizedList) as <T>(
  props: VirtualizedListProps<T>
) => React.ReactElement;

// Componente de grid virtualizado
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedGridProps<T>) {
  
  const {
    virtualItems,
    totalHeight,
    columns,
    containerRef
  } = useVirtualizedGrid(items, {
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight,
    overscan
  });

  // Renderizar items del grid
  const renderedItems = useMemo(() => {
    return virtualItems.map(({ index, data, offsetTop, offsetLeft }) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          top: offsetTop,
          left: offsetLeft,
          width: itemWidth,
          height: itemHeight
        }}
      >
        {renderItem(data, index)}
      </div>
    ));
  }, [virtualItems, itemWidth, itemHeight, renderItem]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: containerHeight,
        position: 'relative'
      }}
    >
      <div 
        style={{ 
          height: totalHeight, 
          position: 'relative',
          width: columns * itemWidth
        }}
      >
        {renderedItems}
      </div>
    </div>
  );
}

export { VirtualizedGrid }; 