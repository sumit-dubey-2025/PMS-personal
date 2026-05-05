/**
 * PulsePerform – Tailwind CSS Design Token Reference
 *
 * Design system: "Cognitive Canvas" (New Era Pulse)
 * Source: Stitch project "PMS Web App Design" (10069504428831852214)
 *
 * ⚠️  TAILWIND v4 NOTE
 * This project uses Tailwind CSS v4 (@tailwindcss/postcss), which reads tokens
 * from CSS `@theme` blocks in `styles/tokens.css`, NOT from this file.
 * This file is a canonical reference — treat it as the source of truth for all
 * token values when updating tokens.css or any component.
 *
 * To activate a config file in v4 you would add `@config "./tailwind.config.ts"`
 * at the top of your CSS entry point, but the CSS-first approach is preferred.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./styles/**/*.css",
  ],

  theme: {
    extend: {
      // ─────────────────────────────────────────────────────────────────────
      // COLORS
      // Source: Stitch namedColors (Material Design 3 tonal palette)
      //
      // Override brand anchors (user-selected brand intent):
      //   Primary   → #002D6A  (deep navy)
      //   Secondary → #4AC6E9  (crystalline cyan)
      //   Tertiary  → #212121  (near-black)
      //   Neutral   → #F3F3F6  (cool off-white)
      //
      // The full palette below is generated from these anchors.
      // ─────────────────────────────────────────────────────────────────────
      colors: {
        // --- Primary (Navy) ---
        primary: {
          DEFAULT: "#001942", // Stitch: primary
          container: "#002d6a", // Stitch: primary_container  ← brand anchor
          fixed: "#d8e2ff", // Stitch: primary_fixed
          "fixed-dim": "#aec6ff", // Stitch: primary_fixed_dim / inverse_primary
          tint: "#3e5d9c", // Stitch: surface_tint
        },
        "on-primary": {
          DEFAULT: "#ffffff", // Stitch: on_primary
          container: "#7897da", // Stitch: on_primary_container
          fixed: "#001a43", // Stitch: on_primary_fixed
          "fixed-variant": "#234582", // Stitch: on_primary_fixed_variant
        },

        // --- Secondary (Cyan) ---
        secondary: {
          DEFAULT: "#00677e", // Stitch: secondary
          container: "#63dbfe", // Stitch: secondary_container
          fixed: "#b4ebff", // Stitch: secondary_fixed
          "fixed-dim": "#5dd5f8", // Stitch: secondary_fixed_dim
          // Brand override: #4AC6E9 — used in existing tokens.css as the
          // visible brand cyan; maps to secondary_fixed_dim tonally.
          brand: "#4ac6e9",
        },
        "on-secondary": {
          DEFAULT: "#ffffff", // Stitch: on_secondary
          container: "#005e73", // Stitch: on_secondary_container
          fixed: "#001f27", // Stitch: on_secondary_fixed
          "fixed-variant": "#004e5f", // Stitch: on_secondary_fixed_variant
        },

        // --- Tertiary (Near-black) ---
        tertiary: {
          DEFAULT: "#1b1b1b", // Stitch: tertiary  ← brand anchor #212121
          container: "#303030", // Stitch: tertiary_container
          fixed: "#e5e2e1", // Stitch: tertiary_fixed
          "fixed-dim": "#c8c6c5", // Stitch: tertiary_fixed_dim
        },
        "on-tertiary": {
          DEFAULT: "#ffffff", // Stitch: on_tertiary
          container: "#999797", // Stitch: on_tertiary_container
          fixed: "#1b1c1c", // Stitch: on_tertiary_fixed
          "fixed-variant": "#474746", // Stitch: on_tertiary_fixed_variant
        },

        // --- Error ---
        error: {
          DEFAULT: "#ba1a1a", // Stitch: error
          container: "#ffdad6", // Stitch: error_container
        },
        "on-error": {
          DEFAULT: "#ffffff", // Stitch: on_error
          container: "#93000a", // Stitch: on_error_container
        },

        // --- Surface Hierarchy (The Layering System) ---
        // Base:     surface           (#f9f9fc) — page background
        // Sheet 1:  surface-low       (#f3f3f6) — layout sections
        // Sheet 2:  surface           (#edeef1) — container zones
        // Sheet 3:  surface-high      (#e8e8eb) — nested data tables
        // Sheet 4:  surface-highest   (#e2e2e5) — disabled / deepest nesting
        // Card:     surface-lowest    (#ffffff)  — lifted cards (white)
        surface: {
          DEFAULT: "#f9f9fc", // Stitch: surface / surface_bright / background
          dim: "#d9dadd", // Stitch: surface_dim — sidebar glassmorphism base
          variant: "#e2e2e5", // Stitch: surface_variant
          "container-lowest": "#ffffff", // Stitch: surface_container_lowest — cards
          "container-low": "#f3f3f6", // Stitch: surface_container_low — layout sections
          container: "#edeef1", // Stitch: surface_container
          "container-high": "#e8e8eb", // Stitch: surface_container_high — data tables
          "container-highest": "#e2e2e5", // Stitch: surface_container_highest — progress track
        },
        "on-surface": {
          DEFAULT: "#1a1c1e", // Stitch: on_surface / on_background
          variant: "#434750", // Stitch: on_surface_variant
        },

        // --- Inverse (for dark-on-light overlays) ---
        inverse: {
          surface: "#2f3133", // Stitch: inverse_surface
          "on-surface": "#f0f0f3", // Stitch: inverse_on_surface
          primary: "#aec6ff", // Stitch: inverse_primary
        },

        // --- Outline ---
        outline: {
          DEFAULT: "#747781", // Stitch: outline
          variant: "#c4c6d2", // Stitch: outline_variant — ghost border base
        },

        // --- Semantic Status ---
        // Note: error is already defined above from the Stitch palette.
        // Success and warning are extended beyond Stitch's base palette
        // to cover HR-specific status indicators.
        success: {
          DEFAULT: "#1e8449",
          container: "#d4efdf",
        },
        warning: {
          DEFAULT: "#e67e22",
          container: "#fef9e7",
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      // FONT FAMILIES
      // Headline / Display: Manrope — "Anchors" (authority, modernism)
      // Body / Label:       Inter   — "Data" (legibility, neutrality)
      // ─────────────────────────────────────────────────────────────────────
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"], // default sans override
      },

      // ─────────────────────────────────────────────────────────────────────
      // FONT WEIGHTS
      // Design roles:
      //   display-md / headline-sm → Manrope 700 (bold)
      //   headline-lg              → Manrope 600 (semibold)
      //   body-md                  → Inter 400 (regular)
      //   label-sm / label-md      → Inter 500 (medium)
      //   label-md uppercase       → Inter 600 (semibold) with tracking
      // ─────────────────────────────────────────────────────────────────────
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      // ─────────────────────────────────────────────────────────────────────
      // FONT SIZES  (Material Design 3 type scale)
      // Display   → Manrope, large hero figures / dashboard totals
      // Headline  → Manrope, section anchors
      // Title     → Manrope, card headers
      // Body      → Inter, all data / prose
      // Label     → Inter, metadata / table headers / badges
      // ─────────────────────────────────────────────────────────────────────
      fontSize: {
        // Display
        "display-lg": ["3.5625rem", { lineHeight: "4rem", fontWeight: "700" }], // 57px
        "display-md": ["2.8125rem", { lineHeight: "3.25rem", fontWeight: "700" }], // 45px
        "display-sm": ["2.25rem", { lineHeight: "2.75rem", fontWeight: "400" }], // 36px
        // Headline
        "headline-lg": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }], // 32px
        "headline-md": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "600" }], // 28px
        "headline-sm": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }], // 24px
        // Title
        "title-lg": ["1.375rem", { lineHeight: "1.75rem", fontWeight: "600" }], // 22px
        "title-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "500", letterSpacing: "0.009375rem" }],
        "title-sm": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "500", letterSpacing: "0.00625rem" }],
        // Body
        "body-lg": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }], // 16px
        "body-md": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }], // 14px
        "body-sm": ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }], // 12px
        // Label
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "500" }], // 14px
        "label-md": ["0.75rem", { lineHeight: "1rem", fontWeight: "500", letterSpacing: "0.03125rem" }], // 12px
        "label-sm": ["0.6875rem", { lineHeight: "1rem", fontWeight: "500", letterSpacing: "0.03125rem" }], // 11px
      },

      // ─────────────────────────────────────────────────────────────────────
      // LETTER SPACING
      // Design: "label-md uppercase subtitle (tracking: 0.05rem)"
      // ─────────────────────────────────────────────────────────────────────
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.025em",
        tight: "-0.01em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05rem", // ← editorial locked-up header subtitle
        widest: "0.1em",
      },

      // ─────────────────────────────────────────────────────────────────────
      // SPACING SCALE
      // Base unit: 4px (0.25rem) — 4dp Material Design 3 grid
      // SpacingScale multiplier from Stitch: 1 (no scaling)
      //
      // Key design references:
      //   card-padding  → space-7  (28px / 1.75rem) per design doc
      //   dividers      → space-10, space-12, space-16
      //   sidebar-pill  → space-1  (4px indicator width)
      //
      // Extends Tailwind's default scale; named tokens below are the
      // design-system-specific values explicitly called out in the spec.
      // ─────────────────────────────────────────────────────────────────────
      spacing: {
        // 4px grid — explicit semantic names for design doc references
        "0.5": "0.125rem", //  2px
        "1": "0.25rem", //  4px — sidebar active pill width
        "1.5": "0.375rem", //  6px
        "2": "0.5rem", //  8px
        "2.5": "0.625rem", // 10px
        "3": "0.75rem", // 12px
        "4": "1rem", // 16px
        "5": "1.25rem", // 20px
        "6": "1.5rem", // 24px
        "7": "1.75rem", // 28px ← card internal padding ("spacing 8" per design doc)
        "8": "2rem", // 32px
        "9": "2.25rem", // 36px
        "10": "2.5rem", // 40px ← primary whitespace divider
        "11": "2.75rem", // 44px
        "12": "3rem", // 48px ← primary whitespace divider
        "14": "3.5rem", // 56px
        "16": "4rem", // 64px ← primary whitespace divider
        "20": "5rem", // 80px
        "24": "6rem", // 96px
        "28": "7rem", // 112px
        "32": "8rem", // 128px
        "36": "9rem", // 144px
        "40": "10rem", // 160px
        "48": "12rem", // 192px
        "56": "14rem", // 224px
        "64": "16rem", // 256px
        "72": "18rem", // 288px
        "80": "20rem", // 320px
        "96": "24rem", // 384px
        // Sidebar width
        "sidebar": "15rem", // 240px
        "sidebar-collapsed": "4.5rem", // 72px
      },

      // ─────────────────────────────────────────────────────────────────────
      // BORDER RADIUS
      // Roundness: ROUND_FOUR — all radii are multiples of 4px
      // Design mandate: "md and xl roundedness scale" — no sharp corners.
      //
      //   sm   → inputs, chips, tags, badges
      //   md   → buttons, secondary containers
      //   lg   → modals, dropdowns, menus
      //   xl   → dashboard cards (explicitly "xl = 0.75rem" per design doc)
      //   2xl  → feature cards, sidebars
      //   full → pills, avatars, progress tracks
      // ─────────────────────────────────────────────────────────────────────
      borderRadius: {
        none: "0",
        sm: "0.25rem", //  4px
        DEFAULT: "0.375rem", //  6px
        md: "0.5rem", //  8px
        lg: "0.625rem", // 10px
        xl: "0.75rem", // 12px ← card border radius (explicit in design doc)
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
        full: "9999px",
      },

      // ─────────────────────────────────────────────────────────────────────
      // BOX SHADOWS
      // Philosophy: "depth is a whisper, not a shout"
      // Shadow color: 6% opacity of on_surface (#1a1c1e)
      //
      //   ambient        → standard floating element (FAB, notification)
      //   ambient-lifted → elevated modals / overlays
      //   focus          → input focus ring (secondary_fixed_dim 20%)
      //   progress-glow  → progress bar indicator glow (secondary)
      //   none           → cards use tonal layering, not shadows
      // ─────────────────────────────────────────────────────────────────────
      boxShadow: {
        none: "none",
        // Ambient — 6% opacity of on_surface, large diffused blur, y-only offset
        ambient: "0 8px 28px rgba(26, 28, 30, 0.06)",
        "ambient-sm": "0 4px 24px rgba(26, 28, 30, 0.05)",
        "ambient-lifted": "0 16px 48px rgba(26, 28, 30, 0.08)",
        "ambient-xl": "0 24px 64px rgba(26, 28, 30, 0.10)",
        // Focus ring — 4px glow of secondary_fixed_dim at 20% opacity
        focus: "0 0 0 4px rgba(93, 213, 248, 0.20)",
        // Progress glow — 2px blur in secondary color (#00677e)
        "progress-glow": "0 0 2px 1px rgba(0, 103, 126, 0.60)",
        // Ghost border fallback (outline_variant at ~20% opacity)
        // Used via border, not box-shadow, but kept here for reference.
      },

      // ─────────────────────────────────────────────────────────────────────
      // BACKDROP BLUR
      // Glassmorphism: 20px blur for floating elements (sidebar, modals, menus)
      // ─────────────────────────────────────────────────────────────────────
      backdropBlur: {
        glass: "20px",
      },

      // ─────────────────────────────────────────────────────────────────────
      // OPACITY
      // Ghost border opacity range: 15%–25%
      // Glassmorphism surface opacity: 80%
      // Secondary container tint (active nav): 40%
      // ─────────────────────────────────────────────────────────────────────
      opacity: {
        "0": "0",
        "5": "0.05",
        "10": "0.10",
        "15": "0.15",
        "20": "0.20",
        "25": "0.25",
        "30": "0.30",
        "40": "0.40",
        "50": "0.50",
        "60": "0.60",
        "75": "0.75",
        "80": "0.80", // glassmorphism surface
        "90": "0.90",
        "95": "0.95",
        "100": "1",
      },

      // ─────────────────────────────────────────────────────────────────────
      // SCREENS (desktop-first, 1280px canvas)
      // ─────────────────────────────────────────────────────────────────────
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px", // primary design canvas width
        "2xl": "1536px",
      },
    },
  },

  plugins: [],
};

export default config;
