# Proposal: ux-visual-overhaul

## Intent
Transform the CochaVive frontend into a visually stunning, cohesive, and delightful experience that makes users say "wow" on first entry, while simultaneously meeting WCAG 2.1 AA accessibility compliance. The visual overhaul prioritizes emotional impact — smooth micro-interactions, refined card designs, consistent loading states with personality, and a unified design system — treating accessibility as a natural byproduct of good visual structure, not a separate compliance pass.

## Scope

### Phase A - Visual Polish (highest visual impact)
- **CSS Custom Properties Architecture**: Extract all 15+ inline color-mix() declarations and hardcoded #f82249 accents into :root variables
- **Card Design System**: Unify event-card, featured-event, categories-card with consistent border-radius, hover lift effects, image overlay gradients, badge positioning
- **Button Hierarchy**: Standardize primary (accent fill), secondary (outline), ghost (text-only) variants
- **Micro-interactions**: Smooth transitions on all interactive elements — nav links, cards, buttons
- **Hero Section Redesign**: Fix heading hierarchy, improve CTA button prominence
- **Navbar Refinement**: Smooth dropdown transitions, active state indicators, mobile menu slide-in
- **Typography Scale**: Consistent heading sizes with proper hierarchy; fix privacy-policy and event-details
- **Toast Notification System**: Unify z-index, add slide-in animations
- **Modal Consistency**: Standardize all modal implementations with shared backdrop, focus trap, entrance animation
- **Responsive Polish**: Replace hardcoded heights with aspect-ratio/min-height; table-responsive wrappers

### Phase B - State Consistency (visual cohesion across flows)
- **Loading States**: Unified skeleton screens or animated spinners with contextual messages
- **Empty States**: Consistent empty state component with illustration/icon, friendly message, CTA
- **Error States**: Standardized error banners with icon, message, retry action
- **Form UX**: Consistent label positioning, validation feedback with icons, helper text styling
- **Pagination**: Consistent hover states, active indicator, disabled styling

### Phase C - Accessibility Compliance (built into visual refactor)
- **Skip-to-Content Link**: Visually hidden, appears on focus
- **ARIA Labels**: All 47 interactive elements without labels
- **Semantic HTML**: Replace clickable divs with proper `<a>` and `<button>` elements
- **Form Labels**: All orphan inputs associated with `<label for="...">` elements
- **Heading Hierarchy**: Proper h1→h2→h3 flow on all pages
- **prefers-reduced-motion**: Media query for animation reduction
- **Focus Management**: Visible focus rings, logical tab order, focus trap in modals
- **Color Contrast**: All text meets 4.5:1 ratio minimum

## Approach
1. Design token extraction (CSS custom properties)
2. Shared state components (loading-spinner, empty-state, error-banner)
3. Progressive page-by-page enhancement starting with highest-traffic pages
4. Bootstrap 5 utility leverage, minimal custom CSS
5. CSS-only animations (transform/opacity GPU-accelerated)
6. Manual visual regression + axe DevTools for accessibility
7. All new strings via ngx-translate

## Risks
- Regression on less-tested admin pages
- i18n key proliferation
- Responsive breakage on extreme viewports
- Animation performance on low-end devices
- Modal focus trap complexity
- Bootstrap variable conflicts (mitigated with --cv- prefix)

## Estimated Impact
- Files touched: ~45
- New files: 8
- Lines changed: ~2500-3000
- Lines added: ~800

## Dependencies
- No backend dependencies
- ngx-translate keys for en.json and es.json
- No new packages needed (all tools already installed)
