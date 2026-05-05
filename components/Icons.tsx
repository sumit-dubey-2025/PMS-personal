import React from 'react';
import {
  Users,
  ChevronRight,
  Check,
  Circle,
  CircleDot,
  Building2,
  Info,
  FileText,
  ShieldCheck,
  History,
  UploadCloud,
  Trash2,
  Lightbulb,
  AlertOctagon,
  Search,
  Filter,
  X,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRightCircle,
  Hourglass,
  Download,
  ArrowRight,
  ArrowLeft,
  type LucideProps,
} from 'lucide-react';

/**
 * Standard Library Icons (Lucide-React)
 */
export const IconEmployees = (props: LucideProps) => <Users {...props} />;
export const IconChevronRight = (props: LucideProps) => <ChevronRight {...props} />;
export const IconArrowRight = (props: LucideProps) => <ArrowRight {...props} />;
export const IconArrowLeft = (props: LucideProps) => <ArrowLeft {...props} />;
export const IconCheck = (props: LucideProps) => <Check {...props} />;
export const IconCircle = (props: LucideProps) => <Circle {...props} />;
export const IconBuilding = (props: LucideProps) => <Building2 {...props} />;
export const IconInfo = (props: LucideProps) => <Info {...props} />;
export const IconFileText = (props: LucideProps) => <FileText {...props} />;
export const IconShieldCheck = (props: LucideProps) => <ShieldCheck {...props} />;
export const IconHistory = (props: LucideProps) => <History {...props} />;
export const IconDownload = (props: LucideProps) => <Download {...props} />;
export const IconCircleDot = (props: LucideProps) => <CircleDot {...props} />;
export const IconUpload = (props: LucideProps) => <UploadCloud {...props} />;

/**
 * Custom Stitch Data Graphic
 * Extracted raw SVG for the proprietary entity blueprint decoration.
 *
 * ✅ FIX: Replaced all hardcoded hex colours with CSS custom properties that
 * map to the design-token system (styles/tokens.css / Tailwind config).
 * The icon now reacts correctly to theme changes and dark-mode without any
 * code changes here.
 *
 * Token mapping:
 *   #EBEBEE  → var(--color-surface-container-low)  — base shadow layer
 *   #FFFFFF  → var(--color-surface)                — lifted card surface
 *   #C4C6D2  → var(--color-outline-variant)        — card border
 *   #002D6A  → var(--color-primary)                — brand structure lines
 *   #4AC6E9  → var(--color-secondary)              — accent / energy indicators
 */
export const CustomStitchEntityIcon = ({
  className = '',
  size = 64,
}: {
  className?: string;
  size?: number | string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Base Layer: Surface Container Low — background shadow */}
    <rect
      x="8" y="12" width="40" height="44" rx="6"
      fill="var(--color-surface-container-low)"
    />

    {/* Lifted Layer: Surface — card face */}
    <rect
      x="16" y="4" width="40" height="44" rx="6"
      fill="var(--color-surface)"
    />
    {/* Card border: Outline Variant */}
    <rect
      x="16" y="4" width="40" height="44" rx="6"
      stroke="var(--color-outline-variant)"
      strokeWidth="1.5"
    />

    {/* Primary Brand Structure Lines */}
    <path d="M24 16H48" stroke="var(--color-primary)" strokeWidth="3"  strokeLinecap="round" />
    <path d="M24 24H38" stroke="var(--color-primary)" strokeWidth="2"  strokeLinecap="round" />
    <path d="M24 32H44" stroke="var(--color-primary)" strokeWidth="2"  strokeLinecap="round" />

    {/* Secondary Accent 'Energy' Indicators */}
    <circle cx="44" cy="24" r="3"   fill="var(--color-secondary)" />
    <path d="M24 40H32"             stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconTrash = (props: LucideProps) => <Trash2 {...props} />;
export const IconLightbulb = (props: LucideProps) => <Lightbulb {...props} />;
export const IconAlertOctagon = (props: LucideProps) => <AlertOctagon {...props} />;
export const IconSearch = (props: LucideProps) => <Search {...props} />;
export const IconFilter = (props: LucideProps) => <Filter {...props} />;
export const IconX = (props: LucideProps) => <X {...props} />;
export const IconUploadIcon = (props: LucideProps) => <Upload {...props} />;
export const IconClock = (props: LucideProps) => <Clock {...props} />;
export const IconAlertTriangle = (props: LucideProps) => <AlertTriangle {...props} />;
export const IconCheckCircle = (props: LucideProps) => <CheckCircle {...props} />;
export const IconArrowRightCircle = (props: LucideProps) => <ArrowRightCircle {...props} />;
export const IconHourglass = (props: LucideProps) => <Hourglass {...props} />;