import type { Metadata } from 'next';
import RatingScaleScreen from '@/components/cycles/RatingScaleScreen';

export const metadata: Metadata = { title: 'Rating Scale | PulsePerform' };

interface Props { params: Promise<{ code: string }> }

export default async function RatingScalesPage({ params }: Props) {
  const { code } = await params;
  return <RatingScaleScreen cycleCode={code} />;
}
