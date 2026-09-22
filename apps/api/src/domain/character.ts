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
