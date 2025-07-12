'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome,
  FiFilm, 
  FiTv, 
  FiUser, 
  FiSearch, 
  FiHeart, 
  FiArrowUp,
  FiMenu,
  FiX,
  FiBookmark,
  FiTrendingUp,
  FiStar
} from 'react-icons/fi';
import { useFavorites } from '@/context/FavoritesContext';

const FloatingNavigation = () => {
  const pathname = usePathname();
  const { totalFavoritesCount } = useFavorites();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      label: 'Inicio',
      href: '/',
      icon: FiHome,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Películas',
      href: '/movies',
      icon: FiFilm,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Series',
      href: '/series',
      icon: FiTv,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      label: 'Personas',
      href: '/personas',
      icon: FiUser,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Buscar',
      href: '/search',
      icon: FiSearch,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Favoritos',
      href: '/favoritos',
      icon: FiHeart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      badge: totalFavoritesCount > 0 ? totalFavoritesCount : undefined
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Botón principal flotante */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Navegación rápida"
      >
        {isExpanded ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>

      {/* Acciones flotantes */}
      {isExpanded && (
        <div className="fixed bottom-20 right-6 z-40 space-y-3 animate-fade-in-up">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group relative flex items-center gap-3 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                  isActive(action.href)
                    ? `${action.bgColor} ${action.color} border-2 border-gray-600/50`
                    : 'bg-gray-800/95 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/95'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <Icon className={`h-5 w-5 ${isActive(action.href) ? action.color : ''}`} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                {action.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {action.badge > 9 ? '9+' : action.badge}
                  </span>
                )}
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Ir a {action.label}
                  <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900/95"></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Botón de scroll to top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 z-50 p-4 bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700/95 text-gray-300 hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Ir arriba"
      >
        <FiArrowUp className="h-6 w-6" />
      </button>
    </>
  );
};

export default FloatingNavigation; 