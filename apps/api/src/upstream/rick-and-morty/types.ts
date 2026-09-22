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
