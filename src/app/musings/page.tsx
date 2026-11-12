import type { Metadata } from "next";

import { WRITING } from "@/components/sections/writing/collections";
import { WritingListPage } from "@/components/sections/writing/WritingListPage";

export const metadata: Metadata = {
  title: WRITING.musings.title,
  description: WRITING.musings.description,
};

export default function MusingsPage() {
  return <WritingListPage collection="musings" />;
}
