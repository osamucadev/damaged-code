import type { Episode } from "../../domain/episode.js";

import { UpstreamError } from "./errors.js";
import type { UpstreamEpisode, UpstreamEpisodePage } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validates one upstream episode and converts it to the project model.
 *
 * The character URLs are deliberately reduced to a count. Provider specific
 * URLs must never reach a client.
 */
export function toEpisode(value: unknown): Episode {
  if (!isRecord(value)) {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", "Episode payload is not an object");
  }

  const { id, name, air_date: airDate, episode: code, characters } = value;

  if (typeof id !== "number" || !Number.isInteger(id)) {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", "Episode id is missing or invalid");
  }

  if (typeof name !== "string" || typeof airDate !== "string" || typeof code !== "string") {
    throw new UpstreamError(
      "UPSTREAM_INVALID_RESPONSE",
      `Episode ${id} is missing a required text field`,
    );
  }

  if (!Array.isArray(characters)) {
    throw new UpstreamError(
      "UPSTREAM_INVALID_RESPONSE",
      `Episode ${id} is missing its character list`,
    );
  }

  return {
    id,
    code,
    name,
    airDate,
    characterCount: characters.length,
  };
}

export function toEpisodePage(value: unknown): UpstreamEpisodePage {
  if (!isRecord(value) || !isRecord(value.info) || !Array.isArray(value.results)) {
    throw new UpstreamError(
      "UPSTREAM_INVALID_RESPONSE",
      "Episode page payload does not match the expected structure",
    );
  }

  const next = value.info.next;

  if (next !== null && typeof next !== "string") {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", "Episode page has an invalid next link");
  }

  return {
    info: {
      count: typeof value.info.count === "number" ? value.info.count : value.results.length,
      pages: typeof value.info.pages === "number" ? value.info.pages : 1,
      next,
      prev: typeof value.info.prev === "string" ? value.info.prev : null,
    },
    results: value.results as UpstreamEpisode[],
  };
}
