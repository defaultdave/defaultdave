/** Links to another site open in a new tab; paths, anchors and mailto stay in the same tab. */
export function linkTarget(href: string): "_blank" | undefined {
  return /^https?:\/\//i.test(href) ? "_blank" : undefined;
}
