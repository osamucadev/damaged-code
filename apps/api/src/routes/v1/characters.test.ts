import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../../app.js";
import { loadConfig } from "../../config/env.js";
import type { CharacterDetail } from "../../domain/character.js";
import { UpstreamError } from "../../upstream/rick-and-morty/errors.js";

let app: FastifyInstance;

const morty: CharacterDetail = {
  id: 2,
  name: "Morty Smith",
  image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: "Earth (C-137)",
  location: "Citadel of Ricks",
  episodes: [
    { id: 1, code: "S01E01", name: "Pilot" },
    { id: 2, code: "S01E02", name: "Lawnmower Dog" },
  ],
};

async function buildWith(
  getCharacter: (characterId: number) => Promise<CharacterDetail>,
): Promise<FastifyInstance> {
  app = await buildApp({
    config: loadConfig({ NODE_ENV: "test" }),
    episodeService: {
      listEpisodes: async () => [],
      getEpisode: async () => {
        throw new UpstreamError("EPISODE_NOT_FOUND", "not used");
      },
      listEpisodeCharacters: async () => [],
    },
    characterService: { getCharacter },
  });

  await app.ready();

  return app;
}

afterEach(async () => {
  await app.close();
});

describe("GET /v1/characters/:characterId", () => {
  it("answers with the character detail contract", async () => {
    const server = await buildWith(async () => morty);

    const response = await server.inject({ method: "GET", url: "/v1/characters/2" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: morty });
  });

  it("passes the requested character to the service", async () => {
    const getCharacter = vi.fn().mockResolvedValue(morty);
    const server = await buildWith(getCharacter);

    await server.inject({ method: "GET", url: "/v1/characters/42" });

    expect(getCharacter).toHaveBeenCalledWith(42);
  });

  it("publishes appearances as identity only, with no upstream or client urls", async () => {
    const server = await buildWith(async () => morty);

    const response = await server.inject({ method: "GET", url: "/v1/characters/2" });
    const [first] = response.json().data.episodes;

    expect(Object.keys(first)).toEqual(["id", "code", "name"]);
    expect(response.body).not.toContain("rickandmortyapi.com/api/episode");
    expect(response.body).not.toContain("/episodes/");
  });

  it("answers with 404 when the character does not exist", async () => {
    const server = await buildWith(async () => {
      throw new UpstreamError(
        "CHARACTER_NOT_FOUND",
        "Character 9999 does not exist at https://rickandmortyapi.com/api/character/9999",
      );
    });

    const response = await server.inject({ method: "GET", url: "/v1/characters/9999" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("CHARACTER_NOT_FOUND");
    expect(response.body).not.toContain("rickandmortyapi.com");
  });

  it("maps an upstream failure to the project error envelope", async () => {
    const server = await buildWith(async () => {
      throw new UpstreamError(
        "UPSTREAM_UNAVAILABLE",
        "Request to the Rick and Morty API failed: https://rickandmortyapi.com/api/character/2",
      );
    });

    const response = await server.inject({ method: "GET", url: "/v1/characters/2" });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("UPSTREAM_UNAVAILABLE");
    expect(response.body).not.toContain("rickandmortyapi.com");
  });

  it("maps a failed appearance resolution to the project error envelope", async () => {
    const server = await buildWith(async () => {
      throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", "episode batch was not an array");
    });

    const response = await server.inject({ method: "GET", url: "/v1/characters/2" });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("UPSTREAM_INVALID_RESPONSE");
  });

  it("rejects a character id that is not a valid identifier", async () => {
    const server = await buildWith(async () => morty);

    const invalid = await server.inject({ method: "GET", url: "/v1/characters/abc" });
    const zero = await server.inject({ method: "GET", url: "/v1/characters/0" });

    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().error.code).toBe("INVALID_REQUEST");
    expect(zero.statusCode).toBe(400);
  });

  it("hides an unexpected failure behind the generic error", async () => {
    const server = await buildWith(async () => {
      throw new Error("secret internal detail");
    });

    const response = await server.inject({ method: "GET", url: "/v1/characters/2" });

    expect(response.statusCode).toBe(500);
    expect(response.json().error.code).toBe("INTERNAL_ERROR");
    expect(response.body).not.toContain("secret internal detail");
  });
});
