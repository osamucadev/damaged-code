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
