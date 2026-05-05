import { Metadata } from 'next';
import { connection } from 'next/server';
import { OrgTreeBoard } from '@/components/org-hierarchy/OrgTreeBoard';
import { getOrgNodes } from '@/lib/api/org';
import { History } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Org Hierarchy'
};

export default async function OrgHierarchyPage() {
  // connection() opts this route out of static prerendering when cacheComponents is enabled.
  // Without this, Next.js would attempt to prerender the page at build time and the
  // fetch to the local API server would hang and reject.
  await connection();
  const initialNodes = await getOrgNodes();

  return (
    <div className="flex flex-col h-full grow p-8 bg-[var(--background)]">
      <OrgTreeBoard initialNodes={initialNodes} />
    </div>
  );
}
