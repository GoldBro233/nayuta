# Sidebar Search Widget Placeholder

- Branch: `feat/search-widget-sidebar`; base: `main` at `6aedba6`.
- Worktree: `.worktree/search-widget-sidebar/`.
- Approved scope (2026-09-20): show a search widget above Recent Posts for visual review only. Do not install or integrate Pagefind, create a search index, or claim searches work.

## Implementation

1. Reuse `SearchWidget.astro`, `Widget.astro`, and the existing input styles for a compact, labeled search field with a decorative search icon and theme-token styling. Keep it editable for preview, but do not attach a form, search action, result list, or external service.
2. Place the widget before the existing left-slot contents in both the desktop sidebar and mobile drawer in `frame.astro`. Preserve current Recent Posts and other widget ordering. Leave the optional right-sidebar `DynamicWidget` registration intact.
3. Keep markup accessible to keyboard and screen readers. Do not add a new UI dependency.

## Acceptance And Checks

- A titled Search Site widget precedes Recent Posts on the homepage, post pages, and content pages, both in the desktop sidebar and mobile drawer.
- The field fits its narrow sidebar, can receive focus and preview text, and has no submit or search behavior. Existing widgets and drawers remain usable.
- Run `bun run check`, `bun run test`, `bun run build`, and `bun run format:check`. Inspect a live page at desktop, tablet, and mobile widths, including the open mobile drawer, and verify an alternate theme if available.
- Push the branch, record final checks, and open a Draft PR for visual review. Stop before adding Pagefind or treating the placeholder as a finished search feature.

## Decisions And Risks

- Shared `frame.astro` placement avoids changing every route and uses the same sidebar ordering as Recent Posts. The frame renders its left content twice (desktop and drawer); both search fields must have an accessible label without duplicated IDs.
- The left region is scrollable. Another widget may push Tags Cloud below the visible height on shorter screens; check scrolling instead of changing global layout.
- One owner handles these small, coupled edits; subagents would not help.

## Progress

- [x] Read repository guidance; confirmed clean `main` and created the requested worktree/branch.
- [ ] Commit this plan alone.
- [ ] Implement the widget and placement.
- [ ] Run commands and inspect browser views.
- [ ] Push and prepare Draft PR for user acceptance.

Next action: commit the plan alone, then edit the widget and frame in the feature worktree.
