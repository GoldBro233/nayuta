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

## Validation Results

- `bun run format:check`: passed.
- `bun run check`: passed; existing Zod deprecation warnings in `src/content.config.ts`.
- `bun run build`: passed, 17 pages; existing MDX directive warnings.
- `bun run test`: 91 passed, 2 failed in the `PostList` browser fixture at 390px (`Selector restores numbers when space returns`). The same two tests fail on unchanged `main` with `--test-name-pattern 390px`; that fixture renders `Frame` with `withLeftSidebar={false}` and never mounts this widget. Leave the unrelated pagination code unchanged for this review.
- Live build preview at `127.0.0.1:4322`: verified ordering and no horizontal overflow at 1440px, 820px, and 390px; mobile drawer opens and shows the field above Recent Posts. Verified input focus, typing, Enter with unchanged URL and no results; injected the existing sakura-pink tokens in the browser to check alternate colors without changing project files.

## Progress

- [x] Read repository guidance; confirmed clean `main` and created the requested worktree/branch.
- [x] Committed this plan alone as `c2958c3`.
- [x] Implemented the labeled, editable placeholder and inserted it before both left widget slots.
- [x] Ran planned checks and inspected desktop, tablet, mobile, and alternate theme views; documented pre-existing test failures above.
- [x] Committed widget/frame as `f2f5d43` and pushed the feature branch.
- [ ] Push the validation record and prepare a Draft PR for user acceptance.

Next action: commit and push this validation record, open a Draft PR, and request visual review before any Pagefind work.
