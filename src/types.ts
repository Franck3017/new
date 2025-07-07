export interface Movie {
  id: number;
  title?: string; // Para películas
  name?: string; // Para series de TV
  poster_path: string;
  release_date?: string; // Para películas
  first_air_date?: string; // Para series de TV
  tagline?: string; // Tagline de la película
  overview: string;
  vote_average: number;
  popularity: number;
  genres?: { id: number; name: string }[];
  runtime?: number;
  backdrop_path: string;
  media_type?: 'movie' | 'tv';
}

export interface MoviesResponse {
  results: Movie[];
  total_pages: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  popularity?: number;
  known_for_department?: string;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface VideosResponse {
  results: Video[];
}

// Interfaces para Personas
export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  deathday: string | null;
  place_of_birth: string;
  profile_path: string;
  popularity: number;
  known_for: Array<{
    id: number;
    title: string;
    name: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    media_type: string;
  }>;
  known_for_department: string;
  gender: number;
  adult: boolean;
  imdb_id: string;
  homepage: string;
  also_known_as: string[];
  external_ids: {
    facebook_id: string;
    instagram_id: string;
    twitter_id: string;
    youtube_id: string;
  };
}

export interface PersonCredits {
  cast: Array<{
    id: number;
    title: string;
    character: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    media_type: string;
    popularity: number;
  }>;
  crew: Array<{
    id: number;
    title: string;
    job: string;
    department: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    media_type: string;
    popularity: number;
  }>;
}

export interface PersonImages {
  profiles: Array<{
    file_path: string;
    aspect_ratio: number;
    height: number;
    width: number;
  }>;
}

export interface PeopleResponse {
  results: Person[];
  total_pages: number;
}
