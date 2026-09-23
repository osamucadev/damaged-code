import type { Episode } from "./episode.js";

/**
 * Project owned character model.
 *
 * Upstream nests origin and location as objects with provider URLs. The
 * contract publishes their names only, so no provider URL reaches a client.
 */
export interface Character {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  /** Free text subtype. Upstream leaves it empty for most characters. */
  type: string;
  gender: string;
  origin: string;
  location: string;
}

/**
 * The smallest identity a client needs to display an episode and navigate to
 * it.
 *
 * It deliberately carries no link. Upstream episode URLs belong to the
 * provider, and page paths belong to each client: the web turns id 3 into
 * `/episodes/3`, and a Flutter client turns the same id into its own route.
 * The BFF expresses domain identity, not navigation.
 */
export interface EpisodeReference {
  id: number;
  code: string;
  name: string;
}

/**
 * A character plus the episodes it appears in.
 *
 * This is the detail contract. The episode list endpoint stays lean and does
 * not carry appearances, because a grid never needs them.
 */
export interface CharacterDetail extends Character {
  episodes: EpisodeReference[];
}

export function toEpisodeReference(episode: Episode): EpisodeReference {
  return { id: episode.id, code: episode.code, name: episode.name };
}
