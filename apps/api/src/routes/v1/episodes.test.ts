import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../../app.js";
import { loadConfig } from "../../config/env.js";
import type { Character } from "../../domain/character.js";
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

async function buildWith(
  listEpisodes: () => Promise<Episode[]>,
  listEpisodeCharacters: (episodeId: number) => Promise<Character[]> = async () => [],
  getEpisode: (episodeId: number) => Promise<Episode> = async (episodeId) => episode(episodeId),
): Promise<FastifyInstance> {
  app = await buildApp({
    config: loadConfig({ NODE_ENV: "test" }),
    episodeService: { listEpisodes, getEpisode, listEpisodeCharacters },
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

describe("GET /v1/episodes/:episodeId", () => {
  it("answers with one episode through the project contract", async () => {
    const server = await buildWith(async () => [], undefined, async () => episode(28));

    const response = await server.inject({ method: "GET", url: "/v1/episodes/28" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: episode(28) });
  });

  it("answers with 404 when the episode does not exist", async () => {
    const server = await buildWith(async () => [], undefined, async () => {
      throw new UpstreamError("EPISODE_NOT_FOUND", "Episode 9999 does not exist.");
    });

    const response = await server.inject({ method: "GET", url: "/v1/episodes/9999" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("EPISODE_NOT_FOUND");
  });

  it("rejects an invalid episode id", async () => {
    const server = await buildWith(async () => []);

    const response = await server.inject({ method: "GET", url: "/v1/episodes/nope" });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_REQUEST");
  });

  it("maps an upstream failure to the project error envelope", async () => {
    const server = await buildWith(async () => [], undefined, async () => {
      throw new UpstreamError("UPSTREAM_UNAVAILABLE", "the upstream service is down");
    });

    const response = await server.inject({ method: "GET", url: "/v1/episodes/28" });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("UPSTREAM_UNAVAILABLE");
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

function character(id: number, name: string): Character {
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

describe("GET /v1/episodes/:episodeId/characters", () => {
  it("answers with the character contract for the episode", async () => {
    const server = await buildWith(
      async () => [],
      async () => [character(1, "Abradolf Lincler"), character(2, "Rick Sanchez")],
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes/28/characters" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          id: 1,
          name: "Abradolf Lincler",
          image: "https://upstream.test/avatar/1.jpeg",
          status: "Alive",
          species: "Human",
          type: "",
          gender: "Male",
          origin: "Earth (C-137)",
          location: "Citadel of Ricks",
        },
        {
          id: 2,
          name: "Rick Sanchez",
          image: "https://upstream.test/avatar/2.jpeg",
          status: "Alive",
          species: "Human",
          type: "",
          gender: "Male",
          origin: "Earth (C-137)",
          location: "Citadel of Ricks",
        },
      ],
      meta: { total: 2, episodeId: 28 },
    });
  });

  it("passes the requested episode to the service", async () => {
    const listEpisodeCharacters = vi.fn().mockResolvedValue([]);
    const server = await buildWith(async () => [], listEpisodeCharacters);

    await server.inject({ method: "GET", url: "/v1/episodes/42/characters" });

    expect(listEpisodeCharacters).toHaveBeenCalledWith(42);
  });

  it("answers with an empty contract when the episode has no characters", async () => {
    const server = await buildWith(
      async () => [],
      async () => [],
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes/7/characters" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [], meta: { total: 0, episodeId: 7 } });
  });

  it("answers with 404 when the episode does not exist", async () => {
    const server = await buildWith(
      async () => [],
      async () => {
        throw new UpstreamError("EPISODE_NOT_FOUND", "no episode 9999");
      },
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes/9999/characters" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("EPISODE_NOT_FOUND");
  });

  it("maps an upstream failure to the existing error envelope", async () => {
    const server = await buildWith(
      async () => [],
      async () => {
        throw new UpstreamError("UPSTREAM_UNAVAILABLE", "the upstream service is down");
      },
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes/1/characters" });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("rejects an episode id that is not a valid identifier", async () => {
    const server = await buildWith(async () => []);

    const invalid = await server.inject({ method: "GET", url: "/v1/episodes/abc/characters" });
    const negative = await server.inject({ method: "GET", url: "/v1/episodes/0/characters" });

    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().error.code).toBe("INVALID_REQUEST");
    expect(negative.statusCode).toBe(400);
  });

  it("does not leak upstream urls through the character contract", async () => {
    const server = await buildWith(
      async () => [],
      async () => [character(1, "Rick Sanchez")],
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes/1/characters" });
    const [first] = response.json().data;

    expect(Object.keys(first)).toEqual([
      "id",
      "name",
      "image",
      "status",
      "species",
      "type",
      "gender",
      "origin",
      "location",
    ]);
    expect(response.body).not.toContain("rickandmortyapi.com/api/character/1");
  });
});

describe("public error sanitization", () => {
  it("never leaks the upstream provider through an unavailable error", async () => {
    const server = await buildWith(
      async () => {
        throw new UpstreamError(
          "UPSTREAM_UNAVAILABLE",
          "Request to the Rick and Morty API failed: https://rickandmortyapi.com/api/episode",
        );
      },
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("UPSTREAM_UNAVAILABLE");
    expect(response.body).not.toContain("rickandmortyapi.com");
    expect(response.body).not.toContain("https://");
  });

  it("never leaks the upstream provider through an invalid response error", async () => {
    const server = await buildWith(async () => {
      throw new UpstreamError(
        "UPSTREAM_INVALID_RESPONSE",
        "The Rick and Morty API returned a body that is not JSON: https://rickandmortyapi.com/api/episode?page=2",
      );
    });

    const response = await server.inject({ method: "GET", url: "/v1/episodes" });

    expect(response.statusCode).toBe(502);
    expect(response.body).not.toContain("rickandmortyapi.com");
    expect(response.body).not.toContain("page=2");
  });

  it("keeps the not found message free of upstream detail", async () => {
    const server = await buildWith(
      async () => [],
      async () => {
        throw new UpstreamError(
          "EPISODE_NOT_FOUND",
          "Episode 9999 does not exist at https://rickandmortyapi.com/api/episode/9999",
        );
      },
    );

    const response = await server.inject({ method: "GET", url: "/v1/episodes/9999/characters" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("EPISODE_NOT_FOUND");
    expect(response.body).not.toContain("rickandmortyapi.com");
  });

  it("does not reflect the requested route back to the client", async () => {
    const server = await buildWith(async () => []);

    const response = await server.inject({
      method: "GET",
      url: "/v1/does-not-exist-<script>",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("NOT_FOUND");
    expect(response.body).not.toContain("script");
  });
});
