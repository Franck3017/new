'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiSearch, 
  FiArrowLeft, 
  FiHeart, 
  FiPlay,
  FiStar,
  FiTrendingUp,
  FiZap,
  FiCompass,
  FiRefreshCw,
  FiExternalLink
} from 'react-icons/fi';

export default function NotFound() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, size: number}>>([]);
  const [countdown, setCountdown] = useState(10);

  // Efecto de partículas flotantes
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1
      }));
      setParticles(newParticles);
    };

    generateParticles();

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.x <= 0 || particle.x >= window.innerWidth ? -particle.vx : particle.vx,
        vy: particle.y <= 0 || particle.y >= window.innerHeight ? -particle.vy : particle.vy
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Efecto de seguimiento del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Countdown para redirección automática
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/');
    }
  }, [countdown, router]);

  // Efecto de parallax en el fondo
  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  };

  const quickActions = [
    { 
      icon: FiHome, 
      label: 'Inicio', 
      href: '/', 
      color: 'from-blue-500 to-blue-600',
      description: 'Volver al inicio'
    },
    { 
      icon: FiSearch, 
      label: 'Buscar', 
      href: '/search', 
      color: 'from-green-500 to-green-600',
      description: 'Buscar películas'
    },
    { 
      icon: FiHeart, 
      label: 'Favoritos', 
      href: '/favorites', 
      color: 'from-red-500 to-red-600',
      description: 'Ver favoritos'
    },
    { 
      icon: FiCompass, 
      label: 'Explorar', 
      href: '/people', 
      color: 'from-purple-500 to-purple-600',
      description: 'Explorar personas'
    }
  ];

  const popularSections = [
    { icon: FiTrendingUp, label: 'Películas Populares', color: 'text-blue-400' },
    { icon: FiStar, label: 'Mejor Valoradas', color: 'text-yellow-400' },
    { icon: FiPlay, label: 'En Cines', color: 'text-green-400' },
    { icon: FiZap, label: 'Próximas', color: 'text-red-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 relative overflow-hidden">
      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.id * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Efecto de luz que sigue al mouse */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          opacity: isHovering ? 0.8 : 0.3
        }}
      />

      {/* Fondo con parallax */}
      <div 
        className="absolute inset-0 opacity-5"
        style={parallaxStyle}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center items-center">
        
        {/* Número 404 con efectos */}
        <div className="text-center mb-8">
          <div className="relative">
            {/* Número principal */}
            <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text animate-pulse">
              404
            </h1>
            
            {/* Efecto de sombra */}
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-gray-800/20 blur-sm -z-10">
              404
            </div>
            
            {/* Efecto de brillo */}
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-white/10 blur-md -z-20 animate-pulse">
              404
            </div>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¡Oops! Página no encontrada
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Parece que te has aventurado en territorio desconocido. 
            La página que buscas no existe o ha sido movida a otra dimensión cinematográfica.
          </p>
          
          {/* Countdown */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-8">
            <p className="text-gray-400 mb-2">Redirección automática en:</p>
            <div className="text-3xl font-bold text-blue-400">{countdown}s</div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-4xl">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} blur-xl`} />
                </div>
                
                <div className="relative z-10 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{action.label}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Botones de acción principales */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-xl hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group"
          >
            <FiArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Volver Atrás
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <FiHome className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            Ir al Inicio
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-xl hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group"
          >
            <FiRefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
            Recargar
          </button>
        </div>

        {/* Secciones populares */}
        <div className="w-full max-w-4xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Explora nuestras secciones populares
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.label}
                  className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 text-center hover:border-gray-600/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-3 ${section.color} group-hover:scale-110 transition-transform duration-300`} />
                  <p className="text-sm text-gray-300 font-medium">{section.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 max-w-2xl">
            <h4 className="text-lg font-semibold text-white mb-3">
              ¿Necesitas ayuda?
            </h4>
            <p className="text-gray-400 mb-4">
              Si crees que esto es un error, puedes contactarnos o explorar nuestro sitio.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/search"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                <FiSearch className="h-4 w-4" />
                Buscar películas
              </Link>
              <Link
                href="/people"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                <FiCompass className="h-4 w-4" />
                Explorar personas
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                <FiExternalLink className="h-4 w-4" />
                Reportar problema
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Efecto de ondas en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      
      {/* Efecto de ondas animadas */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <div className="relative h-32">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}
