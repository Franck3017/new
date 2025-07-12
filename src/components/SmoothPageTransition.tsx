"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SmoothPageTransitionProps {
  children: React.ReactNode;
}

export default function SmoothPageTransition({ children }: SmoothPageTransitionProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // Asegurar que el componente esté listo antes de mostrar animaciones
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Configuración de animación simple y fluida
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 8,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -8,
    },
  };

  const pageTransition = {
    duration: 0.25,
  };

  if (!isReady) {
    return <div style={{ minHeight: "100vh" }}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
        className="smooth-page-content"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 