import type { FastifyInstance } from "fastify";

import type { EpisodeService } from "../../services/episodes.js";

export interface EpisodeRoutesOptions {
  episodeService: EpisodeService;
}

const episodeSchema = {
  type: "object",
  required: ["id", "code", "name", "airDate", "characterCount"],
  properties: {
    id: { type: "integer", description: "Stable episode identifier.", examples: [1] },
    code: { type: "string", description: "Production code.", examples: ["S01E01"] },
    name: { type: "string", description: "Episode title.", examples: ["Pilot"] },
    airDate: {
      type: "string",
      description: "Original air date as published upstream.",
      examples: ["December 2, 2013"],
    },
    characterCount: {
      type: "integer",
      description: "How many characters appear in the episode.",
      examples: [19],
    },
  },
} as const;

const characterSchema = {
  type: "object",
  required: [
    "id",
    "name",
    "image",
    "status",
    "species",
    "type",
    "gender",
    "origin",
    "location",
  ],
  properties: {
    id: { type: "integer", description: "Stable character identifier.", examples: [1] },
    name: { type: "string", description: "Character name.", examples: ["Rick Sanchez"] },
    image: {
      type: "string",
      description: "Absolute URL of the character portrait.",
      examples: ["https://rickandmortyapi.com/api/character/avatar/1.jpeg"],
    },
    status: { type: "string", description: "Alive, Dead, or unknown.", examples: ["Alive"] },
    species: { type: "string", examples: ["Human"] },
    type: { type: "string", description: "Subtype. Often empty.", examples: [""] },
    gender: { type: "string", examples: ["Male"] },
    origin: { type: "string", description: "Origin name.", examples: ["Earth (C-137)"] },
    location: {
      type: "string",
      description: "Last known location name.",
      examples: ["Citadel of Ricks"],
    },
  },
} as const;

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

export const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: {
          type: "string",
          description: "Stable error code. Clients translate this, not the message.",
          examples: ["UPSTREAM_UNAVAILABLE"],
        },
        message: {
          type: "string",
          description: "Developer facing explanation. It is not meant for end users.",
        },
      },
    },
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
