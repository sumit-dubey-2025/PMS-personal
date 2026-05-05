import type { Metadata } from 'next';
import WeightingClient from './WeightingClient';

export const metadata: Metadata = { title: 'Weighting Configuration | PulsePerform' };

interface Props { params: Promise<{ code: string }> }

export default async function WeightsPage({ params }: Props) {
  const { code } = await params;
  return <WeightingClient cycleCode={code} />;
}
