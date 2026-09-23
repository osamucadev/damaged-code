"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchEpisode, type Episode } from "@/lib/episodes";

export function episodeQueryKey(episodeId: number) {
  return ["episodes", episodeId] as const;
}

export function useEpisode(episodeId: number): UseQueryResult<Episode, Error> {
  return useQuery({
    queryKey: episodeQueryKey(episodeId),
    queryFn: ({ signal }) => fetchEpisode(episodeId, signal),
  });
}
