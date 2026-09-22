import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../../app.js";
import { loadConfig } from "../../config/env.js";
import type { Episode } from "../../domain/episode.js";
import { UpstreamError } from "../../upstream/rick-and-morty/errors.js";

function episode(id: number): Episode {
  return {
    id,
    code: `S01E0${id}`,
    name: `Episode ${id}`,
    airDate: "December 2, 2013",
    characterCount: 5,
  };
}

let app: FastifyInstance;

async function buildWith(listEpisodes: () => Promise<Episode[]>): Promise<FastifyInstance> {
  app = await buildApp({
    config: loadConfig({ NODE_ENV: "test" }),
    episodeService: { listEpisodes },
  });

  await app.ready();

  return app;
}

afterEach(async () => {
  await app.close();
});

describe("GET /v1/episodes", () => {
  it("answers with the project episode contract", async () => {
    const server = await buildWith(async () => [episode(1), episode(2)]);

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.json()).toEqual({
      data: [
        {
          id: 1,
          code: "S01E01",
          name: "Episode 1",
          airDate: "December 2, 2013",
          characterCount: 5,
        },
        {
          id: 2,
          code: "S01E02",
          name: "Episode 2",
          airDate: "December 2, 2013",
          characterCount: 5,
        },
      ],
      meta: { total: 2 },
    });
  });

  it("does not leak upstream fields through the contract", async () => {
    const leaky = {
      ...episode(1),
      characters: ["https://rickandmortyapi.com/api/character/1"],
      url: "https://rickandmortyapi.com/api/episode/1",
    } as Episode;

    const server = await buildWith(async () => [leaky]);

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });
    const [first] = response.json().data;

    expect(Object.keys(first)).toEqual(["id", "code", "name", "airDate", "characterCount"]);
    expect(response.body).not.toContain("rickandmortyapi.com");
  });

  it("answers with an empty contract when there are no episodes", async () => {
    const server = await buildWith(async () => []);

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [], meta: { total: 0 } });
  });

  it("maps an upstream failure to a stable error code", async () => {
    const server = await buildWith(async () => {
      throw new UpstreamError("UPSTREAM_UNAVAILABLE", "the upstream service is down");
    });

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("hides unexpected failures behind a generic error", async () => {
    const server = await buildWith(async () => {
      throw new Error("secret internal detail");
    });

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.statusCode).toBe(500);
    expect(response.json().error.code).toBe("INTERNAL_ERROR");
    expect(response.body).not.toContain("secret internal detail");
  });

  it("keeps the health route outside the versioned product api", async () => {
    const server = await buildWith(async () => []);

    expect((await server.inject({ method: "GET", url: "/health" })).statusCode).toBe(200);
    expect((await server.inject({ method: "GET", url: "/v1/health" })).statusCode).toBe(404);
  });
});

describe("unknown routes", () => {
  it("answer with the project error envelope", async () => {
    const server = await buildWith(async () => []);

    const response = await server.inject({ method: "GET", url: "/v1/nope" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("NOT_FOUND");
  });
});

describe("upstream wiring", () => {
  it("builds its own upstream client when none is injected", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [
          {
            id: 1,
            name: "Pilot",
            air_date: "December 2, 2013",
            episode: "S01E01",
            characters: ["http://upstream.test/api/character/1"],
          },
        ],
      }),
    );

    app = await buildApp({
      config: loadConfig({ NODE_ENV: "test", RICK_AND_MORTY_API_URL: "http://upstream.test/api" }),
    });
    await app.ready();

    const response = await app.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.json()).toEqual({
      data: [
        {
          id: 1,
          code: "S01E01",
          name: "Pilot",
          airDate: "December 2, 2013",
          characterCount: 1,
        },
      ],
      meta: { total: 1 },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://upstream.test/api/episode",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );

    fetchSpy.mockRestore();
  });
});
