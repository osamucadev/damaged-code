import type { Character } from "../../domain/character.js";
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

function readName(value: unknown): string {
  if (isRecord(value) && typeof value.name === "string") {
    return value.name;
  }

  return "";
}

/**
 * Reads the id out of an upstream resource URL.
 *
 * The URLs look like https://rickandmortyapi.com/api/character/42 or
 * https://rickandmortyapi.com/api/episode/1. They stay inside this adapter:
 * only the resolved ids and domain objects leave it.
 */
function toResourceId(url: unknown, resource: string): number {
  if (typeof url !== "string") {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", `${resource} reference is not a URL`);
  }

  const id = Number.parseInt(url.split("/").filter(Boolean).at(-1) ?? "", 10);

  if (Number.isNaN(id) || id <= 0) {
    throw new UpstreamError(
      "UPSTREAM_INVALID_RESPONSE",
      `${resource} reference does not end with an id: ${url}`,
    );
  }

  return id;
}

export function toCharacterId(url: unknown): number {
  return toResourceId(url, "Character");
}

export function toCharacter(value: unknown): Character {
  if (!isRecord(value)) {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", "Character payload is not an object");
  }

  const { id, name, image, status, species, type, gender } = value;

  if (typeof id !== "number" || !Number.isInteger(id)) {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", "Character id is missing or invalid");
  }

  if (typeof name !== "string") {
    throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", `Character ${id} has no name`);
  }

  return {
    id,
    name,
    image: typeof image === "string" ? image : "",
    status: typeof status === "string" ? status : "unknown",
    species: typeof species === "string" ? species : "",
    type: typeof type === "string" ? type : "",
    gender: typeof gender === "string" ? gender : "unknown",
    origin: readName(value.origin),
    location: readName(value.location),
  };
}

/**
 * Reads one episode and returns the character references it carries.
 */
export function toEpisodeCharacterIds(value: unknown): number[] {
  if (!isRecord(value) || !Array.isArray(value.characters)) {
    throw new UpstreamError(
      "UPSTREAM_INVALID_RESPONSE",
      "Episode payload does not carry a character list",
    );
  }

  return value.characters.map(toCharacterId);
}

/**
 * Reads one character and returns the ids of the episodes it appears in.
 *
 * Upstream lists appearances as absolute episode URLs. They are converted to
 * ids here so the provider URL never becomes part of the project contract.
 */
export function toCharacterEpisodeIds(value: unknown): number[] {
  if (!isRecord(value) || !Array.isArray(value.episode)) {
    throw new UpstreamError(
      "UPSTREAM_INVALID_RESPONSE",
      "Character payload does not carry an episode list",
    );
  }

  return value.episode.map((url) => toResourceId(url, "Episode"));
}
