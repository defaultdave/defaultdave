import {
  WritingPostPage,
  postMetadata,
  postParams,
} from "@/components/sections/writing/WritingPostPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return postParams("musings");
}

export async function generateMetadata({
  params,
}: PageProps<"/musings/[slug]">) {
  const { slug } = await params;
  return postMetadata("musings", slug);
}

export default async function MusingsPostPage({
  params,
}: PageProps<"/musings/[slug]">) {
  const { slug } = await params;
  return <WritingPostPage collection="musings" slug={slug} />;
}
