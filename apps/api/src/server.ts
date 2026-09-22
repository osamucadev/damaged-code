import { buildApp } from "./app.js";
import { loadConfig } from "./config/env.js";

async function start(): Promise<void> {
  const config = loadConfig();
  const app = await buildApp({ config });

  const closeGracefully = async (signal: NodeJS.Signals): Promise<void> => {
    app.log.info({ signal }, "shutting down");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", closeGracefully);
  process.on("SIGTERM", closeGracefully);

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

await start();
