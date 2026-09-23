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
      upstream: {
        rickAndMortyBaseUrl: "https://rickandmortyapi.com/api",
        requestTimeoutMs: 8000,
      },
      cache: { ttlMs: 3_600_000 },
      firebase: { enabled: false, projectId: null, emulatorHost: null },
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
      upstream: {
        rickAndMortyBaseUrl: "https://rickandmortyapi.com/api",
        requestTimeoutMs: 8000,
      },
      cache: { ttlMs: 3_600_000 },
      firebase: { enabled: false, projectId: null, emulatorHost: null },
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

describe("loadConfig upstream", () => {
  it("removes a trailing slash from the configured upstream url", () => {
    const config = loadConfig({ RICK_AND_MORTY_API_URL: "http://upstream.test/api/" });

    expect(config.upstream.rickAndMortyBaseUrl).toBe("http://upstream.test/api");
  });

  it("rejects a timeout that cannot be used", () => {
    expect(() => loadConfig({ UPSTREAM_TIMEOUT_MS: "soon" })).toThrow(
      "Invalid UPSTREAM_TIMEOUT_MS",
    );
  });
});

describe("loadConfig firebase mode", () => {
  it("stays disabled unless it is explicitly requested", () => {
    expect(loadConfig({}).firebase.enabled).toBe(false);
    expect(
      loadConfig({ FIRESTORE_EMULATOR_HOST: "firebase-emulators:8080" }).firebase.enabled,
    ).toBe(false);
  });

  it("reads the local emulator target when Firebase mode is requested", () => {
    const { firebase } = loadConfig({
      FIREBASE_ENABLED: "true",
      FIREBASE_PROJECT_ID: "demo-damaged-code-local",
      FIRESTORE_EMULATOR_HOST: "firebase-emulators:8080",
    });

    expect(firebase).toEqual({
      enabled: true,
      projectId: "demo-damaged-code-local",
      emulatorHost: "firebase-emulators:8080",
    });
  });

  it("refuses to start when Firebase mode has no project id", () => {
    expect(() =>
      loadConfig({
        FIREBASE_ENABLED: "true",
        FIRESTORE_EMULATOR_HOST: "firebase-emulators:8080",
      }),
    ).toThrow("FIREBASE_PROJECT_ID is missing");
  });

  it("refuses to fall back silently when the emulator target is missing", () => {
    expect(() =>
      loadConfig({
        FIREBASE_ENABLED: "true",
        FIREBASE_PROJECT_ID: "demo-damaged-code-local",
      }),
    ).toThrow("FIRESTORE_EMULATOR_HOST is missing");
  });

  it("allows production to use real credentials instead of an emulator", () => {
    const { firebase } = loadConfig({
      NODE_ENV: "production",
      FIREBASE_ENABLED: "true",
      FIREBASE_PROJECT_ID: "samuelcaetitedev",
    });

    expect(firebase).toEqual({
      enabled: true,
      projectId: "samuelcaetitedev",
      emulatorHost: null,
    });
  });
});

describe("loadConfig cache", () => {
  it("uses one hour as the default entry lifetime", () => {
    expect(loadConfig({}).cache.ttlMs).toBe(3_600_000);
  });

  it("accepts an explicit lifetime", () => {
    expect(loadConfig({ CACHE_TTL_MS: "60000" }).cache.ttlMs).toBe(60_000);
  });

  it("allows disabling reuse with a zero lifetime", () => {
    expect(loadConfig({ CACHE_TTL_MS: "0" }).cache.ttlMs).toBe(0);
  });

  it("rejects a lifetime that cannot be used", () => {
    expect(() => loadConfig({ CACHE_TTL_MS: "soon" })).toThrow("Invalid CACHE_TTL_MS");
    expect(() => loadConfig({ CACHE_TTL_MS: "-1" })).toThrow("Invalid CACHE_TTL_MS");
  });
});
