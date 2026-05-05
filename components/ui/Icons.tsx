/**
 * Icon library for PulsePerform
 *
 * Source: "Employee Registry - Refined Layout" (Stitch / Material Symbols Outlined)
 *
 * Strategy:
 *   • Lucide React  — icons with a faithful stroke equivalent (17 icons)
 *   • Custom SVG    — Material-specific shapes with no close Lucide match (6 icons)
 *
 * All custom SVGs use viewBox="0 0 24 24" and fill="currentColor" to match the
 * Material Symbols Outlined geometry used in the Stitch design.
 *
 * Usage:
 *   import { Search, AccountTree, SyncProblem } from '@/components/ui/Icons'
 *   <Search size={20} className="text-on-surface-variant" />
 */

// ─── Lucide Re-exports (stroke-based, matches Material Symbols FILL=0) ────────

export {
  // Navbar
  Search,
  Bell as Notifications,
  Settings,

  // Sidebar navigation
  LayoutDashboard as Dashboard,
  Users as Group,
  CreditCard as Payments,
  HeartHandshake as VolunteerActivism,
  ShieldCheck as VerifiedUser,
  Activity as Monitoring,

  // Filters & dropdowns
  ChevronDown as ExpandMore,

  // General actions
  X as Close,
  Pencil as Edit,
  Plus as Add,

  // Pagination
  ChevronLeft,
  ChevronRight,

  // Edit modal
  Camera as PhotoCamera,
  Lock,
} from 'lucide-react';

// ─── Custom SVG Components ─────────────────────────────────────────────────────
// These icons have no faithful Lucide equivalent, or their Material path
// geometry differs enough from Lucide that they would look inconsistent.

import type { SVGProps } from 'react';

/** Shared props type — mirrors Lucide's icon API for drop-in compatibility */
export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Width and height in px. Defaults to 24. */
  size?: number | string;
}

function buildProps(
  { size = 24, className = '', style, ...rest }: IconProps,
  defaultClassName: string,
): SVGProps<SVGSVGElement> {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'currentColor',
    className: [defaultClassName, className].filter(Boolean).join(' '),
    style,
    'aria-hidden': true,
    ...rest,
  };
}

// ─── AccountTree ──────────────────────────────────────────────────────────────
/**
 * Org hierarchy / department tree.
 * Used: Department filter dropdown, Department field in edit modal.
 * No Lucide equivalent — the shape is a T-bar org chart unique to Material.
 *
 * Source: /public/Icons/account_tree.svg (Material Symbols)
 * Path: M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z
 */
export function AccountTree({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z" />
    </svg>
  );
}

// ─── FiberManualRecord ────────────────────────────────────────────────────────
/**
 * Solid filled dot — status filter indicator, status column badge dot.
 * Lucide's <Circle> is stroke-only; this is always a solid 8px-radius fill.
 *
 * Source: /public/Icons/fiber_manual_record.svg
 * Path: <circle cx="12" cy="12" r="8"/>
 */
export function FiberManualRecord({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

// ─── Sync ─────────────────────────────────────────────────────────────────────
/**
 * "Sync from HRIS" action button.
 * Lucide's <RefreshCw> is a single clockwise arrow; the Material `sync` icon
 * uses two opposing arrows forming a full cycle — a meaningfully different shape.
 *
 * Source: /public/Icons/sync.svg (Material Symbols)
 * Path: M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46
 *       1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6
 *       0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z
 */
export function Sync({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
    </svg>
  );
}

// ─── UploadFile ───────────────────────────────────────────────────────────────
/**
 * "Bulk Import" action button.
 * Lucide's <FileUp> uses a simplified path; this uses the Material Symbols
 * shape where the arrow tip breaks through the page fold, matching the design.
 *
 * Source: /public/Icons/upload_file.svg (Material Symbols)
 * Path: M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4
 *       18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16
 *       15.01 12.01 11 8 15.01z
 */
export function UploadFile({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z" />
    </svg>
  );
}

// ─── CheckCircleFilled ────────────────────────────────────────────────────────
/**
 * Status indicator — "Active" / "Verified" badges in the registry matrix.
 * Lucide's <CheckCircle2> is stroke-based; the design uses the filled Material
 * variant so the badge reads as solid colour at small sizes.
 *
 * Source: /public/Icons/check_circle.svg (Material Symbols filled)
 * Path: M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2
 *       15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z
 */
export function CheckCircleFilled({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

// ─── SyncProblem ──────────────────────────────────────────────────────────────
/**
 * HRIS sync error indicator — shown on the Marcus Thorne row.
 * No Lucide equivalent. Custom SVG: Material Symbols `sync_problem` —
 * the cycling-arrow sync shape with an exclamation mark (!) in the centre,
 * signalling a failed or conflicted sync state.
 *
 * Source: Constructed from Material Symbols path data (no equivalent in project).
 *
 * Anatomy:
 *   Left  arc + arrow tail  →  coming from 7 o'clock, pointing down-left
 *   Right arc + arrow tail  →  coming from 1 o'clock, pointing up-right
 *   Centre exclamation      →  vertical bar (M11 10h2V7h-2v3z) + dot (M11 12h2v2h-2z)
 */
export function SyncProblem({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      {/* Left arc: counter-clockwise arrow from bottom-left */}
      <path d="M3 12c0 2.21.91 4.2 2.36 5.64L3 20h6v-6l-2.24 2.24C5.68 15.15 5 13.66 5 12c0-2.61 1.67-4.83 4-5.65V4.26C5.55 5.15 3 8.27 3 12z" />
      {/* Right arc: clockwise arrow from top-right */}
      <path d="M17.64 6.36 21 6h-6v6l2.24-2.24C18.32 10.85 19 12.34 19 14c0 2.61-1.67 4.83-4 5.74v2.07c3.45-.89 6-3.99 6-7.81 0-2.21-.91-4.2-2.36-5.64z" />
      {/* Exclamation mark — vertical bar */}
      <path d="M11 7h2v3h-2z" />
      {/* Exclamation mark — dot */}
      <path d="M11 12h2v2h-2z" />
    </svg>
  );
}

// ─── Bonus: icons in the project SVG folder, available for other screens ──────

/**
 * Person / user silhouette (profile avatar fallback, manager field).
 * Matches Material Symbols `person` — note the wider shoulder fill vs Lucide's <User>.
 *
 * Source: /public/Icons/person.svg
 */
export function Person({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

/**
 * Remove / minus-in-circle (destructive inline action).
 * Matches Material Symbols `remove_circle` — solid fill vs Lucide's stroke <MinusCircle>.
 *
 * Source: /public/Icons/remove_circle.svg
 */
export function RemoveCircle({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
    </svg>
  );
}

export function FilterList({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')} viewBox="0 -960 960 960">
      <path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z" />
    </svg>
  );
}

export function Sort({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg {...buildProps({ size, className, ...props }, '')} viewBox="0 -960 960 960">
      <path d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z" />
    </svg>
  );
}

