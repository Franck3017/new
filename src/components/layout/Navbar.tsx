'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useFavorites } from '@/context/FavoritesContext';
import { FiSun, FiMoon, FiHeart, FiMenu, FiX, FiUser, FiTv, FiFilm } from 'react-icons/fi';
import { ROUTES } from '@/utils/urlHelpers';


const Navbar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { totalFavoritesCount, moviesCount, tvCount, peopleCount } = useFavorites();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: ROUTES.MOVIES,
      label: 'Películas',
      icon: FiFilm,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      href: ROUTES.TV,
      label: 'Series',
      icon: FiTv,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      href: ROUTES.PEOPLE,
      label: 'Personas',
      icon: FiUser,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="backdrop-blur-sm border-b bg-transparent dark:bg-gray-900/95 border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-0">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                C
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              CineGemini
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 text-white">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive(item.href)
                      ? `${item.bgColor} ${item.color} border border-gray-600/50 shadow-lg`
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className={`h-4 w-4 ${isActive(item.href) ? item.color : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Favoritos */}
            <div className="relative group">
              <button className="relative p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-red-400 hover:bg-gray-700/50 transition-all duration-200">
                <FiHeart className="h-5 w-5" />
                {totalFavoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-slow">
                    {totalFavoritesCount > 9 ? '9+' : totalFavoritesCount}
                  </span>
                )}
              </button>

              {/* Dropdown menu */}
              <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    href={ROUTES.FAVORITES_MOVIES}
                    className="flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <span>Películas</span>
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      {moviesCount}
                    </span>
                  </Link>
                  <Link
                    href={ROUTES.FAVORITES_TV}
                    className="flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <span>Series TV</span>
                    <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                      {tvCount}
                    </span>
                  </Link>
                  <Link
                    href={ROUTES.FAVORITES_PEOPLE}
                    className="flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <span>Personas</span>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      {peopleCount}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 focus-ring"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

           
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            aria-label="Abrir menú móvil"
          >
            {isMobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50 py-4 animate-fade-in-up">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.href)
                        ? 'text-white bg-blue-500/20 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile Actions */}
              <div className="space-y-2 px-4 py-3">
                <div className="text-sm text-gray-400 px-4 py-2">Favoritos</div>
                <Link
                  href={ROUTES.FAVORITES_MOVIES}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  <span>Películas</span>
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {moviesCount}
                  </span>
                </Link>
                <Link
                  href={ROUTES.FAVORITES_TV}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  <span>Series TV</span>
                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                    {tvCount}
                  </span>
                </Link>
                <Link
                  href={ROUTES.FAVORITES_PEOPLE}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  <span>Personas</span>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    {peopleCount}
                  </span>
                </Link>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                <span className="hidden sm:inline">Tema</span>
              </button>

              
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
