/**
 * Project owned episode model.
 *
 * This is the shape clients receive. It is intentionally independent from the
 * upstream Rick and Morty payload, so upstream changes do not reach clients.
 */
export interface Episode {
  /** Stable identifier inside the project contract. */
  id: number;
  /** Production code such as S01E01. */
  code: string;
  name: string;
  /** Original air date, kept as the upstream free text such as "December 2, 2013". */
  airDate: string;
  /** How many characters appear in the episode. */
  characterCount: number;
}
