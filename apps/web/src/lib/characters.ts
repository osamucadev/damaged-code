import { getApiBaseUrl } from "./api";
import { ApiError } from "./episodes";

/**
 * Character as published by the project BFF, already ordered alphabetically.
 */
export interface Character {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: string;
  location: string;
}

/**
 * One episode a character appears in.
 *
 * The API publishes identity only. The web turns the id into its own route,
 * which is why no link arrives from the server.
 */
export interface EpisodeReference {
  id: number;
  code: string;
  name: string;
}

export interface CharacterDetail extends Character {
  episodes: EpisodeReference[];
}

export interface CharacterListResponse {
  data: Character[];
  meta: { total: number; episodeId: number };
}

function isCharacter(value: unknown): value is Character {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.image === "string" &&
    typeof candidate.status === "string"
  );
}

export async function fetchEpisodeCharacters(
  episodeId: number,
  signal?: AbortSignal,
): Promise<Character[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/episodes/${episodeId}/characters`, {
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let code = "REQUEST_FAILED";

    try {
      const body = (await response.json()) as { error?: { code?: string } };
      code = body.error?.code ?? code;
    } catch {
      // The error body was not the project envelope, so the generic code stands.
    }

    throw new ApiError(code, `The character request failed with status ${response.status}`);
  }

  const body = (await response.json()) as Partial<CharacterListResponse>;

  if (!Array.isArray(body.data) || !body.data.every(isCharacter)) {
    throw new ApiError("INVALID_RESPONSE", "The character response did not match the contract");
  }

  return body.data;
}

function isEpisodeReference(value: unknown): value is EpisodeReference {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.code === "string" &&
    typeof candidate.name === "string"
  );
}

export async function fetchCharacter(
  characterId: number,
  signal?: AbortSignal,
): Promise<CharacterDetail> {
  const response = await fetch(`${getApiBaseUrl()}/v1/characters/${characterId}`, {
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let code = "REQUEST_FAILED";

    try {
      const body = (await response.json()) as { error?: { code?: string } };
      code = body.error?.code ?? code;
    } catch {
      // The error body was not the project envelope, so the generic code stands.
    }

    throw new ApiError(code, `The character request failed with status ${response.status}`);
  }

  const body = (await response.json()) as { data?: unknown };
  const data = body.data;

  if (
    !isCharacter(data) ||
    !Array.isArray((data as CharacterDetail).episodes) ||
    !(data as CharacterDetail).episodes.every(isEpisodeReference)
  ) {
    throw new ApiError("INVALID_RESPONSE", "The character response did not match the contract");
  }

  return data as CharacterDetail;
}
