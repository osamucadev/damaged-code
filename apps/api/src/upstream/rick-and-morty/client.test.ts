import { describe, expect, it, vi } from "vitest";

import { createRickAndMortyClient } from "./client.js";
import { UpstreamError } from "./errors.js";

const baseUrl = "http://upstream.test/api";

function episode(id: number, characters = 2) {
  return {
    id,
    name: `Episode ${id}`,
    air_date: "December 2, 2013",
    episode: `S01E0${id}`,
    characters: Array.from({ length: characters }, (_, index) => `${baseUrl}/character/${index}`),
  };
}

function jsonResponse(body: unknown) {
  return Promise.resolve(Response.json(body));
}

describe("createRickAndMortyClient", () => {
  it("normalizes upstream episodes into the project model", async () => {
    const fetchImpl = vi.fn().mockReturnValue(
      jsonResponse({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [episode(1, 3)],
      }),
    );

    const client = createRickAndMortyClient({ baseUrl, fetchImpl });

    await expect(client.fetchAllEpisodes()).resolves.toEqual([
      {
        id: 1,
        code: "S01E01",
        name: "Episode 1",
        airDate: "December 2, 2013",
        characterCount: 3,
      },
    ]);
  });

  it("never exposes upstream character urls", async () => {
    const fetchImpl = vi.fn().mockReturnValue(
      jsonResponse({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [episode(1)],
      }),
    );

    const [first] = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchAllEpisodes();

    expect(JSON.stringify(first)).not.toContain("character/");
    expect(Object.keys(first ?? {})).toEqual([
      "id",
      "code",
      "name",
      "airDate",
      "characterCount",
    ]);
  });

  it("follows the upstream pagination chain until it ends", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(
        jsonResponse({
          info: { count: 3, pages: 3, next: `${baseUrl}/episode?page=2`, prev: null },
          results: [episode(1)],
        }),
      )
      .mockReturnValueOnce(
        jsonResponse({
          info: { count: 3, pages: 3, next: `${baseUrl}/episode?page=3`, prev: null },
          results: [episode(2)],
        }),
      )
      .mockReturnValueOnce(
        jsonResponse({
          info: { count: 3, pages: 3, next: null, prev: null },
          results: [episode(3)],
        }),
      );

    const episodes = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchAllEpisodes();

    expect(episodes.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${baseUrl}/episode`);
    expect(fetchImpl.mock.calls[2]?.[0]).toBe(`${baseUrl}/episode?page=3`);
  });

  it("stops following pages when the chain does not end", async () => {
    // A fresh response per call, because a response body can only be read once.
    const fetchImpl = vi.fn().mockImplementation(() =>
      jsonResponse({
        info: { count: 1, pages: 1, next: `${baseUrl}/episode?page=2`, prev: null },
        results: [episode(1)],
      }),
    );

    const client = createRickAndMortyClient({ baseUrl, fetchImpl, maxPages: 4 });

    await expect(client.fetchAllEpisodes()).rejects.toThrow(UpstreamError);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it("reports an unavailable upstream when the request fails", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("connection refused"));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchAllEpisodes(),
    ).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });

  it("reports an unavailable upstream on an error status", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 503 }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchAllEpisodes(),
    ).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });

  it("reports an invalid response when a required field is missing", async () => {
    const fetchImpl = vi.fn().mockReturnValue(
      jsonResponse({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [{ id: 1, name: "Pilot", episode: "S01E01" }],
      }),
    );

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchAllEpisodes(),
    ).rejects.toMatchObject({ code: "UPSTREAM_INVALID_RESPONSE" });
  });

  it("reports an invalid response when the page structure is unexpected", async () => {
    const fetchImpl = vi.fn().mockReturnValue(jsonResponse({ episodes: [] }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchAllEpisodes(),
    ).rejects.toMatchObject({ code: "UPSTREAM_INVALID_RESPONSE" });
  });
});

describe("fetchEpisode", () => {
  it("normalizes one upstream episode into the project model", async () => {
    const fetchImpl = vi.fn().mockReturnValue(
      jsonResponse({
        id: 28,
        name: "The Ricklantis Mixup",
        air_date: "September 10, 2017",
        episode: "S03E07",
        characters: Array.from(
          { length: 40 },
          (_, index) => `${baseUrl}/character/${index + 1}`,
        ),
      }),
    );

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisode(28),
    ).resolves.toEqual({
      id: 28,
      code: "S03E07",
      name: "The Ricklantis Mixup",
      airDate: "September 10, 2017",
      characterCount: 40,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      `${baseUrl}/episode/28`,
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
  });

  it("reports a missing episode with the stable error code", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("missing", { status: 404 }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisode(9999),
    ).rejects.toMatchObject({ code: "EPISODE_NOT_FOUND", status: 404 });
  });

  it("reports an upstream failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("down", { status: 503 }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisode(28),
    ).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });
});

function upstreamCharacter(id: number, name: string) {
  return {
    id,
    name,
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: { name: "Earth (C-137)", url: `${baseUrl}/location/1` },
    location: { name: "Citadel of Ricks", url: `${baseUrl}/location/3` },
    image: `${baseUrl}/character/avatar/${id}.jpeg`,
  };
}

function upstreamEpisodeWithCharacters(ids: number[]) {
  return {
    id: 1,
    name: "Pilot",
    air_date: "December 2, 2013",
    episode: "S01E01",
    characters: ids.map((id) => `${baseUrl}/character/${id}`),
  };
}

describe("fetchEpisodeCharacters", () => {
  it("resolves every character of the episode in one batched request", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamEpisodeWithCharacters([2, 1])))
      .mockReturnValueOnce(
        jsonResponse([upstreamCharacter(2, "Morty Smith"), upstreamCharacter(1, "Rick Sanchez")]),
      );

    const characters = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(1);

    expect(characters).toHaveLength(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${baseUrl}/episode/1`);
    expect(fetchImpl.mock.calls[1]?.[0]).toBe(`${baseUrl}/character/2,1`);
  });

  it("normalizes nested upstream fields into the project character model", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamEpisodeWithCharacters([1])))
      .mockReturnValueOnce(jsonResponse(upstreamCharacter(1, "Rick Sanchez")));

    const [first] = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(1);

    expect(first).toEqual({
      id: 1,
      name: "Rick Sanchez",
      image: `${baseUrl}/character/avatar/1.jpeg`,
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      origin: "Earth (C-137)",
      location: "Citadel of Ricks",
    });
    expect(JSON.stringify(first)).not.toContain("/location/");
  });

  it("handles the single character object upstream returns for one id", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamEpisodeWithCharacters([5])))
      .mockReturnValueOnce(jsonResponse(upstreamCharacter(5, "Summer Smith")));

    const characters = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(1);

    expect(characters.map((item) => item.name)).toEqual(["Summer Smith"]);
  });

  it("splits very large casts into bounded batches", async () => {
    const ids = Array.from({ length: 5 }, (_, index) => index + 1);
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamEpisodeWithCharacters(ids)))
      .mockReturnValueOnce(jsonResponse([upstreamCharacter(1, "A"), upstreamCharacter(2, "B")]))
      .mockReturnValueOnce(jsonResponse([upstreamCharacter(3, "C"), upstreamCharacter(4, "D")]))
      .mockReturnValueOnce(jsonResponse(upstreamCharacter(5, "E")));

    const characters = await createRickAndMortyClient({
      baseUrl,
      fetchImpl,
      batchSize: 2,
    }).fetchEpisodeCharacters(1);

    expect(characters).toHaveLength(5);
    expect(fetchImpl.mock.calls[1]?.[0]).toBe(`${baseUrl}/character/1,2`);
    expect(fetchImpl.mock.calls[3]?.[0]).toBe(`${baseUrl}/character/5`);
  });

  it("does not call the character endpoint when the episode has no characters", async () => {
    const fetchImpl = vi.fn().mockReturnValueOnce(jsonResponse(upstreamEpisodeWithCharacters([])));

    const characters = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(1);

    expect(characters).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("reports a missing episode as its own error code", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("Episode not found", { status: 404 }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(9999),
    ).rejects.toMatchObject({ code: "EPISODE_NOT_FOUND", status: 404 });
  });

  it("reports an invalid response when a character reference is not usable", async () => {
    const fetchImpl = vi.fn().mockReturnValueOnce(
      jsonResponse({
        id: 1,
        name: "Pilot",
        air_date: "December 2, 2013",
        episode: "S01E01",
        characters: ["not-a-character-url"],
      }),
    );

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(1),
    ).rejects.toMatchObject({ code: "UPSTREAM_INVALID_RESPONSE" });
  });

  it("reports an unavailable upstream when the character request fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamEpisodeWithCharacters([1])))
      .mockResolvedValueOnce(new Response("nope", { status: 500 }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodeCharacters(1),
    ).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });
});

function upstreamCharacterWithEpisodes(id: number, episodeIds: number[]) {
  return {
    ...upstreamCharacter(id, `Character ${id}`),
    episode: episodeIds.map((episodeId) => `${baseUrl}/episode/${episodeId}`),
  };
}

describe("fetchCharacter", () => {
  it("returns the character and the ids read from its episode urls", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamCharacterWithEpisodes(2, [1, 2, 3])));

    const result = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchCharacter(2);

    expect(result.character.id).toBe(2);
    expect(result.episodeIds).toEqual([1, 2, 3]);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${baseUrl}/character/2`);
    expect(JSON.stringify(result.character)).not.toContain("/episode/");
  });

  it("reports a missing character as its own error code", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("Character not found", { status: 404 }));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchCharacter(9999),
    ).rejects.toMatchObject({ code: "CHARACTER_NOT_FOUND", status: 404 });
  });

  it("reports an invalid response when an episode reference is not usable", async () => {
    const fetchImpl = vi.fn().mockReturnValueOnce(
      jsonResponse({ ...upstreamCharacter(2, "Morty Smith"), episode: ["not-an-episode-url"] }),
    );

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchCharacter(2),
    ).rejects.toMatchObject({ code: "UPSTREAM_INVALID_RESPONSE" });
  });

  it("reports an invalid response when the episode list is missing", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse(upstreamCharacter(2, "Morty Smith")));

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchCharacter(2),
    ).rejects.toMatchObject({ code: "UPSTREAM_INVALID_RESPONSE" });
  });
});

describe("fetchEpisodesByIds", () => {
  it("resolves many episodes in a single batched request", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse([episode(1), episode(2), episode(3)]));

    const episodes = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodesByIds([
      1, 2, 3,
    ]);

    expect(episodes.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${baseUrl}/episode/1,2,3`);
  });

  it("handles the single object upstream returns for one id", async () => {
    const fetchImpl = vi.fn().mockReturnValueOnce(jsonResponse(episode(7)));

    const episodes = await createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodesByIds([7]);

    expect(episodes.map((item) => item.id)).toEqual([7]);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${baseUrl}/episode/7`);
  });

  it("makes no request when there is nothing to resolve", async () => {
    const fetchImpl = vi.fn();

    await expect(
      createRickAndMortyClient({ baseUrl, fetchImpl }).fetchEpisodesByIds([]),
    ).resolves.toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("splits very long appearance lists into bounded batches", async () => {
    const fetchImpl = vi
      .fn()
      .mockReturnValueOnce(jsonResponse([episode(1), episode(2)]))
      .mockReturnValueOnce(jsonResponse(episode(3)));

    const episodes = await createRickAndMortyClient({
      baseUrl,
      fetchImpl,
      batchSize: 2,
    }).fetchEpisodesByIds([1, 2, 3]);

    expect(episodes).toHaveLength(3);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
