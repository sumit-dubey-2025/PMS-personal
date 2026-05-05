import type { Metadata } from 'next';
import CyclesScreen from '@/components/cycles/CyclesScreen';

export const metadata: Metadata = { title: 'Cycle Configuration | PulsePerform' };

export default function CyclesPage() {
  return <CyclesScreen />;
}
