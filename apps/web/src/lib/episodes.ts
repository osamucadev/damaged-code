import { getApiBaseUrl } from "./api";

/**
 * Episode as published by the project BFF.
 *
 * This mirrors the API contract documented at /docs. The web client never sees
 * the upstream Rick and Morty payload.
 */
export interface Episode {
  id: number;
  code: string;
  name: string;
  airDate: string;
  characterCount: number;
}

export interface EpisodeListResponse {
  data: Episode[];
  meta: { total: number };
}

export interface EpisodeResponse {
  data: Episode;
}

export class ApiError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

function isEpisode(value: unknown): value is Episode {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.code === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.airDate === "string" &&
    typeof candidate.characterCount === "number"
  );
}

export async function fetchEpisodes(signal?: AbortSignal): Promise<Episode[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/episodes`, {
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

    throw new ApiError(code, `The episode request failed with status ${response.status}`);
  }

  const body = (await response.json()) as Partial<EpisodeListResponse>;

  if (!Array.isArray(body.data) || !body.data.every(isEpisode)) {
    throw new ApiError("INVALID_RESPONSE", "The episode response did not match the contract");
  }

  return body.data;
}

export async function fetchEpisode(
  episodeId: number,
  signal?: AbortSignal,
  apiBaseUrl = getApiBaseUrl(),
): Promise<Episode> {
  const response = await fetch(`${apiBaseUrl}/v1/episodes/${episodeId}`, {
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

    throw new ApiError(code, `The episode request failed with status ${response.status}`);
  }

  const body = (await response.json()) as Partial<EpisodeResponse>;

  if (!isEpisode(body.data)) {
    throw new ApiError("INVALID_RESPONSE", "The episode response did not match the contract");
  }

  return body.data;
}

export interface EpisodePosition {
  season: number;
  episode: number;
}

export function parseEpisodeCode(code: string): EpisodePosition | null {
  const match = /^S(\d+)E(\d+)$/.exec(code);

  if (match === null) {
    return null;
  }

  return { season: Number(match[1]), episode: Number(match[2]) };
}

export function groupEpisodesBySeason(episodes: Episode[]): Map<number, Episode[]> {
  const seasons = new Map<number, Episode[]>();

  for (const episode of episodes) {
    const season = parseEpisodeCode(episode.code)?.season ?? 0;
    const entries = seasons.get(season) ?? [];
    entries.push(episode);
    seasons.set(season, entries);
  }

  return seasons;
}
