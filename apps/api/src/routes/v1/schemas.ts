/**
 * Schemas shared by more than one route.
 *
 * Fastify uses them for response serialization and the OpenAPI document is
 * generated from the same objects, so the published contract cannot drift from
 * what the routes actually return.
 */

export const episodeSchema = {
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

export const characterSchema = {
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
          description: "Stable error code. Clients branch on this, not on the message.",
          examples: ["UPSTREAM_UNAVAILABLE"],
        },
        message: {
          type: "string",
          description:
            "Safe, stable explanation. It never carries upstream URLs or internal detail.",
        },
      },
    },
  },
} as const;
