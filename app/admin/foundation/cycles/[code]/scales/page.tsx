import type { Metadata } from 'next';
import RatingScaleClient from './RatingScaleClient';

export const metadata: Metadata = { title: 'Rating Scale Manager | PulsePerform' };

interface Props { params: Promise<{ code: string }> }

export default async function RatingScalesPage({ params }: Props) {
  const { code } = await params;
  return <RatingScaleClient cycleCode={code} />;
}
