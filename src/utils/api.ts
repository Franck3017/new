import { API_CONFIG, API_ENDPOINTS, DEFAULT_PARAMS } from '@/constants/api';

// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// Cliente HTTP personalizado
class ApiClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.apiKey = API_CONFIG.API_KEY;
  }

  private async request<T>(
    endpoint: string, 
    params: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      // Agregar parámetros por defecto
      const searchParams = new URLSearchParams({
        api_key: this.apiKey,
        language: DEFAULT_PARAMS.LANGUAGE,
        region: DEFAULT_PARAMS.REGION,
        include_adult: DEFAULT_PARAMS.INCLUDE_ADULT.toString(),
        ...params
      });

      url.search = searchParams.toString();

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  // Métodos para películas
  async getPopularMovies(page: number = 1) {
    return this.request(API_ENDPOINTS.MOVIES.POPULAR, { page });
  }

  async getTopRatedMovies(page: number = 1) {
    return this.request(API_ENDPOINTS.MOVIES.TOP_RATED, { page });
  }

  async getNowPlayingMovies(page: number = 1) {
    return this.request(API_ENDPOINTS.MOVIES.NOW_PLAYING, { page });
  }

  async getMovieDetails(id: string) {
    return this.request(API_ENDPOINTS.MOVIES.DETAILS(id));
  }

  async getMovieCredits(id: string) {
    return this.request(API_ENDPOINTS.MOVIES.CREDITS(id));
  }

  async getMovieVideos(id: string) {
    return this.request(API_ENDPOINTS.MOVIES.VIDEOS(id));
  }

  async getSimilarMovies(id: string, page: number = 1) {
    return this.request(API_ENDPOINTS.MOVIES.SIMILAR(id), { page });
  }

  async searchMovies(query: string, page: number = 1) {
    return this.request(API_ENDPOINTS.MOVIES.SEARCH, { 
      query, 
      page 
    });
  }

  // Métodos para personas
  async getPopularPeople(page: number = 1) {
    return this.request(API_ENDPOINTS.PEOPLE.POPULAR, { page });
  }

  async getPersonDetails(id: string) {
    return this.request(API_ENDPOINTS.PEOPLE.DETAILS(id));
  }

  async getPersonCredits(id: string) {
    return this.request(API_ENDPOINTS.PEOPLE.CREDITS(id));
  }

  async getPersonImages(id: string) {
    return this.request(API_ENDPOINTS.PEOPLE.IMAGES(id));
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Funciones de conveniencia para mantener compatibilidad
export const getPopularMovies = (page: number = 1) => apiClient.getPopularMovies(page);
export const getTopRatedMovies = (page: number = 1) => apiClient.getTopRatedMovies(page);
export const getNowPlayingMovies = (page: number = 1) => apiClient.getNowPlayingMovies(page);
export const getMovieDetails = (id: string) => apiClient.getMovieDetails(id);
export const getMovieCredits = (id: string) => apiClient.getMovieCredits(id);
export const getMovieVideos = (id: string) => apiClient.getMovieVideos(id);
export const getSimilarMovies = (id: string, page: number = 1) => apiClient.getSimilarMovies(id, page);
export const searchMovies = (query: string, page: number = 1) => apiClient.searchMovies(query, page);
export const getPopularPeople = (page: number = 1) => apiClient.getPopularPeople(page);
export const getPersonDetails = (id: string) => apiClient.getPersonDetails(id);
export const getPersonCredits = (id: string) => apiClient.getPersonCredits(id);
export const getPersonImages = (id: string) => apiClient.getPersonImages(id); 