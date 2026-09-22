import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EpisodeListItem } from "./EpisodeListItem";

const meta = {
  title: "Molecules/EpisodeListItem",
  component: EpisodeListItem,
  parameters: { layout: "padded" },
  args: {
    code: "S01E01",
    name: "Pilot",
    airDate: "Aired December 2, 2013",
    characters: "19 characters",
  },
  decorators: [
    (Story) => (
      <ul style={{ display: "grid", gap: "var(--dc-space-3)", listStyle: "none", margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof EpisodeListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Air date and character count arrive already translated from the caller. */
export const Portuguese: Story = {
  args: {
    airDate: "Exibido em 2 de dezembro de 2013",
    characters: "19 personagens",
  },
};

export const LongContent: Story = {
  args: {
    name: "The Rickshank Rickdemption, with a title long enough to wrap on a narrow screen",
    airDate: "Exibido em 1 de abril de 2017",
    characters: "31 personagens",
  },
};

export const List: Story = {
  render: () => (
    <>
      <EpisodeListItem
        code="S01E01"
        name="Pilot"
        airDate="Aired December 2, 2013"
        characters="19 characters"
      />
      <EpisodeListItem
        code="S01E02"
        name="Lawnmower Dog"
        airDate="Aired December 9, 2013"
        characters="21 characters"
      />
      <EpisodeListItem
        code="S05E10"
        name="Rickmurai Jack"
        airDate="Aired September 5, 2021"
        characters="42 characters"
      />
    </>
  ),
};
