import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { listWork } from "../../content";
import { WorkList } from "../../components/sections/work/WorkList";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: "Case studies and smaller projects.",
  path: "/work",
  section: "work",
});

export default async function WorkPage() {
  const entries = await listWork();
  return (
    <>
      <h1>Work</h1>
      <WorkList entries={entries} />
    </>
  );
}
