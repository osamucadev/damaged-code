const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "0.0.0.0";

export type AppEnvironment = "development" | "production" | "test";

export interface AppConfig {
  environment: AppEnvironment;
  host: string;
  port: number;
  logLevel: string;
  corsOrigins: string[];
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

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const environment = readEnvironment(source.NODE_ENV);

  return {
    environment,
    host: source.HOST ?? DEFAULT_HOST,
    port: readPort(source.PORT),
    logLevel: source.LOG_LEVEL ?? (environment === "test" ? "silent" : "info"),
    corsOrigins: readCorsOrigins(source.CORS_ORIGINS),
  };
}
