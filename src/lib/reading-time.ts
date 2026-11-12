/** Words per minute for silent reading of prose. */
const WORDS_PER_MINUTE = 200;

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const CODE_FENCE = /```[\s\S]*?```/g;
const JSX_TAG = /<[^>]*>/g;

/** Count the words a reader sees in an MDX or Markdown source. */
export function countWords(source: string): number {
  const text = source
    .replace(FRONTMATTER, "")
    .replace(CODE_FENCE, " ")
    .replace(JSX_TAG, " ");
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token))
    .length;
}

/** Whole minutes to read `source`, rounded up, never below one. */
export function readingTimeMinutes(source: string): number {
  return Math.max(1, Math.ceil(countWords(source) / WORDS_PER_MINUTE));
}

/** The label shown beside a post, such as "3 min read". */
export function formatReadingTime(source: string): string {
  return `${String(readingTimeMinutes(source))} min read`;
}
