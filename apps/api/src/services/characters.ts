import {
  cacheKeys,
  passThroughCacheReader,
  type CacheReader,
} from "../cache/cache.js";
import { toEpisodeReference, type CharacterDetail } from "../domain/character.js";
import type { RickAndMortyClient } from "../upstream/rick-and-morty/client.js";

export interface CharacterService {
  getCharacter(characterId: number): Promise<CharacterDetail>;
}

/**
 * Product rules for a single character.
 *
 * The upstream payload lists appearances as provider URLs. They are resolved
 * into project episode references here, in one batched upstream call rather
 * than one call per appearance, and ordered by episode id so every client sees
 * the same canonical sequence.
 */
export function createCharacterService(
  client: RickAndMortyClient,
  cached: CacheReader = passThroughCacheReader,
): CharacterService {
  return {
    getCharacter(characterId: number): Promise<CharacterDetail> {
      // The whole detail is cached as one entry, so a repeat view of the same
      // dossier costs no upstream request at all.
      return cached(cacheKeys.character(characterId), async () => {
        const { character, episodeIds } = await client.fetchCharacter(characterId);
        const episodes = await client.fetchEpisodesByIds(episodeIds);

        return {
          ...character,
          episodes: [...episodes]
            .sort((first, second) => first.id - second.id)
            .map(toEpisodeReference),
        };
      });
    },
  };
}
