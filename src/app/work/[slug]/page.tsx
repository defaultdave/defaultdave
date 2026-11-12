import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "../../../components/sections/work/CaseStudy";
import { getWork, listWork } from "../../../content";

/** Only case studies get a page; a card slug is not generated and returns 404. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const entries = await listWork();
  return entries
    .filter((e) => e.kind === "case-study")
    .map(({ slug }) => ({ slug }));
}

async function getCaseStudy(slug: string) {
  const entry = await getWork(slug);
  return entry?.kind === "case-study" ? entry : notFound();
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCaseStudy(slug);
  return { title: entry.title, description: entry.summary };
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  return <CaseStudy entry={await getCaseStudy(slug)} />;
}
