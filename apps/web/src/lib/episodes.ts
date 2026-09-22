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
