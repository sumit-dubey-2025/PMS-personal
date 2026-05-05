import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ExternalIcon } from '@/components/ui/ExternalIcon';
import Link from 'next/link';
import { auth } from '@/auth';
import { hasAdminDashboardAccess } from '@/lib/auth/dashboard-access';
import { fetchDashboardStats } from '@/lib/actions/dashboard';

export const metadata: Metadata = { title: 'HR Admin Dashboard | PulsePerform' };


export default async function HrAdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!hasAdminDashboardAccess(session.user.roles, session.user.groups)) {
    redirect('/dashboard');
  }

  // ✅ Fetch dynamic data
  const stats = await fetchDashboardStats();

  return (
    <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto w-full">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-on-surface-variant mb-1">
            <span className="text-sm font-semibold uppercase tracking-wider font-body">Admin Portal</span>
            <span className="text-outline-variant">•</span>
            <span className="text-sm font-body">Foundation Setup</span>
          </div>
          <h1 className="text-3xl font-headline text-on-surface tracking-tight">System Global Dashboard</h1>
          <p className="text-on-surface-variant font-body mt-2 max-w-2xl">Configure, monitor, and manage the organizational performance ecosystem. You are currently viewing the system as an HR Administrator.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="px-4 py-2 flex items-center gap-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface font-semibold text-sm outline outline-1 outline-outline-variant/30">
            <ExternalIcon name="swap_horiz" className="w-4 h-4" />
            Switch Roles
          </Link>
          <button className="px-5 py-2 flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-light transition-colors text-on-primary font-semibold text-sm shadow-md">
            <ExternalIcon name="add" className="w-5 h-5 invert" />
            New Cycle
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          title="Active Employees"
          value={stats?.activeEmployees?.toLocaleString() ?? '0'}
          trend={`+${stats.newEmployeesLastMonth ?? 0} this month`}
          icon="group"
        />

        <StatCard
          title="Org Nodes"
          value={stats?.orgNodes?.toLocaleString() ?? '0'}
          trend="All regions synced"
          icon="account_tree"
        />

        <StatCard
          title="Role Families"
          value={stats?.roleFamilies?.toLocaleString() ?? '0'}
          trend={`Across ${stats?.departments ?? 0} departments`}
          icon="schema"
        />

        <StatCard
          title="Active Cycles"
          value={stats?.activeCycles?.toString() ?? '0'}
          trend="Ongoing review cycles"
          icon="sync"
          status="active"
        />

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Large Data Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-headline text-on-surface">2024 Annual Review Cycle</h2>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">In Progress</span>
            </div>

            <p className="text-on-surface-variant font-body text-sm mb-8">Main assessment window for all core regions. Cycle closes in 14 days.</p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-body font-medium">
                <span className="text-on-surface">Review Completion</span>
                <span className="text-on-surface-variant">45% (382 / 850 Finished)</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[45%] shadow-[0_0_4px_var(--secondary)] rounded-full"></div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-surface-container-high pt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-headline text-on-surface">850</span>
                <span className="text-xs text-on-surface-variant font-body uppercase tracking-wider mt-1">Participants</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-headline text-warning">112</span>
                <span className="text-xs text-on-surface-variant font-body uppercase tracking-wider mt-1">Pending Actions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-headline text-success">382</span>
                <span className="text-xs text-on-surface-variant font-body uppercase tracking-wider mt-1">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-[0.75rem] p-[1.75rem] shadow-sm">
            <h2 className="text-lg font-headline text-on-surface mb-4">Quick Actions</h2>
            <div className="flex flex-col space-y-2">
              <QuickAction icon="upload_file" label="Bulk Import Users" />
              <QuickAction icon="group_add" label="Employee Registry" />
              <QuickAction icon="schema" label="Role Framework" />
              <QuickAction icon="verified" label="Competency Library" />
              <QuickAction icon="star_half" label="Rating Scales" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline components for this specific dashboard
function StatCard({ title, value, trend, icon, status }: { title: string, value: string, trend: string, icon: string, status?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-[0.75rem] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
        <ExternalIcon name={icon} className="w-32 h-32" />
      </div>
      <div className="flex items-center justify-between z-10 mb-4">
        <h3 className="text-sm font-body font-medium text-on-surface-variant uppercase tracking-wider">{title}</h3>
        {status === 'active' && <span className="w-2 h-2 rounded-full bg-success"></span>}
      </div>
      <div className="z-10">
        <div className="text-3xl font-headline text-on-surface font-semibold mb-1">{value}</div>
        <div className="text-sm font-body text-on-surface-variant">{trend}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors w-full text-left group border border-transparent hover:border-outline-variant/30">
      <ExternalIcon name={icon} className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
      <span className="font-body text-on-surface text-sm font-medium">{label}</span>
      <ExternalIcon name="arrow_forward" className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
    </button>
  );
}
