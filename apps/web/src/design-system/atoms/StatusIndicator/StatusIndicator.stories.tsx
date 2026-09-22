import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusIndicator } from "./StatusIndicator";

const meta = {
  title: "Atoms/StatusIndicator",
  component: StatusIndicator,
  parameters: { layout: "centered" },
  args: {
    tone: "ok",
    children: "Online",
  },
} satisfies Meta<typeof StatusIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ok: Story = {};

export const Info: Story = {
  args: { tone: "info", children: "Checking" },
};

export const Warning: Story = {
  args: { tone: "warning", children: "Degraded" },
};

export const Danger: Story = {
  args: { tone: "danger", children: "Unreachable" },
};

export const Neutral: Story = {
  args: { tone: "neutral", children: "Unknown" },
};

/**
 * The status text is always present, so the meaning never depends on color.
 */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--dc-space-3)" }}>
      <StatusIndicator tone="ok">Online</StatusIndicator>
      <StatusIndicator tone="info">Checking</StatusIndicator>
      <StatusIndicator tone="warning">Degraded</StatusIndicator>
      <StatusIndicator tone="danger">Unreachable</StatusIndicator>
      <StatusIndicator tone="neutral">Unknown</StatusIndicator>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    tone: "danger",
    children: "Nao foi possivel contatar a API do projeto",
  },
};
