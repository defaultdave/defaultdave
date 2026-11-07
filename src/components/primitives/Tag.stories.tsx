import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tag } from "./Tag";

const meta = {
  title: "Primitives/Tag",
  component: Tag,
  args: { children: "Next.js" },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Pop1: Story = { args: { tone: "pop-1" } };
export const Pop2: Story = { args: { tone: "pop-2" } };
export const Pop3: Story = { args: { tone: "pop-3" } };
export const Pop4: Story = { args: { tone: "pop-4" } };
