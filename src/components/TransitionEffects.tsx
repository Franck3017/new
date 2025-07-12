"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TransitionEffectsProps {
  isTransitioning: boolean;
  path: string;
}

export default function TransitionEffects({ isTransitioning, path }: TransitionEffectsProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isTransitioning) {
      // Generar partículas aleatorias
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    }
  }, [isTransitioning]);

  if (!isTransitioning) return null;

  return (
    <>
      {/* Overlay de blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
      />

      {/* Partículas animadas */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
              y: `${particle.y + (Math.random() - 0.5) * 20}vh`,
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: 0,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
          />
        ))}
      </div>

      {/* Indicador de progreso circular */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-full h-full border-4 border-gray-300 border-t-blue-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </motion.div>
    </>
  );
} 