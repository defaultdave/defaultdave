import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Nav } from "./Nav";

const meta = {
  title: "Layout/Nav",
  component: Nav,
  args: { pathname: null },
} satisfies Meta<typeof Nav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const CurrentItem: Story = {
  args: { pathname: "/work/checkout-rebuild" },
};
