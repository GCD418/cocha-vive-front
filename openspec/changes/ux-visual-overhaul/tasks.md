# UX Visual Overhaul — Implementation Tasks

## Summary
- **Total tasks**: 27
- **Total estimated lines**: ~2200
- **All 26 specs covered**

---

## Phase 1: Foundation (1 task, ~120 lines)

### TASK-001: Design Tokens + Angular Config
- **Files**: `design-tokens.css` (NEW), `angular.json` (MODIFY)
- **Specs**: UX-SPEC-001, UX-SPEC-021, UX-SPEC-026
- Create `--cv-` namespace tokens (colors, spacing, shadows, radius, transitions, typography) + `prefers-reduced-motion` block

## Phase 2: Shared Components (6 tasks, ~520 lines)

| Task | Component | Specs |
|------|-----------|-------|
| TASK-002 | LoadingSpinnerComponent | UX-SPEC-011 | ✅ |
| TASK-003 | EmptyStateComponent | UX-SPEC-012 | ✅ |
| TASK-004 | ErrorBannerComponent | UX-SPEC-013 | ✅ |
| TASK-005 | SkipLinkComponent | UX-SPEC-016 | ✅ |
| TASK-006 | FocusTrapDirective | UX-SPEC-009, UX-SPEC-022 | ✅ |
| TASK-007 | i18n keys (en.json + es.json) | UX-SPEC-024 | ✅ |

## Phase 3: CSS Migration (13 tasks, ~1180 lines)

| Task | What | Specs |
|------|------|-------|
| TASK-008 | Card Design System CSS | UX-SPEC-002 |
| TASK-009 | Button System CSS | UX-SPEC-003 |
| TASK-010 | Micro-interactions CSS | UX-SPEC-004, 006, 008 |
| TASK-011 | Hero Section Fixes (h1 + CTA) | UX-SPEC-005 |
| TASK-012 | Typography + Heading Hierarchy | UX-SPEC-007, 020 |
| TASK-013 | Responsive Fixes (aspect-ratio + tables) | UX-SPEC-010 |
| TASK-014 | EventCard CSS Migration | UX-SPEC-002, 018 |
| TASK-015 | CategoriesCard CSS Migration | UX-SPEC-002, 018 |
| TASK-016 | FeaturedEvent CSS Migration | UX-SPEC-002, 018 |
| TASK-017 | ARIA Labels Batch (47 elements) | UX-SPEC-017 |
| TASK-018 | Form UX Standardization (12 inputs) | UX-SPEC-014, 019 |
| TASK-019 | Pagination Styling | UX-SPEC-015 |
| TASK-020 | Color Contrast Fixes | UX-SPEC-023 |

## Phase 4: Component Integration (7 tasks, ~380 lines)

| Task | What | Specs |
|------|------|-------|
| TASK-021 | Modal Standardization (6 modals) | UX-SPEC-009, 022 |
| TASK-022 | Replace Inline Spinners | UX-SPEC-011 |
| TASK-023 | Replace Empty State Divs | UX-SPEC-012 |
| TASK-024 | Replace Error Banners | UX-SPEC-013 |
| TASK-025 | Insert SkipLink in App Shell | UX-SPEC-016 |
| TASK-026 | Apply FocusTrap to Modals | UX-SPEC-022 |
| TASK-027 | Main Content ID + Global Focus Styles | UX-SPEC-022, 016 |

## Dependency Graph
```
Phase 1:  TASK-001 (foundation)
Phase 2:  TASK-007 → TASK-002,003,004,005 (parallel after i18n)
          TASK-006 (independent)
Phase 3:  TASK-008,009,010,012,013,020 → depend on TASK-001 (parallel)
          TASK-011 → depends on TASK-001,009
          TASK-014,015,016 → depend on TASK-008
          TASK-017 → depends on TASK-007
          TASK-018 → depends on TASK-001,007
          TASK-019 → depends on TASK-001,017
Phase 4:  TASK-021 → depends on TASK-006,009,010
          TASK-022 → depends on TASK-002,007
          TASK-023 → depends on TASK-003,007
          TASK-024 → depends on TASK-004,007
          TASK-025 → depends on TASK-005
          TASK-026 → depends on TASK-006
          TASK-027 → depends on TASK-001,025
```
