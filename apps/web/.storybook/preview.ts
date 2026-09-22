import type { Preview } from "@storybook/nextjs-vite";

// Loads the design token layer so components render exactly as they do in the
// application. Storybook never talks to the project API.
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
