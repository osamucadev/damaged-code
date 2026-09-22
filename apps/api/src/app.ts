import cors from "@fastify/cors";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";

import { loadConfig, type AppConfig } from "./config/env.js";
import { registerOpenApi } from "./docs/openapi.js";
import { healthRoutes } from "./routes/health.js";
import { episodeRoutes } from "./routes/v1/episodes.js";
import { createEpisodeService, type EpisodeService } from "./services/episodes.js";
import { createRickAndMortyClient } from "./upstream/rick-and-morty/client.js";
import { UpstreamError } from "./upstream/rick-and-morty/errors.js";

export interface BuildAppOptions {
  config?: AppConfig;
  /** Injected by tests so the suite never reaches the live upstream service. */
  episodeService?: EpisodeService;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();

  const app = Fastify({
    logger: { level: config.logLevel },
  });

  app.decorate("config", config);

  await app.register(cors, {
    origin: config.corsOrigins,
    methods: ["GET", "HEAD", "OPTIONS"],
  });

  // Registered before the routes, so every route schema reaches the document.
  await registerOpenApi(app);

  /*
   * One error envelope for the whole API. Clients read the stable code, so the
   * message can change without breaking them.
   */
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof UpstreamError) {
      request.log.error({ err: error, code: error.code }, "upstream request failed");

      return reply.status(502).send({ error: { code: error.code, message: error.message } });
    }

    if (error.statusCode !== undefined && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        error: { code: error.code ?? "BAD_REQUEST", message: error.message },
      });
    }

    request.log.error({ err: error }, "unhandled error");

    return reply.status(500).send({
      error: { code: "INTERNAL_ERROR", message: "The request could not be completed." },
    });
  });

  app.setNotFoundHandler((request, reply) =>
    reply.status(404).send({
      error: { code: "NOT_FOUND", message: `Route ${request.method} ${request.url} not found.` },
    }),
  );

  const episodeService =
    options.episodeService ??
    createEpisodeService(
      createRickAndMortyClient({
        baseUrl: config.upstream.rickAndMortyBaseUrl,
        requestTimeoutMs: config.upstream.requestTimeoutMs,
      }),
    );

  // Operational routes stay outside the versioned product contract.
  await app.register(healthRoutes);
  await app.register(episodeRoutes, { prefix: "/v1", episodeService });

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}
