# UX Visual Overhaul — Delta Specification

## Phase A: Visual Polish

### UX-SPEC-001: CSS Custom Properties Architecture (P0)
Extract all hardcoded colors, shadows, spacing into `--cv-` prefixed CSS custom properties.
In `src/assets/css/design-tokens.css`, define: `--cv-accent`, `--cv-heading`, `--cv-text`, `--cv-text-muted`, `--cv-surface`, `--cv-surface-elevated`, `--cv-shadow-sm/md/lg`, `--cv-radius-sm/md/lg/xl/full`, `--cv-transition-fast/base/slow`.

### UX-SPEC-002: Card Design System (P0)
Unified `.cv-card` base with hover lift (`translateY(-4px)` + shadow transition), image overlay gradient, consistent badge positioning. Featured variant `.cv-card--featured`.

### UX-SPEC-003: Button Hierarchy (P0)
Three variants: `.cv-btn-primary` (accent fill), `.cv-btn-secondary` (outline), `.cv-btn-ghost` (text-only). All with focus ring, hover/active transitions, consistent padding and border-radius.

### UX-SPEC-004: Micro-interactions (P1)
CSS transitions on all interactive elements using `cubic-bezier(0.4, 0, 0.2, 1)`. Nav underline slide, card lift, button press scale-down, toast slide-in, modal entrance.

### UX-SPEC-005: Hero Section Fix (P0)
Main heading must be `<h1>`. CTA button uses primary variant with enhanced prominence.

### UX-SPEC-006: Navbar Animations (P1)
Smooth dropdown transitions, active state indicators, mobile menu slide-in/out animation.

### UX-SPEC-007: Typography Scale (P0)
Consistent h1-h6 sizes, line-heights, letter-spacing. Fix privacy-policy (heading hierarchy) and event-details.

### UX-SPEC-008: Toast Unification (P1)
z-index 1050, slide-in animation, consistent icon + message + dismiss.

### UX-SPEC-009: Modal Standardization (P0)
All modals get shared backdrop, focus trap, entrance animation. Standardize login, email-registration, confirm, reject-reason, promote-event, publisher-demotion.

### UX-SPEC-010: Responsive Fixes (P1)
Replace hardcoded heights with `aspect-ratio`/`min-height`. Add `table-responsive` wrappers.

---

## Phase B: State Consistency

### UX-SPEC-011: Loading State Component (P0)
New `LoadingSpinnerComponent` with animated spinner + contextual message. Replaces 3 inconsistent patterns.

### UX-SPEC-012: Empty State Component (P1)
New `EmptyStateComponent` with icon, message, optional CTA button.

### UX-SPEC-013: Error State Component (P1)
New `ErrorBannerComponent` with icon, message, retry/dismiss actions.

### UX-SPEC-014: Form UX Standardization (P1)
Consistent labels, validation icons, helper text, required indicators.

### UX-SPEC-015: Pagination Styling (P2)
Consistent hover, active, disabled states. aria-labels on all controls.

---

## Phase C: Accessibility Compliance

### UX-SPEC-016: Skip-to-Content Link (P0)
Visually hidden, appears on focus, jumps to main content.

### UX-SPEC-017: ARIA Labels (P0)
aria-label on all 47 unlabeled interactive elements.

### UX-SPEC-018: Semantic HTML (P0)
Replace clickable divs with `<a>` and `<button>` elements.

### UX-SPEC-019: Form Label Associations (P0)
Associate 12 orphan inputs with `<label for="...">`.

### UX-SPEC-020: Heading Hierarchy (P1)
Proper h1→h2→h3 flow on all pages. No skipped levels.

### UX-SPEC-021: prefers-reduced-motion (P1)
Media query disables animations for users who prefer reduced motion.

### UX-SPEC-022: Focus Management (P0)
Visible focus rings, logical tab order, focus trap in all modals.

### UX-SPEC-023: Color Contrast (P0)
All text meets 4.5:1 ratio. Fix 40% transparency secondary text.

---

## Cross-Cutting

### UX-SPEC-024: i18n Key Management (P0)
All new strings use ngx-translate. Keys in both en.json and es.json.

### UX-SPEC-025: No Layout-Breaking Changes (P0)
All modifications additive or style-only. Zero functional regression.

### UX-SPEC-026: Bootstrap 5 Utility Leverage (P2)
Use Bootstrap classes where possible. Custom CSS only for brand polish.
