import { describe, expect, it, vi } from "vitest";

import { createEpisodeService } from "./episodes.js";

function episode(id: number) {
  return {
    id,
    code: `S01E0${id}`,
    name: `Episode ${id}`,
    airDate: "December 2, 2013",
    characterCount: 1,
  };
}

describe("createEpisodeService", () => {
  it("returns episodes in contract order regardless of upstream order", async () => {
    const client = {
      fetchAllEpisodes: vi.fn().mockResolvedValue([episode(3), episode(1), episode(2)]),
      fetchEpisodeCharacters: vi.fn(),
    };

    const episodes = await createEpisodeService(client).listEpisodes();

    expect(episodes.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("passes upstream failures through so the route can map them", async () => {
    const client = {
      fetchAllEpisodes: vi.fn().mockRejectedValue(new Error("upstream down")),
      fetchEpisodeCharacters: vi.fn(),
    };

    await expect(createEpisodeService(client).listEpisodes()).rejects.toThrow("upstream down");
  });
});

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

describe("listEpisodeCharacters", () => {
  it("returns characters alphabetically by name", async () => {
    const client = {
      fetchAllEpisodes: vi.fn(),
      fetchEpisodeCharacters: vi
        .fn()
        .mockResolvedValue([
          character(2, "Summer Smith"),
          character(1, "Rick Sanchez"),
          character(3, "Abradolf Lincler"),
          character(4, "morty smith"),
        ]),
    };

    const characters = await createEpisodeService(client).listEpisodeCharacters(1);

    expect(characters.map((item) => item.name)).toEqual([
      "Abradolf Lincler",
      "morty smith",
      "Rick Sanchez",
      "Summer Smith",
    ]);
  });

  it("orders identical names by id so the contract stays deterministic", async () => {
    const client = {
      fetchAllEpisodes: vi.fn(),
      fetchEpisodeCharacters: vi
        .fn()
        .mockResolvedValue([character(9, "Rick Sanchez"), character(4, "Rick Sanchez")]),
    };

    const characters = await createEpisodeService(client).listEpisodeCharacters(1);

    expect(characters.map((item) => item.id)).toEqual([4, 9]);
  });

  it("asks the upstream adapter for the requested episode", async () => {
    const fetchEpisodeCharacters = vi.fn().mockResolvedValue([]);
    const client = { fetchAllEpisodes: vi.fn(), fetchEpisodeCharacters };

    await expect(createEpisodeService(client).listEpisodeCharacters(28)).resolves.toEqual([]);
    expect(fetchEpisodeCharacters).toHaveBeenCalledWith(28);
  });
});
