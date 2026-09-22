import { describe, expect, it } from "vitest";

import { loadConfig } from "./env.js";

describe("loadConfig", () => {
  it("uses safe defaults when nothing is configured", () => {
    const config = loadConfig({});

    expect(config).toEqual({
      environment: "development",
      host: "0.0.0.0",
      port: 4000,
      logLevel: "info",
      corsOrigins: ["http://localhost:3000"],
    });
  });

  it("keeps test runs quiet", () => {
    expect(loadConfig({ NODE_ENV: "test" }).logLevel).toBe("silent");
  });

  it("reads the deployment values from the environment", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      HOST: "127.0.0.1",
      PORT: "8080",
      LOG_LEVEL: "warn",
      CORS_ORIGINS: "https://web.example.com, https://admin.example.com",
    });

    expect(config).toEqual({
      environment: "production",
      host: "127.0.0.1",
      port: 8080,
      logLevel: "warn",
      corsOrigins: ["https://web.example.com", "https://admin.example.com"],
    });
  });

  it("rejects a port value that cannot be served", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrow("Invalid PORT value");
    expect(() => loadConfig({ PORT: "99999" })).toThrow("Invalid PORT value");
  });

  it("treats an unknown environment name as development", () => {
    expect(loadConfig({ NODE_ENV: "staging" }).environment).toBe("development");
  });
});
