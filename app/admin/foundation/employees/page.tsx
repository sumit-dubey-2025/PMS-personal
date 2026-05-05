import EmployeeRegistryClient from './EmployeeRegistryClient';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Employee Registry | PulsePerform',
  description: 'Manage active team members across regions.',
};

export default function EmployeeRegistryPage() {
  return (
    <Providers>
      <EmployeeRegistryClient />
    </Providers>
  );
}
