import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  args: { children: "S01E01", tone: "display" },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {};

export const Accent: Story = {
  args: { tone: "accent" },
};

export const Neutral: Story = {
  args: { tone: "neutral", children: "Unknown" },
};

export const LongContent: Story = {
  args: { children: "Temporada 1 episodio 1" },
};
