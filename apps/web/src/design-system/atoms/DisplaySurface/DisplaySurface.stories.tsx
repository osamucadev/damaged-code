import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DisplaySurface } from "./DisplaySurface";

const meta = {
  title: "Atoms/DisplaySurface",
  component: DisplaySurface,
  parameters: { layout: "padded" },
  args: {
    children: "EPISODE C-137 READY",
  },
} satisfies Meta<typeof DisplaySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Warning: Story = {
  args: { tone: "warning", children: "UPSTREAM DELAY DETECTED" },
};

export const Error: Story = {
  args: { tone: "danger", children: "CONNECTION LOST" },
};

export const LongContent: Story = {
  args: {
    children:
      "Nao foi possivel carregar a lista de episodios porque a API do projeto nao respondeu a tempo. Tente novamente em alguns instantes.",
  },
};
