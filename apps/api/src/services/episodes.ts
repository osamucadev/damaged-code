import type { Character } from "../domain/character.js";
import type { Episode } from "../domain/episode.js";
import type { RickAndMortyClient } from "../upstream/rick-and-morty/client.js";

export interface EpisodeService {
  listEpisodes(): Promise<Episode[]>;
  getEpisode(episodeId: number): Promise<Episode>;
  listEpisodeCharacters(episodeId: number): Promise<Character[]>;
}

/*
 * Alphabetical ordering is part of the product contract, so it is applied once
 * here rather than in each client. The collator gives a stable, locale
 * independent order, and the id breaks ties between identical names.
 */
const byName = new Intl.Collator("en", { sensitivity: "base", numeric: true });

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

    getEpisode(episodeId: number): Promise<Episode> {
      return client.fetchEpisode(episodeId);
    },

    async listEpisodeCharacters(episodeId: number): Promise<Character[]> {
      const characters = await client.fetchEpisodeCharacters(episodeId);

      return [...characters].sort(
        (first, second) => byName.compare(first.name, second.name) || first.id - second.id,
      );
    },
  };
}
