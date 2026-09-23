"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchCharacter, type CharacterDetail } from "@/lib/characters";

export function characterQueryKey(characterId: number) {
  return ["characters", characterId] as const;
}

/**
 * Detail of one character, including its episode appearances.
 *
 * The grid never loads this: the query only runs once a character is selected,
 * so opening one dossier does not pull the appearance history of every card.
 */
export function useCharacter(characterId: number | null): UseQueryResult<CharacterDetail, Error> {
  return useQuery({
    queryKey: characterQueryKey(characterId ?? 0),
    queryFn: ({ signal }) => fetchCharacter(characterId as number, signal),
    enabled: characterId !== null,
  });
}
