# Design System: Impeccable Journal & Planner

<!-- impeccable:design-schema 1 -->

## Design Philosophy

**Functional Minimalism (Notion × Craft × Bear × Midori)**  
The interface recedes so thoughts, routines, and daily plans become the true focal point. Structure is achieved through generous whitespace, editorial typography, and subtle tone shifts—never through aggressive outlines, nested cards, or high-contrast borders.

---

## Visual World: Archival Linen & Warm Stone

- **Atmosphere**: Calm, tactile, organic, and focused. Reminiscent of heavy archival paper, Japanese stationery, and calm morning sunlight.
- **Color Strategy**: Restrained warm neutral matte with purposeful earthy accents.
- **Lighting Scene**: Everyday desk and ambient room lighting; comfortable for hours of extended writing and planning without ocular strain.

---

## Color Tokens

### Backgrounds & Surfaces
- **Light Theme**:
  - `bg-base`: `#fbfaf8` (Warm natural linen / off-white ground)
  - `surface-sheet`: `#ffffff` (Archival white paper surface)
  - `surface-muted`: `#f5f3ef` (Warm stone tint for sidebars, secondary regions)
  - `surface-elevated`: `#ffffff` with micro ambient shadow
- **Dark Theme**:
  - `bg-base`: `#141413` (Deep matte charcoal)
  - `surface-sheet`: `#1c1c1b` (Dark paper surface)
  - `surface-muted`: `#232322` (Subtle graphite tint for sidebars)
  - `surface-elevated`: `#282827`

### Borders & Dividers
- `border-subtle`: `rgba(28, 25, 23, 0.06)` (Light) / `rgba(255, 255, 255, 0.07)` (Dark)
- `border-medium`: `rgba(28, 25, 23, 0.12)` (Light) / `rgba(255, 255, 255, 0.14)` (Dark)
- `divider`: `rgba(28, 25, 23, 0.05)` (Light) / `rgba(255, 255, 255, 0.05)` (Dark)

### Typography & Foregrounds
- `text-primary`: `#1c1917` (Stone 900) / `#f2f0ec` (Dark Stone 100)
- `text-secondary`: `#57534e` (Stone 600) / `#a8a29e` (Dark Stone 400)
- `text-tertiary`: `#8c857f` (Stone 500) / `#78716c` (Dark Stone 500)
- `text-disabled`: `#b5b0aa` (Stone 400) / `#57534e` (Dark Stone 600)

### Purposeful Earthy Accents
- **Terracotta / Rust** (`#c2593f`): Primary action focus, urgent badges, active indicators.
- **Sage / Laurel** (`#4d6b53`): Completed tasks, serene health habits, mindful markers.
- **Warm Amber** (`#b47820`): Highlights, star bookmarks, favorites.
- **Slate / Ash** (`#525d6b`): Technical meta, calendar orbits, neutral tags.

---

## Typography System

- **Primary Font Family**: `'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif`
- **Typographic Scale & Hierarchy**:
  - `Page Title (H1)`: `text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100`
  - `Section Header (H2)`: `text-lg sm:text-xl font-semibold text-stone-800 dark:text-stone-200`
  - `Group Label (H3)`: `text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400`
  - `Body / Planner Text`: `text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300`
  - `Journal / Longform Notes`: `text-sm sm:text-base leading-[1.85] font-normal text-stone-800 dark:text-stone-200`
  - `Caption / Meta`: `text-xs text-stone-500 dark:text-stone-400 font-medium`

---

## Elevation & Depth

- **Zero harsh drop shadows**: Replaced by whisper-soft ambient diffusion:
  - `shadow-soft`: `0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 14px rgba(0, 0, 0, 0.02)`
  - `shadow-float`: `0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)`
- **Modals & Overlays**: `backdrop-blur-md bg-stone-950/40`

---

## Component Language

### Checkboxes
- Size: `w-4 h-4` or `w-4.5 h-4.5`
- Appearance: `rounded-[5px] border border-stone-300 dark:border-stone-600 bg-transparent`
- Checked State: `bg-stone-800 dark:bg-stone-200 border-transparent text-white dark:text-stone-900`
- Transition: Quiet 150ms ease-out, clean strike-through line with opacity dimming.

### Buttons
- **Primary**: `bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all active:scale-[0.98]`
- **Secondary / Soft**: `bg-stone-100 hover:bg-stone-200/80 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all`
- **Ghost**: `text-stone-600 hover:text-stone-900 hover:bg-stone-200/40 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800/50 rounded-lg p-2 transition-colors`

### Inputs & Textareas
- Flat, seamless borders: `bg-stone-100/60 dark:bg-stone-800/40 border border-transparent focus:border-stone-300 dark:focus:border-stone-600 focus:bg-white dark:focus:bg-stone-800/80 rounded-xl px-3.5 py-2 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 transition-all outline-none`
- Inline notes / Journal lines: `bg-transparent border-none outline-none resize-none`

---

## Absolute Anti-Patterns & Quality Bans

1. **No Card-in-Card Nesting**: Sections inside sheets or dashboards must use whitespace and subtle dividers instead of wrapping cards inside cards.
2. **No Neon / Shiny Gradients**: Vibrant blue-to-purple or high-saturation gradient headers are banned.
3. **No Decorative Kickers / Eyebrows**: Headings must speak for themselves without redundant floating taglines.
4. **No Heavy Borders**: Maximum border thickness is 1px with low opacity.
5. **No Fake Icon Boxes**: Plain icons with natural spacing rather than rounded colored squares enclosing every icon.
6. **No Stiff Jumpy Transitions**: All interactive states must use gentle, silent micro-transitions (150–250ms).
