import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Stack } from "./Stack";

const meta = {
  title: "Primitives/Stack",
  component: Stack,
  args: {
    children: (
      <>
        <p>First item</p>
        <p>Second item</p>
        <p>Third item</p>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WideGap: Story = { args: { gap: 8 } };

export const AsList: Story = {
  args: {
    as: "ul",
    gap: 2,
    children: (
      <>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </>
    ),
  },
};
