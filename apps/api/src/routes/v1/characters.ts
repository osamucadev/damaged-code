import type { FastifyInstance } from "fastify";

import type { CharacterService } from "../../services/characters.js";

import { characterSchema, errorSchema } from "./schemas.js";

export interface CharacterRoutesOptions {
  characterService: CharacterService;
}

const episodeReferenceSchema = {
  type: "object",
  required: ["id", "code", "name"],
  properties: {
    id: { type: "integer", description: "Stable episode identifier.", examples: [1] },
    code: { type: "string", description: "Production code.", examples: ["S01E01"] },
    name: { type: "string", description: "Episode title.", examples: ["Pilot"] },
  },
  description:
    "Identity of one episode. It carries no link on purpose: clients build their own " +
    "navigation from the id, and upstream URLs never reach a client.",
} as const;

const characterDetailSchema = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "object",
      required: [...characterSchema.required, "episodes"],
      properties: {
        ...characterSchema.properties,
        episodes: {
          type: "array",
          description: "Episodes the character appears in, ordered by episode id.",
          items: episodeReferenceSchema,
        },
      },
    },
  },
} as const;

const characterParamsSchema = {
  type: "object",
  required: ["characterId"],
  properties: {
    characterId: {
      type: "integer",
      minimum: 1,
      description: "Identifier of the character.",
      examples: [2],
    },
  },
} as const;

export async function characterRoutes(
  app: FastifyInstance,
  options: CharacterRoutesOptions,
): Promise<void> {
  const { characterService } = options;

  app.get<{ Params: { characterId: number } }>(
    "/characters/:characterId",
    {
      schema: {
        operationId: "getCharacter",
        summary: "Get one character with its episode appearances",
        description:
          "Returns one character through the project contract, including the episodes it " +
          "appears in as normalized references. The episode list endpoint stays lean, so " +
          "appearances are only resolved here.",
        tags: ["characters"],
        params: characterParamsSchema,
        response: {
          200: characterDetailSchema,
          400: { ...errorSchema, description: "The character id is not a valid identifier." },
          404: { ...errorSchema, description: "No character exists with that id." },
          502: { ...errorSchema, description: "The upstream data source failed." },
          500: { ...errorSchema, description: "Unexpected server error." },
        },
      },
    },
    async (request) => {
      const character = await characterService.getCharacter(request.params.characterId);

      return { data: character };
    },
  );
}
