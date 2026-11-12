import type { Metadata } from "next";

import { WRITING } from "@/components/sections/writing/collections";
import { pageMetadata } from "@/lib/metadata";
import { WritingListPage } from "@/components/sections/writing/WritingListPage";

export const metadata: Metadata = pageMetadata({
  title: WRITING.articles.title,
  description: WRITING.articles.description,
  path: WRITING.articles.path,
  section: "articles",
});

export default function ArticlesPage() {
  return <WritingListPage collection="articles" />;
}
