// Layout components
export * from './layout';

// Feature components
export * from './features/movies';
export * from './features/people';
export * from './features/search';

// Common components
export * from './common';

// Individual components (legacy - will be moved to appropriate folders)
export { default as CastMemberCard } from './CastMemberCard';
export { default as CreditCard } from './CreditCard';
export { default as FloatingNavigation } from './FloatingNavigation';
export { default as HeroSection } from './HeroSection';
export { default as PageTransitionWrapper } from './PageTransitionWrapper';
export { default as SmoothPageTransition } from './SmoothPageTransition';
export { default as TransitionEffects } from './TransitionEffects';
export { default as VirtualizedList } from './VirtualizedList';

// UI components (moved to ui folder)
export * from './ui';

// Page components (direct exports)
export { default as HomePage } from './pages/HomePage';
export { 
  MovieSection, 
  SectionDivider, 
  LoadingSkeleton, 
  LoadingState, 
  SectionIcons 
} from './pages/HomePageSections';
export { default as MoviesPage } from './pages/MoviesPage';
export { default as TVShowPage } from './pages/TVShowPage';
export { PeoplePageHeader } from './pages/PeoplePageHeader';
export { PeoplePagePagination } from './pages/PeoplePagePagination';
export { PeoplePageFilters } from './pages/PeoplePageFilters'; 