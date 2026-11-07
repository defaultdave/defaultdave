import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LinkButton } from "./LinkButton";

const meta = {
  title: "Primitives/LinkButton",
  component: LinkButton,
  args: { href: "/work", children: "See the work" },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const External: Story = {
  args: { href: "https://github.com/defaultdave", children: "GitHub" },
};
