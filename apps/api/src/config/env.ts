const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "0.0.0.0";

export type AppEnvironment = "development" | "production" | "test";

/**
 * Server side Firebase target.
 *
 * Only the BFF ever talks to Firebase. Clients never do. No persistence is
 * implemented yet, so this is configuration and validation only.
 */
export interface FirebaseConfig {
  enabled: boolean;
  projectId: string | null;
  emulatorHost: string | null;
}

export interface UpstreamConfig {
  /** Base URL of the public Rick and Morty REST API. */
  rickAndMortyBaseUrl: string;
  requestTimeoutMs: number;
}

export interface AppConfig {
  environment: AppEnvironment;
  host: string;
  port: number;
  logLevel: string;
  corsOrigins: string[];
  upstream: UpstreamConfig;
  firebase: FirebaseConfig;
}

function readEnvironment(value: string | undefined): AppEnvironment {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}

function readPort(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return parsed;
}

function readCorsOrigins(value: string | undefined): string[] {
  if (value === undefined || value.trim() === "") {
    return ["http://localhost:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin !== "");
}

const DEFAULT_RICK_AND_MORTY_URL = "https://rickandmortyapi.com/api";
const DEFAULT_UPSTREAM_TIMEOUT_MS = 8000;

function readUpstream(source: NodeJS.ProcessEnv): UpstreamConfig {
  const baseUrl = source.RICK_AND_MORTY_API_URL?.trim();
  const timeout = source.UPSTREAM_TIMEOUT_MS?.trim();
  const parsedTimeout = timeout === undefined || timeout === "" ? NaN : Number.parseInt(timeout, 10);

  if (timeout !== undefined && timeout !== "" && (Number.isNaN(parsedTimeout) || parsedTimeout <= 0)) {
    throw new Error(`Invalid UPSTREAM_TIMEOUT_MS value: ${timeout}`);
  }

  return {
    rickAndMortyBaseUrl: (baseUrl === undefined || baseUrl === ""
      ? DEFAULT_RICK_AND_MORTY_URL
      : baseUrl
    ).replace(/\/+$/, ""),
    requestTimeoutMs: Number.isNaN(parsedTimeout) ? DEFAULT_UPSTREAM_TIMEOUT_MS : parsedTimeout,
  };
}

function readFirebase(
  source: NodeJS.ProcessEnv,
  environment: AppEnvironment,
): FirebaseConfig {
  const enabled = source.FIREBASE_ENABLED === "true";

  if (!enabled) {
    return { enabled: false, projectId: null, emulatorHost: null };
  }

  const projectId = source.FIREBASE_PROJECT_ID?.trim();

  if (projectId === undefined || projectId === "") {
    throw new Error("FIREBASE_ENABLED is true but FIREBASE_PROJECT_ID is missing");
  }

  const emulatorHost = source.FIRESTORE_EMULATOR_HOST?.trim();
  const hasEmulator = emulatorHost !== undefined && emulatorHost !== "";

  /*
   * Outside production the only supported Firebase target is the local
   * emulator. Failing here is deliberate: a missing emulator must never turn
   * into a silent connection somewhere else.
   */
  if (!hasEmulator && environment !== "production") {
    throw new Error(
      "FIREBASE_ENABLED is true but FIRESTORE_EMULATOR_HOST is missing. " +
        "Start the environment with docker-compose.firebase.yml, or unset FIREBASE_ENABLED.",
    );
  }

  return {
    enabled: true,
    projectId,
    emulatorHost: hasEmulator ? emulatorHost : null,
  };
}

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const environment = readEnvironment(source.NODE_ENV);

  return {
    environment,
    host: source.HOST ?? DEFAULT_HOST,
    port: readPort(source.PORT),
    logLevel: source.LOG_LEVEL ?? (environment === "test" ? "silent" : "info"),
    corsOrigins: readCorsOrigins(source.CORS_ORIGINS),
    upstream: readUpstream(source),
    firebase: readFirebase(source, environment),
  };
}
