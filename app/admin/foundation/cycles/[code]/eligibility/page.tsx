import type { Metadata } from 'next';
import EligibilityClient from './EligibilityClient';

export const metadata: Metadata = { title: 'Eligibility Rules | PulsePerform' };

interface Props { params: Promise<{ code: string }> }

export default async function EligibilityPage({ params }: Props) {
  const { code } = await params;
  return <EligibilityClient cycleCode={code} />;
}
