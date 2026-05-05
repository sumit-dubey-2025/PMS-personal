import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ExternalIcon } from '@/components/ui/ExternalIcon';
import Link from 'next/link';
import { auth } from '@/auth';
import { hasManagerDashboardAccess } from '@/lib/auth/dashboard-access';

export const metadata: Metadata = { title: 'Manager Dashboard | PulsePerform' };

export default async function ManagerDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!hasManagerDashboardAccess(session.user.roles)) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto w-full">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-on-surface-variant mb-1">
            <span className="text-sm font-semibold uppercase tracking-wider font-body">Leadership</span>
            <span className="text-outline-variant">•</span>
            <span className="text-sm font-body">My Team</span>
          </div>
          <h1 className="text-3xl font-headline text-on-surface tracking-tight">Team Overview</h1>
          <p className="text-on-surface-variant font-body mt-2 max-w-2xl">Monitor your direct reports' progress, pending approvals, and team metrics.</p>
        </div>
        
        <div className="flex gap-3">
           <Link href="/dashboard" className="px-4 py-2 flex items-center gap-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface font-semibold text-sm outline outline-1 outline-outline-variant/30">
              <ExternalIcon name="swap_horiz" className="w-4 h-4" />
              Switch Roles
           </Link>
           <button className="px-5 py-2 flex items-center gap-2 rounded-lg bg-surface-lowest text-on-surface hover:bg-surface-container-low transition-colors font-semibold text-sm outline outline-1 outline-outline">
              <ExternalIcon name="file_download" className="w-5 h-5" />
              Export Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Approvals Warning Card */}
        <div className="bg-[#FEF9E7] outline outline-1 outline-[#E67E22]/30 rounded-[0.75rem] p-[1.75rem] flex flex-col justify-between">
           <div className="flex items-center gap-3 text-[#E67E22] mb-4">
             <ExternalIcon name="warning" className="w-6 h-6" />
             <h3 className="font-headline font-semibold">Action Required</h3>
           </div>
           <p className="text-[#E67E22]/80 text-sm font-body mb-6">You have 4 direct reports waiting for goal approvals before the cycle locks.</p>
           <button className="bg-white text-on-surface font-semibold text-sm py-2 px-4 rounded-md shadow-sm self-start hover:bg-surface-container-low transition-colors">
             Review Goals
           </button>
        </div>

        <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm flex flex-col justify-between">
           <h3 className="text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider mb-2">Team Size</h3>
           <div>
             <div className="text-4xl font-headline text-on-surface font-semibold">12</div>
             <div className="text-sm font-body text-on-surface-variant mt-1">Direct & Matrix Reports</div>
           </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm flex flex-col justify-between">
           <h3 className="text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider mb-2">Cycle Progress</h3>
           <div>
             <div className="text-4xl font-headline text-on-surface font-semibold">68%</div>
             <div className="text-sm font-body text-on-surface-variant mt-1">Completion across team</div>
           </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-container-high/50">
            <h2 className="text-xl font-headline text-on-surface">Direct Reports</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View All Organization</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="pb-3 text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider">Employee Name</th>
                  <th className="pb-3 text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider">Cycle Status</th>
                  <th className="pb-3 text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/50">
                <TeamRow name="Sarah Jenkins" role="Senior Frontend Developer" status="In Progress" statusColor="warning" />
                <TeamRow name="Michael Chen" role="Backend Engineer" status="Submitted" statusColor="success" />
                <TeamRow name="Elena Rodriguez" role="Product Designer" status="Pending Goals" statusColor="error" />
                <TeamRow name="David Kim" role="QA Analyst" status="In Progress" statusColor="warning" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamRow({ name, role, status, statusColor }: { name: string, role: string, status: string, statusColor: 'warning' | 'success' | 'error' | 'default' }) {
  const getBadgeClasses = () => {
    switch(statusColor) {
      case 'success': return 'bg-success-container text-success';
      case 'warning': return 'bg-warning-container text-warning';
      case 'error': return 'bg-error-container text-error';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-primary-dark flex items-center justify-center font-bold text-xs uppercase">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-body font-medium text-on-surface">{name}</span>
        </div>
      </td>
      <td className="py-4 text-sm text-on-surface-variant font-body">{role}</td>
      <td className="py-4">
        <span className={`px-2.5 py-1 rounded-sm text-xs font-semibold ${getBadgeClasses()}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-right">
        <button className="text-secondary font-semibold text-sm hover:underline">View Profile</button>
      </td>
    </tr>
  );
}
