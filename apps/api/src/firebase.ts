import type { IncomingMessage, ServerResponse } from "node:http";

import { onRequest } from "firebase-functions/v2/https";

import { buildApp } from "./app.js";
import { loadConfig } from "./config/env.js";

type FastifyApp = Awaited<ReturnType<typeof buildApp>>;

let appPromise: Promise<FastifyApp> | undefined;

function getApp(): Promise<FastifyApp> {
  const config = loadConfig({ ...process.env, PORT: undefined });

  appPromise ??= buildApp({ config }).then(async (app) => {
    await app.ready();
    return app;
  });

  return appPromise;
}

async function forwardToFastify(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const app = await getApp();

  await new Promise<void>((resolve, reject) => {
    const cleanup = (): void => {
      response.off("finish", finish);
      response.off("close", finish);
      response.off("error", fail);
    };

    const finish = (): void => {
      cleanup();
      resolve();
    };

    const fail = (error: Error): void => {
      cleanup();
      reject(error);
    };

    response.once("finish", finish);
    response.once("close", finish);
    response.once("error", fail);
    app.server.emit("request", request, response);
  });
}

export const damagedCodeApi = onRequest(
  {
    cors: false,
    invoker: "public",
    maxInstances: 10,
    region: "us-central1",
  },
  forwardToFastify,
);
