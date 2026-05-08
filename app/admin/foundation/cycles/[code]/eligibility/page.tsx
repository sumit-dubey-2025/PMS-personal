import type { Metadata } from 'next';
import EligibilityScreen from '@/components/cycles/EligibilityScreen';

export const metadata: Metadata = { title: 'Eligibility Rules | PulsePerform' };

interface Props { params: Promise<{ code: string }> }

export default async function EligibilityPage({ params }: Props) {
  const { code } = await params;
  return <EligibilityScreen cycleCode={code} />;
}
