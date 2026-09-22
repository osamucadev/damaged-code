import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Loader } from "./Loader";

const meta = {
  title: "Atoms/Loader",
  component: Loader,
  parameters: { layout: "centered" },
  args: {
    label: "Loading episodes",
  },
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The label is announced to screen readers even when it is not shown. */
export const Default: Story = {};

export const WithVisibleLabel: Story = {
  args: { showLabel: true },
};

export const Small: Story = {
  args: { size: "small", showLabel: true },
};

/**
 * With reduced motion requested by the operating system, the rotation stops and
 * the indicator stays readable. Enable reduced motion in the toolbar or in the
 * system settings to compare.
 */
export const ReducedMotion: Story = {
  args: { showLabel: true },
  parameters: {
    docs: {
      description: {
        story:
          "The continuous rotation is removed under prefers-reduced-motion, and the loading state is still announced.",
      },
    },
  },
};
