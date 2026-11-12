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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return postMetadata("articles", slug);
}

export default async function ArticlesPostPage({ params }: Props) {
  const { slug } = await params;
  return <WritingPostPage collection="articles" slug={slug} />;
}
