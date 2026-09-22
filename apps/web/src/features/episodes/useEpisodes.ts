"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchEpisodes, type Episode } from "@/lib/episodes";

export const episodesQueryKey = ["episodes"] as const;

/**
 * Episode server state.
 *
 * The only source is the project BFF. The web client never calls the Rick and
 * Morty API directly.
 */
export function useEpisodes(): UseQueryResult<Episode[], Error> {
  return useQuery({
    queryKey: episodesQueryKey,
    queryFn: ({ signal }) => fetchEpisodes(signal),
  });
}
