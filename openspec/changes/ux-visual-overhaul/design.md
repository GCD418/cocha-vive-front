# Technical Design: UX Visual Overhaul

## Overview
Angular 21.2 standalone components, Bootstrap 5.3.3. All changes additive/style-only. Zero JS logic changes.

## Key Design Decisions

1. **`--cv-` namespace** for CSS custom properties to avoid Bootstrap conflicts
2. **Plain `.css` tokens** (not `.scss`) so `var()` works across component boundaries
3. **`design-tokens.css` inserted BEFORE `main.css`** in angular.json for cascade precedence
4. **4 new standalone components**: LoadingSpinner, EmptyState, ErrorBanner, SkipLink
5. **Optional FocusTrapDirective** for modal accessibility
6. **GPU-accelerated only**: `transform`/`opacity` transitions, no layout-triggering properties
7. **`cubic-bezier(0.4, 0, 0.2, 1)`** easing (Material standard)

## Design Tokens

File: `src/assets/css/design-tokens.css`

Colors: `--cv-accent` (#f82249), `--cv-heading` (#0e1b4d), `--cv-text` (#2f3138), `--cv-text-muted`, `--cv-surface`, `--cv-bg-alt` (#f2f2f3)
Spacing: 4px base scale (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px)
Shadows: sm (1px/3px), md (4px/12px), lg (14px/30px), focus ring
Radius: sm (8px), md (12px), lg (16px), xl (20px), full (50px)
Transitions: fast (150ms), base (200ms), slow (300ms)
Typography: xs through 4xl

## Card System

- `.cv-card`: base with hover lift, border-radius, shadow
- `.cv-card--featured`: accent border + badge
- `.cv-card__image-wrapper`: 16/9 aspect-ratio, overlay gradient, hover zoom
- `.cv-card__badge`: absolute positioned, category (accent) + price (heading) variants

## Button System

- `.cv-btn-primary`: accent fill, white text, full border-radius, hover/active transitions
- `.cv-btn-secondary`: outline, transparent bg, fills on hover
- `.cv-btn-ghost`: text-only, subtle hover background
- `.cv-focus-ring`: visible focus indicator via box-shadow
- `.cv-hover-lift`: reusable translateY(-4px) + shadow utility
- `.cv-active-press`: reusable scale(0.97) utility

## Micro-interactions

All CSS-only, transform/opacity. Durations: 150ms press, 200ms micro, 300ms entrances.

| Interaction | Properties | Duration |
|---|---|---|
| Nav underline | `::before` width 0→100% | 300ms |
| Card lift | translateY(-4px) + shadow | 300ms |
| Card image zoom | scale(1.05) | 300ms |
| Button press | scale(0.97) | 150ms |
| Toast slide-in | translateX(100%)→0, opacity | 300ms |
| Modal entrance | scale(0.95)→1, opacity | 300ms |

## New Files

```
src/assets/css/design-tokens.css
src/app/shared/loading-spinner/  (ts + html + css + spec)
src/app/shared/empty-state/       (ts + html + css + spec)
src/app/shared/error-banner/      (ts + html + css + spec)
src/app/shared/skip-link/         (ts + html + css + spec)
src/app/shared/focus-trap.directive.ts
```

## Modified Files

angular.json (add design-tokens.css), app.html (add skip-link), app.css (focus-ring), en.json + es.json (new keys), ~38 template files (semantic HTML + aria-labels + CSS class migration)

## Migration Order

1. Foundation: design-tokens.css + angular.json
2. Shared Components: 4 new components + i18n keys + directive
3. CSS Migration: page-by-page class replacement, button system, micro-interactions
4. Component Integration: replace inline patterns with shared components
