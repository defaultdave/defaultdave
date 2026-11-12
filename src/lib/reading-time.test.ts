import { describe, expect, it } from "vitest";

import {
  countWords,
  formatReadingTime,
  readingTimeMinutes,
} from "./reading-time";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("countWords", () => {
  it.each([
    ["empty", "", 0],
    ["whitespace only", " \n\t ", 0],
    ["plain words", "one two  three\nfour", 4],
    ["frontmatter is skipped", "---\ntitle: A B C\n---\nhello world", 2],
    ["code fences are skipped", "before\n```ts\nconst a = 1;\n```\nafter", 2],
    ["JSX tags are skipped", '<Metric label="LCP" value="1" /> text here', 2],
    ["bare punctuation is not a word", "yes - no ## maybe", 3],
  ])("%s", (_name, source, expected) => {
    expect(countWords(source)).toBe(expected);
  });
});

describe("readingTimeMinutes", () => {
  it.each([
    ["no words", "", 1],
    ["one word", "hi", 1],
    ["exactly 200 words", words(200), 1],
    ["201 words rounds up", words(201), 2],
    ["1000 words", words(1000), 5],
  ])("%s", (_name, source, expected) => {
    expect(readingTimeMinutes(source)).toBe(expected);
  });
});

describe("formatReadingTime", () => {
  it("labels the minutes", () => {
    expect(formatReadingTime(words(450))).toBe("3 min read");
  });
});
