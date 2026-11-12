import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "../../../components/sections/work/CaseStudy";
import { caseStudies } from "../../../lib/work-kind";
import { pageMetadata } from "../../../lib/metadata";
import { getWork, listWork } from "../../../content";

/** Only case studies get a page; a card slug is not generated and returns 404. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const entries = await listWork();
  return caseStudies(entries).map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function getCaseStudy(slug: string) {
  const entry = await getWork(slug);
  return entry?.kind === "case-study" ? entry : notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCaseStudy(slug);
  return pageMetadata({
    title: entry.title,
    description: entry.summary,
    path: `/work/${slug}`,
    section: "work",
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  return <CaseStudy entry={await getCaseStudy(slug)} />;
}
