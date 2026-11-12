import type { Metadata } from "next";

import { getPost } from "@/content";
import { socialMetadata } from "@/lib/metadata";
import {
  WritingPostPage,
  postMetadata,
  postParams,
} from "@/components/sections/writing/WritingPostPage";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return postParams("musings");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("musings", slug);
  if (!post) return {};
  return {
    ...postMetadata(post),
    ...socialMetadata({
      title: post.title,
      description: post.summary,
      path: `/musings/${slug}`,
      section: "musings",
      type: "article",
      publishedTime: post.publishedAt,
    }),
  };
}

export default async function MusingsPostPage({ params }: Props) {
  const { slug } = await params;
  return <WritingPostPage collection="musings" slug={slug} />;
}
