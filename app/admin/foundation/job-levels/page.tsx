import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import JobLevelDesignationClient from '@/components/jobLevel/JobLevelDesignationClient';

export const metadata: Metadata = {
  title: 'Job Levels & Designations | PulsePerform',
  description: 'Define and manage job levels and designations for the organisation.',
};

export default function JobLevelPage() {
  return (
    <Providers>
      <JobLevelDesignationClient />
    </Providers>
  );
}
