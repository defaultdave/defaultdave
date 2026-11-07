import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "./Card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  decorators: [
    // A grid parent, so the tag and link rows line up as they do on a page.
    (Story) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkCard: Story = {
  args: {
    title: "Checkout rebuild and performance work",
    subtitle: "2023 to 2025, Lead engineer",
    description:
      "Rebuilt the checkout flow and cut time to interactive in half while the product kept shipping weekly.",
    tags: ["React", "Next.js", "Performance"],
    href: "/work/checkout-rebuild",
    linkLabel: "Read the case study",
  },
};

export const SectionCard: Story = {
  args: {
    title: "Articles",
    description:
      "Longer pieces on performance, delivery and the odd rule of thumb.",
    href: "/articles",
    linkLabel: "Read the articles",
  },
};
