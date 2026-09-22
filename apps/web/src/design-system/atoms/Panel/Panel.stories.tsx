import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../Button/Button";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";

import { Panel } from "./Panel";

const meta = {
  title: "Atoms/Panel",
  component: Panel,
  parameters: { layout: "padded" },
  args: {
    title: "Episode browser",
    children: "Panels hold the structural content of the interface.",
  },
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHardware: Story = {
  args: { withScrews: true },
};

export const Raised: Story = {
  args: { tone: "raised", withScrews: true },
};

export const WithHeaderAction: Story = {
  args: {
    headerAction: <Button size="small">Refresh</Button>,
  },
};

export const WithStatus: Story = {
  args: {
    headerAction: <StatusIndicator tone="ok">Online</StatusIndicator>,
  },
};

export const Untitled: Story = {
  args: { title: undefined },
};

export const LongContent: Story = {
  args: {
    title: "Navegador de episodios da temporada completa do multiverso",
    children:
      "Titulos longos precisam quebrar linha dentro do painel em vez de transbordar a moldura, porque o portugues costuma ocupar mais espaco que o ingles.",
  },
};
