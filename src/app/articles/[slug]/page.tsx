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
  return postParams("articles");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("articles", slug);
  if (!post) return {};
  return {
    ...(await postMetadata("articles", slug)),
    ...socialMetadata({
      title: post.title,
      description: post.summary,
      path: `/articles/${slug}`,
      section: "articles",
      type: "article",
      publishedTime: post.publishedAt,
    }),
  };
}

export default async function ArticlesPostPage({ params }: Props) {
  const { slug } = await params;
  return <WritingPostPage collection="articles" slug={slug} />;
}
