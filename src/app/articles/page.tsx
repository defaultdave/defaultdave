import type { Metadata } from "next";

import { WRITING } from "@/components/sections/writing/collections";
import { WritingListPage } from "@/components/sections/writing/WritingListPage";

export const metadata: Metadata = {
  title: WRITING.articles.title,
  description: WRITING.articles.description,
};

export default function ArticlesPage() {
  return <WritingListPage collection="articles" />;
}
