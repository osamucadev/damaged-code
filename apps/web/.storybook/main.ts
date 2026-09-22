import type { StorybookConfig } from "@storybook/nextjs-vite";

/*
 * The browser talks to Storybook through the published host port, which differs
 * from the port inside the container. Vite would otherwise build its hot module
 * replacement URL from the internal port, and live updates would never reach
 * the browser. Outside Docker the default matches the internal port.
 */
const hmrClientPort = Number(process.env.STORYBOOK_HMR_CLIENT_PORT ?? "6006");

const config: StorybookConfig = {
  // Only design system components are documented here. Product screens live in
  // the application and are exercised by tests, not by Storybook.
  stories: ["../src/design-system/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  core: {
    disableTelemetry: true,
  },
  viteFinal: (config) => ({
    ...config,
    server: {
      ...config.server,
      hmr: {
        ...(typeof config.server?.hmr === "object" ? config.server.hmr : {}),
        clientPort: hmrClientPort,
      },
    },
  }),
};

export default config;
