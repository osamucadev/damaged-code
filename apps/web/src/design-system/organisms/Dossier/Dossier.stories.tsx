import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "../../atoms/Badge/Badge";
import { Button } from "../../atoms/Button/Button";
import { DisplaySurface } from "../../atoms/DisplaySurface/DisplaySurface";
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

/**
 * The shape the character dossier shows while detail is loading: portrait,
 * facts, and appearances all reserve their final geometry instead of a single
 * generic spinner. The character dossier itself carries the exact CRT
 * skeleton treatment; this story demonstrates the placement it fills.
 */
export const Loading: Story = {
  args: {
    title: "Rick Sanchez",
    children: (
      <div style={{ display: "grid", gap: "var(--dc-space-5)" }}>
        <div
          style={{
            display: "grid",
            gap: "var(--dc-space-4)",
            gridTemplateColumns: "minmax(0, 14rem) minmax(0, 1fr)",
          }}
        >
          <div
            style={{
              aspectRatio: "1 / 1",
              background: "var(--dc-color-surface-screen)",
              border: "var(--dc-border-width-heavy) solid var(--dc-color-border-heavy)",
              borderRadius: "var(--dc-radius-md)",
            }}
          />
          <div style={{ display: "grid", gap: "var(--dc-space-2)", alignContent: "start" }}>
            {["Status", "Species", "Gender", "Origin", "Last known location"].map((label) => (
              <div
                key={label}
                style={{
                  borderBottom: "var(--dc-border-width-hairline) solid var(--dc-color-border-hairline)",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "var(--dc-space-2) 0",
                }}
              >
                <span style={{ color: "var(--dc-color-text-secondary)", fontFamily: "var(--dc-font-family-mono)", fontSize: "var(--dc-font-size-xs)" }}>
                  {label}
                </span>
                <span
                  style={{
                    background: "var(--dc-color-surface-recess)",
                    borderRadius: "var(--dc-radius-sm)",
                    display: "inline-block",
                    height: "0.75rem",
                    width: "6rem",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: "var(--dc-space-2)" }}>
          <span style={{ color: "var(--dc-color-text-secondary)", fontFamily: "var(--dc-font-family-mono)", fontSize: "var(--dc-font-size-xs)" }}>
            Reading character file...
          </span>
          <div style={{ display: "grid", gap: "var(--dc-space-2)", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[0, 1, 2].map((tile) => (
              <span
                key={tile}
                style={{
                  background: "var(--dc-color-surface-recess)",
                  borderRadius: "var(--dc-radius-sm)",
                  height: "2.75rem",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
  },
};

/** The dialog shell stays the same when the character request fails. */
export const Error: Story = {
  args: {
    title: "Rick Sanchez",
    children: (
      <div style={{ display: "grid", gap: "var(--dc-space-4)" }}>
        <DisplaySurface tone="danger">The character file could not be loaded.</DisplaySurface>
        <Button variant="secondary">Try again</Button>
      </div>
    ),
  },
};

/**
 * A character with many appearances, such as Rick Sanchez across every
 * episode. The list scrolls inside the dialog body instead of growing the
 * dialog past the viewport.
 */
export const ManyEpisodeAppearances: Story = {
  args: {
    title: "Rick Sanchez",
    children: (
      <div style={{ display: "grid", gap: "var(--dc-space-3)" }}>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <strong style={{ color: "var(--dc-color-text-primary)" }}>Episode appearances</strong>
          <Badge tone="neutral">51 episodes</Badge>
        </div>
        <ul
          style={{
            display: "grid",
            gap: "var(--dc-space-2)",
            gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {Array.from({ length: 51 }, (_, index) => index + 1).map((episodeNumber) => (
            <li key={episodeNumber}>
              <div
                style={{
                  alignItems: "center",
                  background: "var(--dc-color-surface-recess)",
                  border: "var(--dc-border-width-heavy) solid var(--dc-color-border-heavy)",
                  borderRadius: "var(--dc-radius-sm)",
                  display: "flex",
                  gap: "var(--dc-space-2)",
                  padding: "var(--dc-space-2) var(--dc-space-3)",
                }}
              >
                <Badge tone="display">{`S${String(Math.ceil(episodeNumber / 10)).padStart(2, "0")}E${String(((episodeNumber - 1) % 10) + 1).padStart(2, "0")}`}</Badge>
                <span style={{ color: "var(--dc-color-text-primary)", fontSize: "var(--dc-font-size-sm)" }}>
                  Episode {episodeNumber}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
};
