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
