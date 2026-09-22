/**
 * Shapes returned by the public Rick and Morty REST API.
 *
 * These types exist only inside this adapter. Nothing outside this directory
 * should depend on them.
 */
export interface UpstreamEpisode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
}

export interface UpstreamPageInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface UpstreamEpisodePage {
  info: UpstreamPageInfo;
  results: UpstreamEpisode[];
}

export interface UpstreamNamedResource {
  name: string;
  url: string;
}

export interface UpstreamCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: UpstreamNamedResource;
  location: UpstreamNamedResource;
  image: string;
}
