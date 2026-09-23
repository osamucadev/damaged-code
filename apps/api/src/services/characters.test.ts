import { describe, expect, it, vi } from "vitest";

import { createCharacterService } from "./characters.js";

function character(id: number, name: string) {
  return {
    id,
    name,
    image: `https://upstream.test/avatar/${id}.jpeg`,
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: "Earth (C-137)",
    location: "Citadel of Ricks",
  };
}

function episode(id: number) {
  return {
    id,
    code: `S01E0${id}`,
    name: `Episode ${id}`,
    airDate: "December 2, 2013",
    characterCount: 5,
  };
}

function clientWith(episodeIds: number[], episodes = episodeIds.map(episode)) {
  return {
    fetchAllEpisodes: vi.fn(),
    fetchEpisode: vi.fn(),
    fetchEpisodeCharacters: vi.fn(),
    fetchCharacter: vi.fn().mockResolvedValue({ character: character(2, "Morty Smith"), episodeIds }),
    fetchEpisodesByIds: vi.fn().mockResolvedValue(episodes),
  };
}

describe("createCharacterService", () => {
  it("returns the character with normalized episode references", async () => {
    const client = clientWith([1, 2]);

    const detail = await createCharacterService(client).getCharacter(2);

    expect(detail).toEqual({
      id: 2,
      name: "Morty Smith",
      image: "https://upstream.test/avatar/2.jpeg",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      origin: "Earth (C-137)",
      location: "Citadel of Ricks",
      episodes: [
        { id: 1, code: "S01E01", name: "Episode 1" },
        { id: 2, code: "S01E02", name: "Episode 2" },
      ],
    });
  });

  it("publishes only id, code, and name for an appearance", async () => {
    const client = clientWith([1]);

    const [first] = (await createCharacterService(client).getCharacter(2)).episodes;

    expect(Object.keys(first ?? {})).toEqual(["id", "code", "name"]);
  });

  it("resolves every appearance in one batched call rather than one per episode", async () => {
    const episodeIds = [1, 2, 3, 4, 5, 6, 7, 8];
    const client = clientWith(episodeIds);

    await createCharacterService(client).getCharacter(2);

    expect(client.fetchCharacter).toHaveBeenCalledTimes(1);
    expect(client.fetchEpisodesByIds).toHaveBeenCalledTimes(1);
    expect(client.fetchEpisodesByIds).toHaveBeenCalledWith(episodeIds);
  });

  it("orders appearances by episode id regardless of upstream order", async () => {
    const client = clientWith([3, 1, 2], [episode(3), episode(1), episode(2)]);

    const detail = await createCharacterService(client).getCharacter(2);

    expect(detail.episodes.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("supports a character that appears in a single episode", async () => {
    const client = clientWith([1]);

    const detail = await createCharacterService(client).getCharacter(2);

    expect(detail.episodes).toEqual([{ id: 1, code: "S01E01", name: "Episode 1" }]);
  });

  it("supports a character with no resolvable appearance", async () => {
    const client = clientWith([], []);

    const detail = await createCharacterService(client).getCharacter(2);

    expect(detail.episodes).toEqual([]);
  });

  it("passes a character failure through so the route can map it", async () => {
    const client = clientWith([1]);
    client.fetchCharacter.mockRejectedValue(new Error("character is gone"));

    await expect(createCharacterService(client).getCharacter(2)).rejects.toThrow(
      "character is gone",
    );
  });

  it("passes an appearance resolution failure through", async () => {
    const client = clientWith([1]);
    client.fetchEpisodesByIds.mockRejectedValue(new Error("episodes are gone"));

    await expect(createCharacterService(client).getCharacter(2)).rejects.toThrow(
      "episodes are gone",
    );
  });
});
