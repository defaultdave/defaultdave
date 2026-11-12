import type { Metadata } from "next";

import { listWork } from "../../content";
import { WorkList } from "../../components/sections/work/WorkList";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies and smaller projects.",
};

export default async function WorkPage() {
  const entries = await listWork();
  return (
    <>
      <h1>Work</h1>
      <WorkList entries={entries} />
    </>
  );
}
