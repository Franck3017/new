"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export interface PageTransitionState {
  isTransitioning: boolean;
  currentPath: string;
  previousPath: string | null;
  transitionType: "forward" | "backward" | "same";
}

export function usePageTransition() {
  const pathname = usePathname();
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    currentPath: pathname,
    previousPath: null,
    transitionType: "same",
  });

  // Detectar el tipo de transición basado en la profundidad de la ruta
  const getTransitionType = useCallback((current: string, previous: string | null) => {
    if (!previous) return "same";
    
    const currentDepth = current.split("/").length;
    const previousDepth = previous.split("/").length;
    
    if (currentDepth > previousDepth) return "forward";
    if (currentDepth < previousDepth) return "backward";
    return "same";
  }, []);

  // Obtener la configuración de animación basada en el tipo de transición
  const getTransitionConfig = useCallback((type: string, transitionType: "forward" | "backward" | "same") => {
    const baseConfig = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4 }
    };

    switch (type) {
      case "detail":
        return {
          ...baseConfig,
          initial: { 
            opacity: 0, 
            scale: 0.95, 
            y: transitionType === "forward" ? 20 : -20 
          },
          exit: { 
            opacity: 0, 
            scale: 1.05, 
            y: transitionType === "forward" ? -20 : 20 
          },
          transition: { duration: 0.5 }
        };
      case "search":
        return {
          ...baseConfig,
          initial: { 
            opacity: 0, 
            x: transitionType === "forward" ? -30 : 30 
          },
          exit: { 
            opacity: 0, 
            x: transitionType === "forward" ? 30 : -30 
          },
          transition: { duration: 0.3 }
        };
      default:
        return {
          ...baseConfig,
          initial: { 
            opacity: 0, 
            y: transitionType === "forward" ? 20 : -20 
          },
          exit: { 
            opacity: 0, 
            y: transitionType === "forward" ? -20 : 20 
          }
        };
    }
  }, []);

  useEffect(() => {
    if (pathname !== state.currentPath) {
      const transitionType = getTransitionType(pathname, state.currentPath);
      
      setState(prev => ({
        isTransitioning: true,
        currentPath: pathname,
        previousPath: prev.currentPath,
        transitionType,
      }));

      // Simular tiempo de transición
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isTransitioning: false,
        }));
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, state.currentPath, getTransitionType]);

  return {
    ...state,
    getTransitionConfig,
  };
} 