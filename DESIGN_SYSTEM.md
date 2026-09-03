# COSTFY — DESIGN SYSTEM

## 1. CORE PRINCIPLES

- **Data over Chrome:** The UI chrome should fade into the background. Let the data stand out.
- **Semantic Consistency:** Colors, spacing, and typography must have specific meanings and be applied consistently.
- **Premium Editorial Feel:** Layouts should resemble high-end financial reports or developer tools, not generic dashboard templates. Avoid excessive boxes and cards.
- **Precision:** Perfect alignment, tabular figures for numbers, and exact spacing.

## 2. TYPOGRAPHY

**Font Family:** Inter (or similar sans-serif tailored for UIs) for standard text.
**Features:** Tabular numerals (`tnum`) must be enabled for all financial and metric data to ensure perfect vertical alignment in tables.

**Hierarchy:**

- `text-xs` (12px): Metadata, subtle labels, tooltips.
- `text-sm` (14px): Standard body text, table cells, secondary metrics.
- `text-base` (16px): Primary inputs, important body text.
- `text-lg` (18px) to `text-2xl` (24px): Section headers, primary metrics.
- `text-3xl` (30px)+: Only for hero metrics (e.g., Total Revenue on Dashboard), used sparingly.

**Weights:**

- `font-normal` (400): Body text, secondary data.
- `font-medium` (500): Column headers, secondary labels, buttons.
- `font-semibold` (600): Primary metrics, important titles.
- _Avoid:_ `font-bold` (700) or higher, unless strictly necessary for extreme emphasis.

## 3. COLOR SYSTEM (TOKENS)

Avoid hardcoding HEX values. Use Tailwind's semantic classes based on this structure:

### Backgrounds

- `bg-background`: The main app background (Base).
- `bg-surface`: Panels, sections, or cards resting on the background.
- `bg-surface-elevated`: Dropdowns, popovers, modals.
- `bg-surface-hover`: Subtle highlight for interactive rows/items.

### Text

- `text-primary`: Default text color (high contrast).
- `text-secondary`: Supporting text, labels (medium contrast).
- `text-muted`: Disabled states, highly secondary info (low contrast).

### Borders

- `border-subtle`: Dividers between list items, table rows.
- `border-default`: Standard borders for inputs, active panels.
- `border-focus`: High-contrast border for keyboard/input focus.

### Semantic / Status

- `text-success` / `bg-success-subtle`: Positive metrics, active states. (Avoid pure #00FF00, use refined emerald/mint).
- `text-danger` / `bg-danger-subtle`: Negative metrics, errors, destructive actions. (Refined crimson/rose).
- `text-warning` / `bg-warning-subtle`: Alerts, missing data. (Refined amber).
- `text-info` / `bg-info-subtle`: Neutral information, Brain insights. (Refined blue).

### Brand

- `bg-brand` / `text-brand`: Royal Blue / Navy. Used strictly for primary actions, active navigation states, and brand moments.

## 4. SPACING & LAYOUT

- Use a strict 4px/8px grid system.
- `gap-2` (8px), `gap-4` (16px), `gap-6` (24px) are standard.
- **Sections:** Instead of putting everything in a card, use `border-b` (dividers) and generous vertical spacing (`pb-6 mb-6`) to separate distinct areas of a page.
- **Density:** Keep tables and lists relatively dense (`py-2` or `py-3` on cells) to allow more data to be visible without scrolling.

## 5. BORDERS & RADIUS

- **Radius:** Subtle and professional.
  - `rounded-sm` (2px-4px): Badges, small inputs.
  - `rounded-md` (6px-8px): Standard buttons, inputs, panels.
  - `rounded-xl` / `rounded-2xl`: Use rarely, perhaps for large modal windows or overarching page containers, but avoid the "bubbly" look.
- **Borders:** Prefer borders over shadows for separating elements on the same z-plane. `border border-border-subtle` is preferred over `shadow-sm`.

## 6. SHADOWS & ELEVATION

- Shadows should _only_ indicate z-axis elevation.
- Level 0 (Flat): Base content, inline metrics.
- Level 1 (`shadow-sm`): Subtle depth for interactive buttons (optional).
- Level 2 (`shadow-md`): Dropdowns, tooltips, flyout menus.
- Level 3 (`shadow-xl`): Modals, dialogs, critical overlays.
- _Rule:_ Do not use shadows on standard dashboard panels. Use subtle borders or slight background color differences instead.

## 7. COMPONENTS

### Metrics (Inline vs. Panel)

- Instead of a massive grid of white boxes, group related metrics with simple dividers.
- Label above, Value below.
- Delta (Change): Format as `+X%` or `-X%` next to the value, colored semantically.

### Tables

- The workhorse of the application.
- Invisible vertical borders.
- Subtle horizontal borders (`border-b`).
- Right-align all numbers (currency, percentages, counts).
- Left-align text.
- Hover state on rows (`hover:bg-surface-hover`) is mandatory.

### Brain Components

- Do not use chat bubbles.
- **Insight Panel:** A distinct surface (perhaps with a subtle brand-colored left border) containing the analysis.
- **Action Block:** Clear "What, Why, Impact" structure. Primary button to "Approve", secondary to "Reject".

### Empty States

- Minimalist. A subdued icon (not a massive illustration), a clear title, a helpful description, and a primary call-to-action button.

## 8. MOTION & MICROINTERACTIONS

- Animations must be fast (`duration-150` or `duration-200`) and purposeful.
- **Hover:** Buttons and interactive elements must have clear hover states (slight background change or border change).
- **Focus:** Critical for accessibility. Use `ring` utilities for clear keyboard focus.
- **Transitions:** Fade-ins for new data or page loads. Avoid bouncing, springing, or complex choreographies.
