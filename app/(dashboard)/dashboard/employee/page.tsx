import type { Metadata } from 'next';
import { ExternalIcon } from '@/components/ui/ExternalIcon';
import Link from 'next/link';
import { getHighestDashboardRole } from '@/lib/auth/dashboard-access';

export const metadata: Metadata = { title: 'Employee Dashboard | PulsePerform' };

import { auth } from '@/auth';

export default async function EmployeeDashboard() {
  const session = await auth();
  const userName = session?.user?.name || 'Employee';
  const firstName = userName.split(' ')[0];
  const roleTitle = getHighestDashboardRole(session?.user?.roles, session?.user?.groups);

  return (
    <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto w-full">
      {/* Reduced Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-headline text-on-surface tracking-tight mb-2">Welcome Back, {firstName}</h1>
          <p className="text-on-surface-variant font-body text-sm">{roleTitle} • PulsePerform System</p>
        </div>
        
        <div className="flex gap-3">
           <Link href="/dashboard" className="px-4 py-2 flex items-center gap-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface font-semibold text-sm outline outline-1 outline-outline-variant/30">
              <ExternalIcon name="swap_horiz" className="w-4 h-4" />
              Switch Roles
           </Link>
           <button className="px-6 py-2 flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-light transition-colors text-on-primary font-semibold text-sm">
              Current Cycle
              <ExternalIcon name="arrow_forward" className="w-4 h-4 invert" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Feed Activity */}
        <div className="md:col-span-8 flex flex-col space-y-6">
           <h2 className="text-lg font-headline text-on-surface px-1">Your Action Items</h2>
           
           <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm flex gap-4 border-l-4 border-secondary hover:shadow-md transition-shadow cursor-pointer">
              <div className="mt-1">
                 <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary-dark flex items-center justify-center">
                    <ExternalIcon name="edit_document" className="w-5 h-5 opacity-90" />
                 </div>
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-semibold text-on-surface text-lg">Self Assessment Draft</h3>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Due in 5 Days</span>
                 </div>
                 <p className="text-on-surface-variant font-body text-sm leading-relaxed mb-4">You have started your self assessment for the Annual '24 cycle, but it is not yet submitted.</p>
                 <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-2/3 rounded-full"></div>
                 </div>
              </div>
           </div>

           <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] gap-4 shadow-sm flex opacity-75">
              <div className="mt-1">
                 <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <ExternalIcon name="check_circle" className="w-5 h-5 text-on-surface-muted" />
                 </div>
              </div>
              <div className="flex-1">
                 <h3 className="font-headline font-semibold text-on-surface text-lg line-through text-on-surface-muted">Goal Setting Phase</h3>
                 <p className="text-on-surface-variant font-body text-sm mt-1">Approved by Sarah Jenkins on Oct 14, 2024.</p>
              </div>
           </div>

        </div>

        {/* Info Sidebar panel */}
        <div className="md:col-span-4 flex flex-col space-y-6">
          <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm">
             <h3 className="text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider mb-5">Your Objectives</h3>
             <ul className="space-y-4">
               <li>
                 <div className="flex items-center gap-2 mb-1 text-sm font-medium text-on-surface font-body">
                   <div className="w-2 h-2 rounded-full bg-success"></div>
                   Launch Dashboard MVP
                 </div>
                 <p className="text-xs text-on-surface-muted pl-4">Target: Q3 2024</p>
               </li>
               <li>
                 <div className="flex items-center gap-2 mb-1 text-sm font-medium text-on-surface font-body">
                   <div className="w-2 h-2 rounded-full bg-warning"></div>
                   Improve CI/CD Timings
                 </div>
                 <p className="text-xs text-on-surface-muted pl-4">Target: Q4 2024</p>
               </li>
             </ul>
             <button className="w-full mt-6 py-2 border border-outline-variant/50 rounded-lg text-sm text-on-surface font-semibold hover:bg-surface-container-low transition-colors">
               Manage Goals
             </button>
          </div>

          <div className="bg-surface-inverse rounded-[0.75rem] p-[1.75rem] text-on-surface-inverse">
             <div className="flex items-center gap-2 mb-3">
               <ExternalIcon name="info" className="w-5 h-5" />
               <h3 className="font-headline font-semibold">Need Help?</h3>
             </div>
             <p className="text-sm opacity-80 mb-5 font-body leading-relaxed">If you have questions regarding the current assessment cycle, visit the documentation center.</p>
             <button className="text-secondary font-semibold text-sm hover:underline">
               View Performance Guidelines
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
