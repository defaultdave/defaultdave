import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Wordmark } from "./Wordmark";

const meta = {
  title: "Layout/Wordmark",
  component: Wordmark,
} satisfies Meta<typeof Wordmark>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
