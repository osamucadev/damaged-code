import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: {
    children: "Open portal",
    variant: "primary",
    size: "medium",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Erase timeline" },
};

export const Small: Story = {
  args: { size: "small" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { isLoading: true, loadingLabel: "Loading episodes" },
};

/**
 * Portuguese labels are frequently longer than English ones. The control has to
 * survive that without clipping its text.
 */
export const LongContent: Story = {
  args: {
    children: "Visualizar todos os personagens deste episodio",
    fullWidth: true,
  },
  parameters: { layout: "padded" },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dc-space-3)" }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
};
