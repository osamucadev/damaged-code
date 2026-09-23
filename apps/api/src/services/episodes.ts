import type { Character } from "../domain/character.js";
import type { Episode } from "../domain/episode.js";
import {
  cacheKeys,
  passThroughCacheReader,
  type CacheReader,
} from "../cache/cache.js";
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
export function createEpisodeService(
  client: RickAndMortyClient,
  cached: CacheReader = passThroughCacheReader,
): EpisodeService {
  return {
    listEpisodes(): Promise<Episode[]> {
      // The catalog costs three upstream pages, so it is the entry that
      // benefits most from being cached.
      return cached(cacheKeys.episodeCatalog(), async () => {
        const episodes = await client.fetchAllEpisodes();

        return [...episodes].sort((first, second) => first.id - second.id);
      });
    },

    getEpisode(episodeId: number): Promise<Episode> {
      return cached(cacheKeys.episode(episodeId), () => client.fetchEpisode(episodeId));
    },

    listEpisodeCharacters(episodeId: number): Promise<Character[]> {
      return cached(cacheKeys.episodeCharacters(episodeId), async () => {
        const characters = await client.fetchEpisodeCharacters(episodeId);

        return [...characters].sort(
          (first, second) => byName.compare(first.name, second.name) || first.id - second.id,
        );
      });
    },
  };
}
