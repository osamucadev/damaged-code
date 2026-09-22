import type { StorybookConfig } from "@storybook/nextjs-vite";

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
};

export default config;
