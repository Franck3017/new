'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { IMAGE_CONFIG } from '@/lib/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  fill?: boolean;
  style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = IMAGE_CONFIG.QUALITY,
  placeholder = IMAGE_CONFIG.PLACEHOLDER_BLUR ? 'blur' : 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/placeholder-movie.webp',
  loading = IMAGE_CONFIG.LAZY_LOADING ? 'lazy' : 'eager',
  fill = false,
  style,
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Optimizar URL de imagen
  const optimizedSrc = useMemo(() => {
    if (!src || src === 'null' || src === 'undefined') {
      return fallbackSrc;
    }

    // Si ya es una URL completa, usarla tal como está
    if (src.startsWith('http')) {
      return src;
    }

    // Si es una ruta relativa de TMDB, optimizarla
    if (src.includes('image.tmdb.org')) {
      // Determinar el tamaño óptimo basado en el uso
      let optimalSize = IMAGE_CONFIG.SIZES.POSTER;
      
      if (width && width > 500) {
        optimalSize = IMAGE_CONFIG.SIZES.BACKDROP;
      } else if (width && width > 200) {
        optimalSize = IMAGE_CONFIG.SIZES.POSTER;
      } else {
        optimalSize = IMAGE_CONFIG.SIZES.THUMBNAIL;
      }

      // Reemplazar el tamaño en la URL
      return src.replace(/\/w\d+/, `/${optimalSize}`);
    }

    return src;
  }, [src, width, fallbackSrc]);

  // Manejar carga exitosa
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Manejar error de carga
  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    } else {
      setIsLoading(false);
      onError?.();
    }
  }, [imageSrc, fallbackSrc, onError]);

  // Generar blur data URL si no se proporciona
  const blurData = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    
    // Generar un blur data URL simple para TMDB images
    if (optimizedSrc.includes('image.tmdb.org')) {
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    }
    
    return undefined;
  }, [blurDataURL, optimizedSrc]);

  // Clases CSS dinámicas
  const imageClasses = useMemo(() => {
    const baseClasses = 'transition-opacity duration-300';
    const loadingClasses = isLoading ? 'opacity-0' : 'opacity-100';
    const errorClasses = hasError ? 'opacity-50' : '';
    
    return `${baseClasses} ${loadingClasses} ${errorClasses} ${className}`.trim();
  }, [isLoading, hasError, className]);

  // Configuración de imagen
  const imageProps = useMemo(() => {
    const props: any = {
      src: optimizedSrc,
      alt,
      className: imageClasses,
      quality,
      sizes,
      priority,
      loading,
      onLoad: handleLoad,
      onError: handleError,
      style,
    };

    if (fill) {
      props.fill = true;
    } else {
      if (width) props.width = width;
      if (height) props.height = height;
    }

    if (placeholder === 'blur' && blurData) {
      props.placeholder = 'blur';
      props.blurDataURL = blurData;
    }

    return props;
  }, [
    optimizedSrc,
    alt,
    imageClasses,
    quality,
    sizes,
    priority,
    loading,
    handleLoad,
    handleError,
    style,
    fill,
    width,
    height,
    placeholder,
    blurData,
  ]);

  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
      <Image {...imageProps} />
      
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-gray-500 text-sm text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Imagen no disponible</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OptimizedImage); 