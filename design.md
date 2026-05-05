# Design System: Cognitive Canvas (New Era Pulse)

Source: Stitch project "PMS Web App Design" (10069504428831852214)

---

## Philosophy

**"Cognitive Canvas"** — clarity through intentional hierarchy. Depth via tonal layering, not lines or shadows.

---

## Colors

### Brand Anchors (Override Values)
| Token | Hex | Role |
|---|---|---|
| Primary | `#002D6A` | Deep navy — authority |
| Secondary | `#4AC6E9` | Crystalline cyan — energy |
| Tertiary | `#212121` | Near-black — grounding |
| Neutral | `#F3F3F6` | Cool off-white — base |

### Full Tonal Palette (Stitch Named Colors)

**Primary (Navy)**
| CSS Variable | Hex | Tailwind Class |
|---|---|---|
| `--primary` | `#001942` | `bg-primary` |
| `--primary-container` | `#002d6a` | `bg-primary-container` |
| `--primary-fixed` | `#d8e2ff` | `bg-primary-fixed` |
| `--primary-fixed-dim` | `#aec6ff` | `bg-primary-fixed-dim` |
| `--primary-tint` | `#3e5d9c` | `bg-primary-tint` |
| `--on-primary` | `#ffffff` | `text-on-primary` |
| `--on-primary-container` | `#7897da` | `text-on-primary-container` |
| `--on-primary-fixed` | `#001a43` | `text-on-primary-fixed` |
| `--on-primary-fixed-variant` | `#234582` | `text-on-primary-fixed-variant` |

**Secondary (Cyan)**
| CSS Variable | Hex | Tailwind Class |
|---|---|---|
| `--secondary` | `#00677e` | `bg-secondary` |
| `--secondary-container` | `#63dbfe` | `bg-secondary-container` |
| `--secondary-fixed` | `#b4ebff` | `bg-secondary-fixed` |
| `--secondary-fixed-dim` | `#5dd5f8` | `bg-secondary-fixed-dim` |
| `--secondary-brand` | `#4ac6e9` | `bg-secondary-brand` |
| `--on-secondary` | `#ffffff` | `text-on-secondary` |
| `--on-secondary-container` | `#005e73` | `text-on-secondary-container` |

**Tertiary (Near-black)**
| CSS Variable | Hex | Tailwind Class |
|---|---|---|
| `--tertiary` | `#1b1b1b` | `bg-tertiary` |
| `--tertiary-container` | `#303030` | `bg-tertiary-container` |
| `--tertiary-fixed` | `#e5e2e1` | `bg-tertiary-fixed` |
| `--tertiary-fixed-dim` | `#c8c6c5` | `bg-tertiary-fixed-dim` |
| `--on-tertiary` | `#ffffff` | `text-on-tertiary` |
| `--on-tertiary-fixed-variant` | `#474746` | `text-on-tertiary-fixed-variant` |

**Error**
| CSS Variable | Hex |
|---|---|
| `--error` | `#ba1a1a` |
| `--error-container` | `#ffdad6` |
| `--on-error` | `#ffffff` |
| `--on-error-container` | `#93000a` |

**Surface Hierarchy** (tonal layering — no borders between layers)
| Layer | CSS Variable | Hex | Use |
|---|---|---|---|
| Card (lifted) | `--surface-container-lowest` | `#ffffff` | Interactive cards |
| Base | `--surface` | `#f9f9fc` | Page background |
| Layout sections | `--surface-container-low` | `#f3f3f6` | Sidebar, panels |
| Zones | `--surface-container` | `#edeef1` | Content zones |
| Data tables | `--surface-container-high` | `#e8e8eb` | Table backgrounds |
| Deepest / Disabled | `--surface-container-highest` | `#e2e2e5` | Progress track, disabled |
| Dim | `--surface-dim` | `#d9dadd` | Glassmorphism base |
| Variant | `--surface-variant` | `#e2e2e5` | Hover states |

**Text**
| CSS Variable | Hex | Use |
|---|---|---|
| `--on-surface` | `#1a1c1e` | Primary text — never use `#000000` |
| `--on-surface-variant` | `#434750` | Secondary / supporting text |

**Outline**
| CSS Variable | Hex | Use |
|---|---|---|
| `--outline` | `#747781` | Dividers |
| `--outline-variant` | `#c4c6d2` | Ghost borders (15–25% opacity) |

**Semantic Status**
| Token | Hex |
|---|---|
| `--success` | `#1e8449` |
| `--success-container` | `#d4efdf` |
| `--warning` | `#e67e22` |
| `--warning-container` | `#fef9e7` |
| `--in-progress` | `#f39c12` |

---

## Typography

### Font Families
- **Display / Headline:** Manrope — architectural strength, stability, modernism
- **Body / Label:** Inter — functional legibility for data-dense screens

### Type Scale
| Role | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| display-lg | Manrope | 57px / 3.5625rem | 700 | 4rem |
| display-md | Manrope | 45px / 2.8125rem | 700 | 3.25rem |
| display-sm | Manrope | 36px / 2.25rem | 400 | 2.75rem |
| headline-lg | Manrope | 32px / 2rem | 700 | 2.5rem |
| headline-md | Manrope | 28px / 1.75rem | 600 | 2.25rem |
| headline-sm | Manrope | 24px / 1.5rem | 600 | 2rem |
| title-lg | Manrope | 22px / 1.375rem | 600 | 1.75rem |
| title-md | Inter | 16px / 1rem | 500 | 1.5rem |
| title-sm | Inter | 14px / 0.875rem | 500 | 1.25rem |
| body-lg | Inter | 16px / 1rem | 400 | 1.5rem |
| body-md | Inter | 14px / 0.875rem | 400 | 1.25rem |
| body-sm | Inter | 12px / 0.75rem | 400 | 1rem |
| label-lg | Inter | 14px / 0.875rem | 500 | 1.25rem |
| label-md | Inter | 12px / 0.75rem | 500 | 1rem |
| label-sm | Inter | 11px / 0.6875rem | 500 | 1rem |

### Editorial "Locked-up" Header
Pair `headline-lg` (Manrope 700) with `label-md` uppercase at `letter-spacing: 0.05rem` for sophisticated section anchors.

---

## Spacing

Base unit: **4px (0.25rem)** — Material Design 3 four-dp grid

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Sidebar active pill width |
| `space-2` | 8px | Tight gaps |
| `space-4` | 16px | Component internal gaps |
| `space-6` | 24px | Section gaps |
| `space-7` | 28px / 1.75rem | Card internal padding |
| `space-10` | 40px | Primary whitespace divider |
| `space-12` | 48px | Primary whitespace divider |
| `space-16` | 64px | Primary whitespace divider |

---

## Border Radius

Roundness: **ROUND_FOUR** — all radii are multiples of 4px. No sharp corners.

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px / 0.25rem | Chips, tags, badges, small elements |
| `rounded` | 6px / 0.375rem | Default |
| `rounded-md` | 8px / 0.5rem | Buttons, input fields |
| `rounded-lg` | 10px / 0.625rem | Dropdowns, menus |
| `rounded-xl` | 12px / 0.75rem | **Dashboard cards** (explicit design spec) |
| `rounded-2xl` | 16px / 1rem | Feature cards |
| `rounded-3xl` | 24px / 1.5rem | Large containers |
| `rounded-full` | 9999px | Pills, avatars, progress tracks |

---

## Elevation & Shadows

**Philosophy:** "Depth is a whisper, not a shout." Prefer tonal layering over shadows.

### Ambient Shadows
Shadow color: 6% opacity of `on_surface` (#1a1c1e) — `rgba(26, 28, 30, 0.06)`

| Token | Value | Use |
|---|---|---|
| `shadow-ambient-sm` | `0 4px 24px rgba(26,28,30,0.05)` | Subtle hover |
| `shadow-ambient` | `0 8px 28px rgba(26,28,30,0.06)` | FAB, notifications |
| `shadow-ambient-lifted` | `0 16px 48px rgba(26,28,30,0.08)` | Modals, elevated overlays |
| `shadow-ambient-xl` | `0 24px 64px rgba(26,28,30,0.10)` | Full-screen overlays |

### Special Shadows
| Token | Value | Use |
|---|---|---|
| `shadow-focus` | `0 0 0 4px rgba(93,213,248,0.20)` | Input focus ring |
| `shadow-progress-glow` | `0 0 2px 1px rgba(0,103,126,0.60)` | Progress bar indicator glow |

---

## Glassmorphism

Applied to: floating elements — Modals, Hover Menus, Sidebar

```css
background: rgba(255, 255, 255, 0.82); /* surface-container-lowest at 80–82% */
backdrop-filter: blur(20px);
border: 1px solid rgba(196, 198, 210, 0.20); /* outline-variant at 20% */
```

Use the `.glass-card` utility class from `styles/utilities.css`.

---

## Component Patterns

### Sidebar Navigation
- Background: glassmorphism over `surface-dim`
- Active indicator: 4px vertical pill in `secondary` color
- Active background: `secondary-container` at 40% opacity

### Dashboard Cards
- Background: `surface-container-lowest` (`#ffffff`)
- Border radius: `rounded-xl` (12px)
- Padding: `space-7` (28px / 1.75rem)
- No borders — tonal separation only

### Status Badges (Soft-Tint approach)
| State | Text | Background |
|---|---|---|
| Success | `on-tertiary-fixed-variant` | `tertiary-fixed` at 50% opacity |
| Warning | `on-error-container` | `error-container` |
| Secure | `on-primary-fixed` | `primary-fixed` |

### Buttons
| Variant | Background | Text | Notes |
|---|---|---|---|
| Primary | `primary` with gradient | `on-primary` | 5% top-down gradient overlay |
| Secondary | `surface-container-highest` | `on-surface` | No border |
| Tertiary (Ghost) | transparent | text | `surface-variant` hover at 30% opacity |

### Input Fields
- Default: `surface-container-low` fill + ghost border (`outline-variant` at 20%)
- Focus: border transitions to `secondary`, + `shadow-focus` ring

### Progress Bars
- Track: `surface-container-highest`
- Indicator: `secondary` (#00677e) + `shadow-progress-glow`
- Height: 4–6px

---

## Rules

### Do
- Use whitespace (`space-10`, `space-12`, `space-16`) as your primary divider
- Use `rounded-md` and `rounded-xl` — never sharp corners
- Use `primary-fixed-dim` for subtle background accents in data-heavy tables
- Achieve separation through background color shifts, not borders

### Don't
- Use `#000000` for text — use `on-surface` (#1a1c1e)
- Use 100% opaque borders on containers — use ghost borders (15–25% opacity)
- Use horizontal divider lines in lists — use padding or hover background shifts
- Crowd the interface — increase page width and use `surface-container` shifts
