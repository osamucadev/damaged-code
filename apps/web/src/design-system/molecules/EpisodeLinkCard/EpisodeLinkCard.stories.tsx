import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EpisodeLinkCard } from "./EpisodeLinkCard";

const meta = {
  title: "Molecules/EpisodeLinkCard",
  component: EpisodeLinkCard,
  decorators: [
    (Story) => (
      <ul style={{ listStyle: "none", maxWidth: 280, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
  args: {
    href: "/episodes/28",
    code: "S03E07",
    name: "The Ricklantis Mixup",
    meta: "40 characters",
    label: "Open S03E07 The Ricklantis Mixup",
  },
} satisfies Meta<typeof EpisodeLinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Current: Story = { args: { current: true, currentLabel: "Current" } };
