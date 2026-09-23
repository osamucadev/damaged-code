import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export const DOCUMENTATION_ROUTE = "/docs";

/**
 * OpenAPI description of the project contract.
 *
 * The document is generated from the same schemas the routes use for
 * validation and serialization, so it cannot drift from the implementation.
 */
export async function registerOpenApi(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Damaged Code API",
        description:
          "Project owned REST contract for the Damaged Code challenge. " +
          "Every client, web and mobile, consumes this API. " +
          "Clients never call the Rick and Morty API or Firebase directly.",
        version: "0.1.0",
      },
      tags: [
        { name: "episodes", description: "Rick and Morty episodes, in the project contract." },
        { name: "characters", description: "Characters and their episode appearances." },
        { name: "operations", description: "Operational endpoints, outside the product contract." },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: DOCUMENTATION_ROUTE,
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}
