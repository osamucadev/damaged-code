import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { loadConfig, type AppConfig } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";

export interface BuildAppOptions {
  config?: AppConfig;
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

  await app.register(healthRoutes);

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}
