export interface ApiHealth {
  status: "ok";
  service: string;
  uptime: number;
  timestamp: string;
}

const DEFAULT_API_BASE_URL = "http://localhost:4000";

/**
 * Base URL of the project REST API.
 *
 * The web client talks only to this BFF. It never calls the Rick and Morty API
 * or any Firebase service directly.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (configured === undefined || configured.trim() === "") {
    return DEFAULT_API_BASE_URL;
  }

  return configured.replace(/\/+$/, "");
}

export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  const response = await fetch(`${getApiBaseUrl()}/health`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }

  return (await response.json()) as ApiHealth;
}
