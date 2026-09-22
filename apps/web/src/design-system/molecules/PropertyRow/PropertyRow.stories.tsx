import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Panel } from "../../atoms/Panel/Panel";

import { PropertyRow } from "./PropertyRow";

const meta = {
  title: "Molecules/PropertyRow",
  component: PropertyRow,
  parameters: { layout: "padded" },
  args: {
    label: "Species",
    children: "Human",
  },
  decorators: [
    (Story) => (
      <Panel title="Character dossier">
        <dl style={{ margin: 0 }}>
          <Story />
        </dl>
      </Panel>
    ),
  ],
} satisfies Meta<typeof PropertyRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    label: "Ultima localizacao conhecida",
    children: "Cidadela dos Ricks, dimensao de substituicao C-137",
  },
};

export const Group: Story = {
  render: () => (
    <>
      <PropertyRow label="Status">Alive</PropertyRow>
      <PropertyRow label="Species">Human</PropertyRow>
      <PropertyRow label="Gender">Male</PropertyRow>
      <PropertyRow label="Origin">Earth (C-137)</PropertyRow>
      <PropertyRow label="Last known location">Citadel of Ricks</PropertyRow>
    </>
  ),
};
