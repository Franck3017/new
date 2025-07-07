// Utilidades de formateo

/**
 * Formatea una fecha en formato legible
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  try {
    return new Date(dateString).toLocaleDateString('es-ES', options || defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea la duración de una película en horas y minutos
 */
export const formatRuntime = (minutes: number): string => {
  if (!minutes || minutes <= 0) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

/**
 * Formatea un número de votos en formato legible (ej: 1.2K, 1.5M)
 */
export const formatVoteCount = (count: number): string => {
  if (!count || count <= 0) return '0';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  
  return count.toString();
};

/**
 * Formatea un rating con un decimal
 */
export const formatRating = (rating: number): string => {
  if (!rating || rating <= 0) return 'N/A';
  return rating.toFixed(1);
};

/**
 * Calcula la edad basada en fecha de nacimiento
 */
export const calculateAge = (birthday: string, deathday?: string | null): number => {
  if (!birthday) return 0;
  
  const birthDate = new Date(birthday);
  const endDate = deathday ? new Date(deathday) : new Date();
  
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = endDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Formatea el texto del género
 */
export const getGenderText = (gender: number): string => {
  switch (gender) {
    case 1: return 'Femenino';
    case 2: return 'Masculino';
    default: return 'No especificado';
  }
};

/**
 * Trunca texto a una longitud específica
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatea un número de popularidad
 */
export const formatPopularity = (popularity: number): string => {
  if (!popularity || popularity <= 0) return '0';
  return popularity.toFixed(1);
};

/**
 * Genera una URL de imagen de TMDB
 */
export const getImageUrl = (path: string, size: string = 'w500'): string => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Formatea un presupuesto en formato de moneda
 */
export const formatBudget = (budget: number): string => {
  if (!budget || budget <= 0) return 'N/A';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(budget);
};

/**
 * Formatea ingresos en formato de moneda
 */
export const formatRevenue = (revenue: number): string => {
  if (!revenue || revenue <= 0) return 'N/A';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(revenue);
}; 