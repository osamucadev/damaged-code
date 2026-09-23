import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../app.js";
import { loadConfig } from "../config/env.js";

let app: FastifyInstance;

afterEach(async () => {
  await app.close();
});

async function buildDocumentedApp(): Promise<FastifyInstance> {
  app = await buildApp({
    config: loadConfig({ NODE_ENV: "test" }),
    episodeService: {
      listEpisodes: async () => [],
      getEpisode: async () => ({
        id: 1,
        code: "S01E01",
        name: "Pilot",
        airDate: "December 2, 2013",
        characterCount: 19,
      }),
      listEpisodeCharacters: async () => [],
    },
  });

  await app.ready();

  return app;
}

describe("OpenAPI document", () => {
  it("documents the episode listing endpoint", async () => {
    const server = await buildDocumentedApp();

    const response = await server.inject({ method: "GET", url: "/docs/json" });

    expect(response.statusCode).toBe(200);

    const document = response.json();
    const operation = document.paths["/v1/episodes"]?.get;

    expect(operation).toBeDefined();
    expect(operation.operationId).toBe("listEpisodes");
    expect(operation.tags).toContain("episodes");
  });

  it("documents the episode response contract", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const success = document.paths["/v1/episodes"].get.responses["200"];
    const episodeProperties =
      success.content["application/json"].schema.properties.data.items.properties;

    expect(Object.keys(episodeProperties)).toEqual([
      "id",
      "code",
      "name",
      "airDate",
      "characterCount",
    ]);
  });

  it("documents the upstream failure response", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const responses = document.paths["/v1/episodes"].get.responses;

    expect(Object.keys(responses)).toEqual(expect.arrayContaining(["200", "500", "502"]));
    expect(
      responses["502"].content["application/json"].schema.properties.error.properties.code,
    ).toBeDefined();
  });

  it("keeps the operational health route out of the versioned product paths", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();

    expect(document.paths["/health"]?.get.tags).toContain("operations");
    expect(document.paths["/v1/health"]).toBeUndefined();
  });

  it("serves the documentation user interface", async () => {
    const server = await buildDocumentedApp();

    const response = await server.inject({ method: "GET", url: "/docs" });

    expect([200, 302]).toContain(response.statusCode);
  });
})

describe("OpenAPI character documentation", () => {
  it("documents the episode characters endpoint with its path parameter", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const operation = document.paths["/v1/episodes/{episodeId}/characters"]?.get;

    expect(operation.operationId).toBe("listEpisodeCharacters");
    expect(operation.parameters[0].name).toBe("episodeId");
    expect(operation.parameters[0].in).toBe("path");
    expect(operation.parameters[0].required).toBe(true);
  });

  it("documents the character contract and its failure responses", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const operation = document.paths["/v1/episodes/{episodeId}/characters"].get;
    const properties =
      operation.responses["200"].content["application/json"].schema.properties.data.items
        .properties;

    expect(Object.keys(properties)).toEqual([
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
    expect(Object.keys(operation.responses)).toEqual(
      expect.arrayContaining(["200", "400", "404", "500", "502"]),
    );
  });
});

describe("OpenAPI episode detail documentation", () => {
  it("documents the single episode endpoint and its failure responses", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const operation = document.paths["/v1/episodes/{episodeId}"].get;

    expect(operation.operationId).toBe("getEpisode");
    expect(operation.parameters[0]).toMatchObject({
      name: "episodeId",
      in: "path",
      required: true,
    });
    expect(Object.keys(operation.responses)).toEqual(
      expect.arrayContaining(["200", "400", "404", "500", "502"]),
    );
  });
});

describe("OpenAPI character documentation", () => {
  it("documents the character detail endpoint with its path parameter", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const operation = document.paths["/v1/characters/{characterId}"]?.get;

    expect(operation.operationId).toBe("getCharacter");
    expect(operation.tags).toContain("characters");
    expect(operation.parameters[0].name).toBe("characterId");
    expect(operation.parameters[0].in).toBe("path");
  });

  it("documents the episode reference shape and the failure responses", async () => {
    const server = await buildDocumentedApp();

    const document = (await server.inject({ method: "GET", url: "/docs/json" })).json();
    const operation = document.paths["/v1/characters/{characterId}"].get;
    const data = operation.responses["200"].content["application/json"].schema.properties.data;

    expect(Object.keys(data.properties.episodes.items.properties)).toEqual([
      "id",
      "code",
      "name",
    ]);
    expect(Object.keys(operation.responses)).toEqual(
      expect.arrayContaining(["200", "400", "404", "500", "502"]),
    );
  });
});
