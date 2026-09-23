import type { FastifyInstance } from "fastify";

import type { EpisodeService } from "../../services/episodes.js";

import { characterSchema, episodeSchema, errorSchema } from "./schemas.js";

export interface EpisodeRoutesOptions {
  episodeService: EpisodeService;
}

const characterListSchema = {
  type: "object",
  required: ["data", "meta"],
  properties: {
    data: {
      type: "array",
      description: "Characters of the episode, ordered alphabetically by name.",
      items: characterSchema,
    },
    meta: {
      type: "object",
      required: ["total", "episodeId"],
      properties: {
        total: { type: "integer", description: "How many characters the episode has." },
        episodeId: { type: "integer", description: "Episode the characters belong to." },
      },
    },
  },
} as const;

const episodeParamsSchema = {
  type: "object",
  required: ["episodeId"],
  properties: {
    episodeId: {
      type: "integer",
      minimum: 1,
      description: "Identifier of the episode.",
      examples: [1],
    },
  },
} as const;

const episodeListSchema = {
  type: "object",
  required: ["data", "meta"],
  properties: {
    data: { type: "array", items: episodeSchema },
    meta: {
      type: "object",
      required: ["total"],
      properties: {
        total: { type: "integer", description: "How many episodes the contract returned." },
      },
    },
  },
} as const;

const episodeResponseSchema = {
  type: "object",
  required: ["data"],
  properties: {
    data: episodeSchema,
  },
} as const;

export async function episodeRoutes(
  app: FastifyInstance,
  options: EpisodeRoutesOptions,
): Promise<void> {
  const { episodeService } = options;

  app.get(
    "/episodes",
    {
      schema: {
        operationId: "listEpisodes",
        summary: "List every episode",
        description:
          "Returns every Rick and Morty episode through the project contract. " +
          "Upstream pagination is resolved by the API, so clients receive one complete list.",
        tags: ["episodes"],
        response: {
          200: episodeListSchema,
          502: { ...errorSchema, description: "The upstream episode source failed." },
          500: { ...errorSchema, description: "Unexpected server error." },
        },
      },
    },
    async () => {
      const episodes = await episodeService.listEpisodes();

      return { data: episodes, meta: { total: episodes.length } };
    },
  );

  app.get<{ Params: { episodeId: number } }>(
    "/episodes/:episodeId",
    {
      schema: {
        operationId: "getEpisode",
        summary: "Get one episode",
        description: "Returns one episode through the project contract.",
        tags: ["episodes"],
        params: episodeParamsSchema,
        response: {
          200: episodeResponseSchema,
          400: { ...errorSchema, description: "The episode id is not a valid identifier." },
          404: { ...errorSchema, description: "No episode exists with that id." },
          502: { ...errorSchema, description: "The upstream episode source failed." },
          500: { ...errorSchema, description: "Unexpected server error." },
        },
      },
    },
    async (request) => {
      const episode = await episodeService.getEpisode(request.params.episodeId);

      return { data: episode };
    },
  );

  app.get<{ Params: { episodeId: number } }>(
    "/episodes/:episodeId/characters",
    {
      schema: {
        operationId: "listEpisodeCharacters",
        summary: "List the characters of one episode",
        description:
          "Returns every character appearing in the episode, ordered alphabetically by name. " +
          "The ordering is part of the contract, so clients do not sort it themselves.",
        tags: ["episodes"],
        params: episodeParamsSchema,
        response: {
          200: characterListSchema,
          400: { ...errorSchema, description: "The episode id is not a valid identifier." },
          404: { ...errorSchema, description: "No episode exists with that id." },
          502: { ...errorSchema, description: "The upstream episode source failed." },
          500: { ...errorSchema, description: "Unexpected server error." },
        },
      },
    },
    async (request) => {
      const { episodeId } = request.params;
      const characters = await episodeService.listEpisodeCharacters(episodeId);

      return { data: characters, meta: { total: characters.length, episodeId } };
    },
  );
}
