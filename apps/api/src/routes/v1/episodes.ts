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
}
