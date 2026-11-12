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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return postMetadata("musings", slug);
}

export default async function MusingsPostPage({ params }: Props) {
  const { slug } = await params;
  return <WritingPostPage collection="musings" slug={slug} />;
}
