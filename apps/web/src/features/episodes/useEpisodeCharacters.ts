"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchEpisodeCharacters, type Character } from "@/lib/characters";

export function episodeCharactersQueryKey(episodeId: number) {
  return ["episodes", episodeId, "characters"] as const;
}

/**
 * Characters of the selected episode.
 *
 * The query depends on the selection, so it stays idle until an episode is
 * chosen. The order comes from the BFF contract and is never sorted here.
 */
export function useEpisodeCharacters(
  episodeId: number | null,
): UseQueryResult<Character[], Error> {
  return useQuery({
    queryKey: episodeCharactersQueryKey(episodeId ?? 0),
    queryFn: ({ signal }) => fetchEpisodeCharacters(episodeId as number, signal),
    enabled: episodeId !== null,
  });
}
