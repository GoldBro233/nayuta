# Content page layouts

## Approval and workspace

- Approved by the user on 2026-09-20 after the revised design discussion.
- Base: `main` (`6aedba6`). Branch: `feat/content-page-layouts`.
- Worktree: `.worktree/content-page-layouts/`.
- Work through commits, pushes, validation and a Draft PR; retain this plan until
  the user approves promotion. Do not merge.

## Goal and scope

Let authors customize the homepage, standalone pages and sidebars from
`src/content/`, with static HTML and existing Astro components. No new dependencies
or client framework. Preserve existing article/page URLs and responsive layouts.

- Homepage: `src/content/index.md`, `index.mdx` or `index.astro` (one entry).
- Pages: recursively discover Markdown, MDX and Astro under `content/pages`;
  directory `index` entries map to their directory URL.
- Posts remain Markdown/MDX, including folder bundles.
- Exclude `assets` directories and underscore-prefixed files/directories from routes.
- Resolve each sidebar independently: entry's directory, then `content/` root.
  Do not walk intermediate ancestors. System pages use root sidebars.
- Ordinary pages have no right region without a right component. Article detail
  always shows the TOC before the selected optional right component.
- Keep profile/footer owned by the frame and preserve explicit layout opt-outs;
  article TOC cannot be disabled with the optional right content.
- System routes win over content routes, with a diagnostic and successful build.
  Duplicate author-defined URLs are errors.
- Astro pages export `page` metadata and supply body content. The theme supplies
  the layout. Markdown/MDX collections and Astro imports share metadata validation.
- Migrate the homepage, default left widgets and legacy `rightWidgets` contract.

## Steps and affected files

1. **Content entries and routing**: `src/content.config.ts`, `src/pages/index.astro`,
   `src/pages/[...slug].astro`, shared page types/helpers as needed, and
   `src/content/index.mdx`. Add validated Astro entries, exclusion rules and
   duplicate diagnostics. Keep the native system route precedence.
2. **Sidebar layout**: shared content frame, `src/layouts/frame.astro`,
   `src/templates/*`, post detail/archive, tag archive, 404 and root `_left.astro`.
   Add independent fallback and the mandatory post TOC. Keep accessible drawers.
3. **Documentation and regression coverage**: README, `docs/agents/design.md`,
   isolated content/layout fixtures and existing tests affected by migration.
4. **Delivery**: push coherent commits, run planned checks, fix any failures,
   record results, push the final revision and open a Draft PR against `main`.

## Validation and acceptance

- Targeted integration tests build isolated sites and exercise homepage formats,
  nested Markdown/MDX/Astro pages, asset exclusions, duplicate entries, native
  system priority, sidebar fallback/overrides and post TOC ordering.
- `bun run test`, `bun run check`, `bun run build`, `bun run format:check`.
- Browser checks at phone/tablet/desktop widths in light/dark themes: sidebar
  controls, keyboard focus/Escape, no overflow, custom sidebar content and TOC.
- No new dependencies. Full validation is run after pushing implementation;
  targeted disposable experiments can guide implementation.

## Decisions and risks

- `.astra` was a typo for `.astro`.
- Astro support covers homepage and standalone pages, not post bodies.
- `assets/` and underscore names become reserved for non-route content.
- Legacy right-widget arrays migrate to authored `_right.astro` components.
- Root homepage is authoritative; system dispatcher remains inside `src/pages`.
- Shared layout code is needed across several consumers; no subagents are needed.
- Existing upstream MDX directive warnings may remain; report actual check output.

## Progress

- [x] Repository and toolchain inspected; design validated in disposable fixtures.
- [x] User approved the revised plan; isolated branch and worktree created.
- [x] Content entries and routing implemented.
- [x] Sidebar fallback and post TOC implemented.
- [x] Migration, documentation and regression tests completed.
- [x] Implementation pushed; planned checks completed, with one reproduced baseline
      failure on the local filesystem (details below).
- [x] Draft PR opened for user review: https://github.com/yuanzui-cf/nayuta/pull/13

Content IDs for Markdown pages now retain their source extension and the `pages/` prefix,
so duplicate source formats remain visible to URL validation. Public page URLs
follow the filename path (or an explicit `slug`); existing authored URLs are unchanged.

Next action: await user review of Draft PR #13. Retain this plan until the user
approves promotion; do not merge.

The frame now labels custom right content separately from the TOC, keeps closed
drawers inert, traps keyboard focus while open and restores focus on close.
Sidebar visibility falls back to normal document flow when JavaScript is absent.

## Validation log

- Initial type check found the Astro 7 `ComponentProps` import in `astro/types`;
  corrected the import. Follow-up `bun run check`: passed (one schema API hint).
- An initial simultaneous check/build collided on Astro generated cache writes.
  Run Astro commands sequentially in each checkout from now on.

- Production site build passed. First focused regression run: 17 passed, 5 failed.
  Four browser cases omitted the Enter character event; the development archive
  assertion expected page-two content on page one. Corrected those test inputs.
  Light-theme checks now use an actual light fixture palette; bundled palettes
  are dark variants.

- All 21 build-output and browser cases passed in the previous focused run.
- Visually inspected phone/light and desktop/dark screenshots: custom layout,
  typography and sidebar controls fit their viewports without overflow.
- User clarified that tests should verify build output, not framework HMR.
  Removed the development hot-reload test and the unnecessary refresh integration.
  Final validation covers the theme's generated content and presentation only.

## Final validation (2026-09-21)

Implementation revision: `41e43a8` (pushed before checks).

- `bun run test tests/content/pages.test.ts`: 21 passed, 0 failed; includes all six
  browser viewport/theme cases against built HTML.
- `bun run test`: 113 passed, 1 failed. The existing tag archive fixture emits
  `/tag/Astro` and `/tag/astro`; this macOS filesystem is case-insensitive, so one
  output overwrites the other. Running the unchanged `main` (`6aedba6`) tag suite
  in a disposable copy reproduces the identical assertion (13 passed, 1 failed).
  This baseline limitation remains outside the feature scope; the full suite is
  not reported as passing.
- `bun run check`: passed, 0 errors, 0 warnings, 0 hints.
- `bun run build`: passed, 17 pages; existing upstream MDX directive warnings only.
- `bun run format:check`: passed.
- `git diff --check main`: passed. Final diff reviewed; no dependency changes or
  custom development-refresh code remains.

## Review addition: demonstration content (2026-09-21)

User requested several demonstration pages and conversion of one existing article
into a folder bundle, with no tests and direct submission.

- Added `/demo` as an index linked from the homepage, plus Markdown, nested MDX,
  and Astro examples showing default sidebars and independent local overrides.
- Included a colocated SVG and a shared text asset; authored underscore helpers
  provide reusable demo navigation without generating routes.
- Moved the existing typography article into `typography-test/index.mdx`, keeping
  its body and URL, and added local left/right components to demonstrate article
  sidebars and the mandatory TOC above the extra right content.
- Updated the README demo list and the typography source reference.
- Per the user's instruction, did not run tests, type checks, builds, or browser
  checks for this content-only revision. Applied repository formatting only.
- Delivery: examples belong to the existing Draft PR #13. Next action after
  submission: await user review.

## Approved review: template contracts (2026-09-21)

The user approved this revision in the current session. Reuse the same branch,
worktree and Draft PR #13.

1. Move `ContentPage.astro` into `src/layouts/widgets/` and update both routes.
   Define shared header, entry and template prop types in `src/types/template.ts`.
   Templates accept a lowercase `content` prop and alias it to `Content` when
   rendering an Astro component.
2. Keep common page metadata validation and unknown-field preservation in
   `src/content.config.ts`. Move `friends`, `categories` and `mySite` validation
   into `FriendTemplate.astro`; infer its header types from the local schema,
   preserve defaults and pass normalized entry data to the frame and body.
   Invalid template metadata must report its source file and field path.
3. Update README and design guidance. Add meaningful build regressions for valid,
   defaulted and invalid template metadata, including Markdown/MDX and Astro.
4. Commit and push the changes, then run the targeted content tests,
   `bun run check`, `bun run build` and `bun run format:check` sequentially.
   Inspect existing homepage, ordinary and friend pages, including mobile and
   tablet layouts. Record results, push updates and request review on Draft #13.

Acceptance: no stale dispatcher imports; both templates use one prop contract;
template-specific data remains unknown until parsed by its owning template;
existing valid pages render successfully and invalid fields identify their source.
No new dependencies or subagents are needed.

Validation timing changes intentionally: content synchronization validates common
metadata, while template-specific validation runs when that template renders.
Static builds fail on invalid rendered template data. Template schemas belong in
their owning components; collection loaders and common schemas remain centralized.

- [x] Revised design approved; existing workspace and PR inspected.
- [x] Shared types and dispatcher migration completed.
- [ ] Template validation, regression coverage and documentation completed.
- [ ] Pushed revision validated and Draft PR updated.

Next action: move template-specific validation and add build regressions.
