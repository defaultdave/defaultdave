import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Footer } from "./Footer";

const meta = {
  title: "Layout/Footer",
  component: Footer,
} satisfies Meta<typeof Footer>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
