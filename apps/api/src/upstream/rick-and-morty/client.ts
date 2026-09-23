import type { Character } from "../../domain/character.js";
import type { Episode } from "../../domain/episode.js";

import { UpstreamError, type UpstreamErrorCode } from "./errors.js";
import { toCharacter, toEpisode, toEpisodeCharacterIds, toEpisodePage } from "./mapper.js";

export interface RickAndMortyClientOptions {
  baseUrl: string;
  /** Injected in tests so the suite never depends on the live service. */
  fetchImpl?: typeof fetch;
  requestTimeoutMs?: number;
  /** Safety limit, so a malformed pagination chain cannot loop forever. */
  maxPages?: number;
  /** How many character ids are requested in one upstream call. */
  characterBatchSize?: number;
}

export interface RickAndMortyClient {
  fetchAllEpisodes(): Promise<Episode[]>;
  fetchEpisode(episodeId: number): Promise<Episode>;
  fetchEpisodeCharacters(episodeId: number): Promise<Character[]>;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_PAGES = 50;
/*
 * Upstream accepts a comma separated id list. Episodes hold at most a few dozen
 * characters, so one request is normally enough. The batch size only keeps the
 * URL bounded if an episode ever carries an unusual number of characters.
 */
const DEFAULT_CHARACTER_BATCH_SIZE = 100;

export function createRickAndMortyClient(
  options: RickAndMortyClientOptions,
): RickAndMortyClient {
  const {
    baseUrl,
    fetchImpl = fetch,
    requestTimeoutMs = DEFAULT_TIMEOUT_MS,
    maxPages = DEFAULT_MAX_PAGES,
    characterBatchSize = DEFAULT_CHARACTER_BATCH_SIZE,
  } = options;

  async function requestJson(
    url: string,
    notFound?: { code: UpstreamErrorCode; message: string },
  ): Promise<unknown> {
    let response: Response;

    try {
      response = await fetchImpl(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
    } catch (cause) {
      throw new UpstreamError(
        "UPSTREAM_UNAVAILABLE",
        `Request to the Rick and Morty API failed: ${url}`,
        { cause },
      );
    }

    // The message stays free of provider URLs, because clients can read it.
    if (response.status === 404 && notFound !== undefined) {
      throw new UpstreamError(notFound.code, notFound.message);
    }

    if (!response.ok) {
      throw new UpstreamError(
        "UPSTREAM_UNAVAILABLE",
        `The Rick and Morty API answered ${response.status} for ${url}`,
      );
    }

    try {
      return await response.json();
    } catch (cause) {
      throw new UpstreamError(
        "UPSTREAM_INVALID_RESPONSE",
        `The Rick and Morty API returned a body that is not JSON: ${url}`,
        { cause },
      );
    }
  }

  return {
    /**
     * Walks the upstream pagination chain and returns every episode.
     *
     * Upstream exposes pages through an absolute next link, so the chain is
     * followed rather than guessed from a page count.
     */
    async fetchAllEpisodes(): Promise<Episode[]> {
      const episodes: Episode[] = [];
      let nextUrl: string | null = `${baseUrl}/episode`;
      let visitedPages = 0;

      while (nextUrl !== null) {
        if (visitedPages >= maxPages) {
          throw new UpstreamError(
            "UPSTREAM_INVALID_RESPONSE",
            `The Rick and Morty API returned more than ${maxPages} episode pages`,
          );
        }

        const page = toEpisodePage(await requestJson(nextUrl));

        for (const result of page.results) {
          episodes.push(toEpisode(result));
        }

        visitedPages += 1;
        nextUrl = page.info.next;
      }

      return episodes;
    },

    async fetchEpisode(episodeId: number): Promise<Episode> {
      const episode = await requestJson(`${baseUrl}/episode/${episodeId}`, {
        code: "EPISODE_NOT_FOUND",
        message: `Episode ${episodeId} does not exist.`,
      });

      return toEpisode(episode);
    },

    /**
     * Resolves every character of one episode.
     *
     * The episode carries character URLs. Their ids are extracted here and
     * resolved through the upstream multiple id endpoint, so the number of
     * requests stays proportional to the episode rather than to its cast.
     */
    async fetchEpisodeCharacters(episodeId: number): Promise<Character[]> {
      const episode = await requestJson(`${baseUrl}/episode/${episodeId}`, {
        code: "EPISODE_NOT_FOUND",
        message: `Episode ${episodeId} does not exist.`,
      });
      const characterIds = toEpisodeCharacterIds(episode);

      if (characterIds.length === 0) {
        return [];
      }

      const characters: Character[] = [];

      for (let start = 0; start < characterIds.length; start += characterBatchSize) {
        const batch = characterIds.slice(start, start + characterBatchSize);
        const payload = await requestJson(`${baseUrl}/character/${batch.join(",")}`);

        // Upstream answers with an object for a single id and an array for many.
        const entries = Array.isArray(payload) ? payload : [payload];

        for (const entry of entries) {
          characters.push(toCharacter(entry));
        }
      }

      return characters;
    },
  };
}
