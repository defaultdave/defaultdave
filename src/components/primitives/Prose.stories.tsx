import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Prose } from "./Prose";

const meta = {
  title: "Primitives/Prose",
  component: Prose,
  args: {
    children: (
      <>
        <h2>Cutting checkout time in half</h2>
        <p>
          Running text sits at a readable measure. It has a{" "}
          <a href="#example">link</a>, some <code>inline code</code>, and enough
          words to wrap onto a second line at most widths.
        </p>
        <h3>What changed</h3>
        <ul>
          <li>Moved the price lookup off the critical path.</li>
          <li>Deferred the map until it scrolled into view.</li>
        </ul>
        <blockquote>A quote reads quieter than the text around it.</blockquote>
        <pre>
          <code>const lcp = 1.8;</code>
        </pre>
      </>
    ),
  },
} satisfies Meta<typeof Prose>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
