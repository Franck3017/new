'use client';

import Link from 'next/link';
import { 
  FiHeart, 
  FiGithub, 
  FiTwitter, 
  FiInstagram, 
  FiMail, 
  FiExternalLink,
  FiTv,
  FiFilm,
  FiUser,
  FiSearch,
  FiStar,
  FiTrendingUp,
  FiPlay,
  FiCalendar,
  FiAward,
  FiZap
} from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Películas', href: '/movies', icon: FiFilm },
    { name: 'Series TV', href: '/tv', icon: FiTv },
    { name: 'Personas', href: '/people', icon: FiUser },
    { name: 'Búsqueda', href: '/search', icon: FiSearch },
  ];

  const categories = [
    { name: 'Populares', href: '/movies', icon: FiTrendingUp },
    { name: 'Mejor Valoradas', href: '/movies', icon: FiStar },
    { name: 'Próximamente', href: '/movies', icon: FiCalendar },
    { name: 'En Cines', href: '/movies', icon: FiPlay },
  ];

  const favorites = [
    { name: 'Mis Películas', href: '/favorites', icon: FiHeart },
    { name: 'Mis Series', href: '/favorites/tv', icon: FiTv },
    { name: 'Mis Personas', href: '/favorites/people', icon: FiUser },
  ];

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: FiGithub },
    { name: 'Twitter', href: 'https://twitter.com', icon: FiTwitter },
    { name: 'Instagram', href: 'https://instagram.com', icon: FiInstagram },
    { name: 'Contacto', href: 'mailto:contact@cinegemini.com', icon: FiMail },
  ];

  return (
    <footer className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50">
      <div className="container mx-auto px-4 py-12">
        {/* Contenido principal */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FiSearch className="h-5 w-5 text-blue-400" />
              Explorar
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FiTrendingUp className="h-5 w-5 text-purple-400" />
              Categorías
            </h3>
            <ul className="space-y-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <li key={category.name}>
                    <Link
                      href={category.href}
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Favoritos */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FiHeart className="h-5 w-5 text-red-400" />
              Favoritos
            </h3>
            <ul className="space-y-3">
              {favorites.map((favorite) => {
                const Icon = favorite.icon;
                return (
                  <li key={favorite.name}>
                    <Link
                      href={favorite.href}
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm">{favorite.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FiZap className="h-5 w-5 text-gray-400" />
              Conecta
            </h3>
            <div className="space-y-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-200 group"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm">{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} CineGemini. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Desarrollado con ❤️ usando Next.js y React
              </p>
            </div>

            {/* Enlaces legales */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Términos
              </Link>
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Acerca de
              </Link>
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span>Powered by TMDB</span>
                <FiExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">Sistema Activo</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 