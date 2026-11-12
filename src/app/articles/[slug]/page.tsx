import {
  WritingPostPage,
  postMetadata,
  postParams,
} from "@/components/sections/writing/WritingPostPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return postParams("articles");
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  return postMetadata("articles", slug);
}

export default async function ArticlesPostPage({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  return <WritingPostPage collection="articles" slug={slug} />;
}
