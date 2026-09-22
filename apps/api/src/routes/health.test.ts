import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { buildApp } from "../app.js";
import { loadConfig } from "../config/env.js";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ config: loadConfig({ NODE_ENV: "test" }) });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("answers with a healthy status payload", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");

    const body = response.json();

    expect(body.status).toBe("ok");
    expect(body.service).toBe("damaged-code-api");
    expect(typeof body.uptime).toBe("number");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it("allows the configured web origin to read the health state", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:3000" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("does not answer unknown routes", async () => {
    const response = await app.inject({ method: "GET", url: "/does-not-exist" });

    expect(response.statusCode).toBe(404);
  });
});
