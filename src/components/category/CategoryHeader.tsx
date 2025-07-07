import { ReactNode } from 'react';

interface CategoryHeaderProps {
  title: string;
  description: string;
  color: string;
  icon: ReactNode;
  moviesCount: number;
  filteredCount: number;
}

export const CategoryHeader = ({
  title,
  description,
  color,
  icon,
  moviesCount,
  filteredCount
}: CategoryHeaderProps) => {
  return (
    <div className={`bg-gradient-to-r ${color} py-16 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <h1 className="text-4xl font-bold">{title}</h1>
        </div>
        <p className="text-xl text-white/90 max-w-3xl">{description}</p>
        <p className="text-white/70 mt-2">
          {moviesCount > 0 && `Mostrando ${filteredCount} de ${moviesCount} películas`}
        </p>
      </div>
    </div>
  );
}; 