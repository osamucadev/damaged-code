import type { Episode } from "../domain/episode.js";
import type { RickAndMortyClient } from "../upstream/rick-and-morty/client.js";

export interface EpisodeService {
  listEpisodes(): Promise<Episode[]>;
}

/**
 * Product rules for episodes.
 *
 * The service owns the contract order so every client, web and Flutter, sees
 * the same sequence without sorting it themselves.
 */
export function createEpisodeService(client: RickAndMortyClient): EpisodeService {
  return {
    async listEpisodes(): Promise<Episode[]> {
      const episodes = await client.fetchAllEpisodes();

      return [...episodes].sort((first, second) => first.id - second.id);
    },
  };
}
