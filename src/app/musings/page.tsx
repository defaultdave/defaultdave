import type { Metadata } from "next";

import { WRITING } from "@/components/sections/writing/collections";
import { pageMetadata } from "@/lib/metadata";
import { WritingListPage } from "@/components/sections/writing/WritingListPage";

export const metadata: Metadata = pageMetadata({
  title: WRITING.musings.title,
  description: WRITING.musings.description,
  path: WRITING.musings.path,
  section: "musings",
});

export default function MusingsPage() {
  return <WritingListPage collection="musings" />;
}
