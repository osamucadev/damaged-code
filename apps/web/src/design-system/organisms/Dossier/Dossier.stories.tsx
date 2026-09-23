import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PropertyRow } from "../../molecules/PropertyRow/PropertyRow";

import { Dossier } from "./Dossier";

const meta = {
  title: "Organisms/Dossier",
  component: Dossier,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Rick Sanchez",
    eyebrow: "Character file",
    closeLabel: "Close the dossier",
    onClose: () => {},
  },
} satisfies Meta<typeof Dossier>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <dl style={{ margin: 0 }}>
        <PropertyRow label="Status">Alive</PropertyRow>
        <PropertyRow label="Species">Human</PropertyRow>
        <PropertyRow label="Origin">Earth (C-137)</PropertyRow>
      </dl>
    ),
  },
};

/** Long names wrap in the header instead of widening the dialog. */
export const LongContent: Story = {
  args: {
    title: "Abradolf Lincler from a replacement dimension",
    children: (
      <dl style={{ margin: 0 }}>
        <PropertyRow label="Ultima localizacao">Cidadela dos Ricks</PropertyRow>
        <PropertyRow label="Especie">Humanoide geneticamente modificado</PropertyRow>
      </dl>
    ),
  },
};
