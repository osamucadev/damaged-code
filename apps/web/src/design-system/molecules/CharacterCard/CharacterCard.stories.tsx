import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusIndicator } from "../../atoms/StatusIndicator/StatusIndicator";
import { PropertyRow } from "../PropertyRow/PropertyRow";

import { CharacterCard } from "./CharacterCard";

const portrait =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%230b3540'/><text x='150' y='160' font-size='24' fill='%234fd4ee' text-anchor='middle'>PORTRAIT</text></svg>";

const meta = {
  title: "Molecules/CharacterCard",
  component: CharacterCard,
  parameters: { layout: "centered" },
  args: {
    name: "Rick Sanchez",
    image: portrait,
    imageAlt: "Portrait of Rick Sanchez",
  },
  decorators: [
    (Story) => (
      <ul style={{ listStyle: "none", margin: 0, padding: 0, width: "16rem" }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof CharacterCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithStatusAndDetails: Story = {
  args: {
    status: <StatusIndicator tone="ok">Alive</StatusIndicator>,
    children: (
      <>
        <PropertyRow label="Species">Human</PropertyRow>
        <PropertyRow label="Origin">Earth (C-137)</PropertyRow>
        <PropertyRow label="Last location">Citadel of Ricks</PropertyRow>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    name: "Abradolf Lincler from a replacement dimension",
    status: <StatusIndicator tone="neutral">unknown</StatusIndicator>,
    children: (
      <>
        <PropertyRow label="Especie">Humanoide geneticamente modificado</PropertyRow>
        <PropertyRow label="Ultima localizacao">Cidadela dos Ricks</PropertyRow>
      </>
    ),
  },
};
