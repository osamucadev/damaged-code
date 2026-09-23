import cors from "@fastify/cors";
import Fastify, {
  type FastifyBaseLogger,
  type FastifyError,
  type FastifyInstance,
} from "fastify";

import {
  createCacheReader,
  passThroughCacheReader,
  type Cache,
  type CacheReader,
} from "./cache/cache.js";
import { createFirestoreCache } from "./cache/firestore-cache.js";
import { createMemoryCache } from "./cache/memory-cache.js";
import { loadConfig, type AppConfig } from "./config/env.js";
import { registerOpenApi } from "./docs/openapi.js";
import { healthRoutes } from "./routes/health.js";
import { characterRoutes } from "./routes/v1/characters.js";
import { episodeRoutes } from "./routes/v1/episodes.js";
import { createCharacterService, type CharacterService } from "./services/characters.js";
import { createEpisodeService, type EpisodeService } from "./services/episodes.js";
import { createRickAndMortyClient } from "./upstream/rick-and-morty/client.js";
import { UpstreamError } from "./upstream/rick-and-morty/errors.js";

export interface BuildAppOptions {
  config?: AppConfig;
  /** Injected by tests so the suite never reaches the live upstream service. */
  episodeService?: EpisodeService;
  characterService?: CharacterService;
  /** Injected by tests that exercise cache behavior without a real backend. */
  cache?: Cache;
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
      // The thrown message keeps the diagnostic detail, including the upstream
      // URL. Only the public message leaves the server.
      request.log.error({ err: error, code: error.code }, "upstream request failed");

      return reply
        .status(error.status)
        .send({ error: { code: error.code, message: error.publicMessage } });
    }

    if (error.validation !== undefined) {
      return reply.status(400).send({
        error: { code: "INVALID_REQUEST", message: error.message },
      });
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

  // The requested route is not echoed back, so nothing from the request line
  // is reflected into the response body.
  app.setNotFoundHandler((_request, reply) =>
    reply.status(404).send({
      error: { code: "NOT_FOUND", message: "The requested route does not exist." },
    }),
  );

  const upstreamClient = createRickAndMortyClient({
    baseUrl: config.upstream.rickAndMortyBaseUrl,
    requestTimeoutMs: config.upstream.requestTimeoutMs,
  });

  /*
   * Which cache backs the BFF follows the runtime mode that already exists in
   * this repository. The standard mode keeps everything in process. The
   * explicit Firebase mode shares one cache through Firestore, which is what a
   * multi instance deployment needs later.
   */
  const cache = options.cache ?? (await createCacheForConfig(config, app.log));
  const cached: CacheReader =
    cache === undefined ? passThroughCacheReader : createCacheReader(cache, app.log);

  const episodeService = options.episodeService ?? createEpisodeService(upstreamClient, cached);
  const characterService =
    options.characterService ?? createCharacterService(upstreamClient, cached);

  // Operational routes stay outside the versioned product contract.
  await app.register(healthRoutes);
  await app.register(episodeRoutes, { prefix: "/v1", episodeService });
  await app.register(characterRoutes, { prefix: "/v1", characterService });

  return app;
}

/**
 * Builds the cache for the active runtime mode.
 *
 * A Firestore cache that cannot be created is a startup failure and is not
 * silently downgraded to an in-process cache, because the repository treats
 * Firebase mode as explicit: asking for it and getting something else would
 * hide the problem.
 */
async function createCacheForConfig(
  config: AppConfig,
  logger: FastifyBaseLogger,
): Promise<Cache> {
  if (config.firebase.enabled && config.firebase.projectId !== null) {
    logger.info(
      { projectId: config.firebase.projectId, ttlMs: config.cache.ttlMs },
      "using the Firestore backed cache",
    );

    return createFirestoreCache({
      projectId: config.firebase.projectId,
      emulatorHost: config.firebase.emulatorHost,
      ttlMs: config.cache.ttlMs,
    });
  }

  logger.info({ ttlMs: config.cache.ttlMs }, "using the in-process cache");

  return createMemoryCache({ ttlMs: config.cache.ttlMs });
}

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}
