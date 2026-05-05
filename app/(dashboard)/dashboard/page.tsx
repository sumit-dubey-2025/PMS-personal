import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalIcon } from '@/components/ui/ExternalIcon';
import { getDashboardAccess } from '@/lib/auth/dashboard-access';

export const metadata: Metadata = { title: 'Dashboard Workspace' };

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }
  const { hasAdmin, hasManager, hasEmployee } = getDashboardAccess(session);

  const validDashboards = [];
  if (hasAdmin) validDashboards.push({ id: 'hr', title: 'HR Admin Dashboard', desc: 'System-wide configuration, performance cycles, and org hierarchies.', href: '/dashboard/hr', icon: 'admin_panel_settings' });
  if (hasManager) validDashboards.push({ id: 'manager', title: 'Manager Dashboard', desc: 'Team performance, direct report tasks, and pending approvals.', href: '/dashboard/manager', icon: 'supervisor_account' });
  if (hasEmployee) validDashboards.push({ id: 'employee', title: 'Employee Dashboard', desc: 'Your personal goals, feedback, and review cycle status.', href: '/dashboard/employee', icon: 'person' });

  // Silently redirect if the user only has one dashboard appropriate for them.
  if (validDashboards.length === 1) {
    redirect(validDashboards[0].href as any);
  }

  // If multiple roles apply, show semantic selector.
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-10">
       <div className="text-center space-y-2">
         <h1 className="text-3xl font-headline text-on-surface">Select Your Workspace</h1>
         <p className="text-on-surface-variant font-body">You have access to multiple dashboards. Please select one to continue.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mt-6">
         {validDashboards.map((dash) => (
           <Link 
             key={dash.id} 
             href={dash.href as any} 
             className="group relative flex flex-col bg-surface-container-lowest p-8 rounded-[1rem] outline outline-1 outline-outline-variant/30 hover:outline-primary/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(26,28,30,0.08)] shadow-sm overflow-hidden"
           >
              {/* Subtle accent highlight bar on top */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-surface-container-high group-hover:bg-primary transition-colors duration-300"></div>
              
              <div className="flex flex-col mb-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container group-hover:bg-primary/10 flex items-center justify-center mb-6 transition-colors duration-300">
                   <ExternalIcon name={dash.icon} className="w-7 h-7 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h2 className="text-xl font-headline text-on-surface font-semibold group-hover:text-primary transition-colors duration-300 tracking-tight">{dash.title}</h2>
              </div>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed text-pretty">{dash.desc}</p>
              
              <div className="mt-6 pt-2 flex items-center text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                 Enter Workspace
                 <ExternalIcon name="arrow_forward" className="w-4 h-4 ml-1 invert-[0.3]" />
              </div>
           </Link>
         ))}
       </div>
    </div>
  );
}
