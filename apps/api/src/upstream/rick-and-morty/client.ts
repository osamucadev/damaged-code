import type { Episode } from "../../domain/episode.js";

import { UpstreamError } from "./errors.js";
import { toEpisode, toEpisodePage } from "./mapper.js";

export interface RickAndMortyClientOptions {
  baseUrl: string;
  /** Injected in tests so the suite never depends on the live service. */
  fetchImpl?: typeof fetch;
  requestTimeoutMs?: number;
  /** Safety limit, so a malformed pagination chain cannot loop forever. */
  maxPages?: number;
}

export interface RickAndMortyClient {
  fetchAllEpisodes(): Promise<Episode[]>;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_PAGES = 50;

export function createRickAndMortyClient(
  options: RickAndMortyClientOptions,
): RickAndMortyClient {
  const {
    baseUrl,
    fetchImpl = fetch,
    requestTimeoutMs = DEFAULT_TIMEOUT_MS,
    maxPages = DEFAULT_MAX_PAGES,
  } = options;

  async function requestJson(url: string): Promise<unknown> {
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
  };
}
