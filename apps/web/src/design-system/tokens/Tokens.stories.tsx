import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/*
 * Living reference for the token layer. It reads the same custom properties the
 * components use, so a token change is visible here immediately.
 */

const colorTokens = [
  "--dc-color-surface-machine",
  "--dc-color-surface-panel",
  "--dc-color-surface-panel-raised",
  "--dc-color-surface-recess",
  "--dc-color-surface-screen",
  "--dc-color-surface-paper",
  "--dc-color-border-heavy",
  "--dc-color-border-hairline",
  "--dc-color-accent-primary",
  "--dc-color-accent-display",
  "--dc-color-accent-warning",
  "--dc-color-accent-danger",
  "--dc-color-state-focus",
];

const spacingTokens = [
  "--dc-space-1",
  "--dc-space-2",
  "--dc-space-3",
  "--dc-space-4",
  "--dc-space-5",
  "--dc-space-6",
  "--dc-space-7",
  "--dc-space-8",
];

const motionTokens = [
  "--dc-motion-fast",
  "--dc-motion-normal",
  "--dc-motion-card",
  "--dc-ease-mechanical",
  "--dc-ease-pop",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--dc-space-6)" }}>
      <h2
        style={{
          color: "var(--dc-color-text-primary)",
          fontSize: "var(--dc-font-size-lg)",
          marginBottom: "var(--dc-space-3)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function TokenReference() {
  return (
    <div style={{ fontFamily: "var(--dc-font-family-body)" }}>
      <Section title="Color">
        <div
          style={{
            display: "grid",
            gap: "var(--dc-space-3)",
            gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
          }}
        >
          {colorTokens.map((token) => (
            <div
              key={token}
              style={{
                alignItems: "center",
                display: "flex",
                gap: "var(--dc-space-3)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  backgroundColor: `var(${token})`,
                  border:
                    "var(--dc-border-width-heavy) solid var(--dc-color-border-heavy)",
                  borderRadius: "var(--dc-radius-sm)",
                  display: "inline-block",
                  height: "2.5rem",
                  width: "2.5rem",
                }}
              />
              <code
                style={{
                  color: "var(--dc-color-text-secondary)",
                  fontFamily: "var(--dc-font-family-mono)",
                  fontSize: "var(--dc-font-size-xs)",
                }}
              >
                {token}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <p style={{ color: "var(--dc-color-text-primary)", margin: 0 }}>
          <span style={{ fontFamily: "var(--dc-font-family-display)" }}>
            Display stack, used for headings and machine labels.
          </span>
        </p>
        <p style={{ color: "var(--dc-color-text-primary)", margin: 0 }}>
          Body stack, used for reading text.
        </p>
        <p
          style={{
            color: "var(--dc-color-text-on-screen)",
            fontFamily: "var(--dc-font-family-mono)",
            margin: 0,
          }}
        >
          Mono stack, used on screen surfaces.
        </p>
      </Section>

      <Section title="Spacing">
        <div style={{ display: "grid", gap: "var(--dc-space-2)" }}>
          {spacingTokens.map((token) => (
            <div
              key={token}
              style={{ alignItems: "center", display: "flex", gap: "var(--dc-space-3)" }}
            >
              <span
                aria-hidden="true"
                style={{
                  backgroundColor: "var(--dc-color-accent-primary)",
                  display: "inline-block",
                  height: "0.75rem",
                  width: `var(${token})`,
                }}
              />
              <code
                style={{
                  color: "var(--dc-color-text-secondary)",
                  fontFamily: "var(--dc-font-family-mono)",
                  fontSize: "var(--dc-font-size-xs)",
                }}
              >
                {token}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion">
        <ul
          style={{
            color: "var(--dc-color-text-secondary)",
            fontFamily: "var(--dc-font-family-mono)",
            fontSize: "var(--dc-font-size-xs)",
            margin: 0,
            paddingLeft: "var(--dc-space-5)",
          }}
        >
          {motionTokens.map((token) => (
            <li key={token}>{token}</li>
          ))}
        </ul>
        <p
          style={{
            color: "var(--dc-color-text-secondary)",
            fontSize: "var(--dc-font-size-sm)",
          }}
        >
          Durations collapse to 1ms when the operating system requests reduced
          motion, so components inherit that behavior from the token layer.
        </p>
      </Section>
    </div>
  );
}

const meta = {
  title: "Foundations/Tokens",
  component: TokenReference,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TokenReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
