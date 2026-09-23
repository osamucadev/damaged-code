import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EpisodeBoundaryCard } from "./EpisodeBoundaryCard";

const meta = {
  title: "Molecules/EpisodeBoundaryCard",
  component: EpisodeBoundaryCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "min(24rem, 90vw)" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Beginning of transmission",
    title: "First episode file",
    side: "previous",
  },
} satisfies Meta<typeof EpisodeBoundaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstEpisode: Story = {};

export const LastEpisode: Story = {
  args: {
    label: "End of transmission",
    title: "No further episode files",
    side: "next",
  },
};
