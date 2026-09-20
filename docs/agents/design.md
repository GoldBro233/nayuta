# Design

This document is an agent's guide to the Nayuta theme. It describes how the
design tokens, layout, typography, components, and content fit together so new
features remain consistent with existing styles.

## System Design

### Design Tokens

All colors, sizing, spacing, borders, shadows, transitions, and z-indices are
defined in `src/assets/styles/themes/nayuta.css` under the `--ny-*` namespace.

Token rules:

- Do not hard-code hex colors, pixel values, box shadows, or transition timings
  in component styles when a token exists.
- The base tokens in `nayuta.css` define the fallback design contract. Theme
  stylesheets (`nayuta-aqua.css`, `midnight-blue.css`, `sakura-pink.css`,
  `oled-dark.css`) override color variables without changing the token names.
- When introducing a new component or style, reuse existing tokens:
  - Text colors: `--ny-color-text`, `--ny-color-text-muted`, `--ny-color-text-subtle`
  - Backgrounds: `--ny-color-bg`, `--ny-color-surface`, `--ny-color-surface-container`, `--ny-color-surface-elevated`
  - Primary / accent: `--ny-color-primary`, `--ny-color-primary-hover`, `--ny-color-primary-active`, `--ny-color-outline`
  - Borders: `--ny-color-border`
  - Spacing: `--ny-space-1` through `--ny-space-10`
  - Border radius: `--ny-radius-sm`, `--ny-radius-md`, `--ny-radius-lg`
  - Shadows: `--ny-shadow-sm`, `--ny-shadow-md`, `--ny-shadow-lg`
  - Transitions: `--ny-transition-fast`, `--ny-transition-normal`
  - Typography: `--ny-font-family-base`, `--ny-font-family-heading`, `--ny-font-family-code`, `--ny-font-size-*`, `--ny-line-height-*`

### Layout Architecture

The site uses a responsive two-column grid (`frame.astro`) that adapts across
four responsive stages:

1. **Desktop with TOC / right sidebar** (`> 1200px`):
   - Left region (fixed width: `--ny-width-left-sidebar`, default `300px`): profile card, widgets, footer.
   - Main region (flex-grow): breadcrumbs, article/page content.
   - Right region (fixed width: `--ny-width-right-sidebar`, default `260px`): table of contents or context widgets.
2. **Standard desktop** (`901px - 1200px`):
   - Left region: visible.
   - Main region: visible.
   - Right region: hidden from grid, accessible via floating action button (FAB) + off-canvas drawer.
3. **Tablet** (`641px - 900px`):
   - Single-column layout.
   - Left sidebar content moves to an off-canvas drawer opened via mobile sticky header.
   - Main region takes full container width.
4. **Mobile** (`<= 640px`):
   - Single column with compact spacing and padding.
   - Fixed sticky top header provides quick navigation and sidebar drawer toggle.
   - Profile card collapses to compact horizontal layout.
   - Left-sidebar footer moves below main content into a `.mobile-footer`.

Layout rules:

- All pages must be wrapped in `frame.astro`.
- `frame.astro` shows the profile card in the left sidebar by default. Pass
  `withProfileCard={false}` to omit it on a page, or `withLeftSidebar={false}` to
  remove the entire left region.
- Content in the main region must use `Prose.astro` or have `.prose` class
  to inherit typography styles.
- Avoid introducing independent sidebar drawer containers or fixed headers in
  individual page templates. The canonical drawers (`#widgets-drawer`,
  `#context-drawer`) and sticky header live in `frame.astro`.
- Responsive breakpoint variables `--ny-breakpoint-tablet` (`900px`) and
  `--ny-breakpoint-mobile` (`640px`) guide media queries.

### Layout and Widget Boundaries

- `src/layouts/` owns page structure and UI embedded directly by routes and
  templates. Small reusable UI pieces such as `Prose`, `Pagination`, `Avatar`,
  and `Button` live in `src/layouts/components/`.
- `src/layouts/widgets/` contains composed theme UI used by layouts, routes,
  and templates. `ProfileCard.astro` lives here because it combines the author
  identity and navigation; shared post lists live in the `post-list/` subdirectory.
- `src/widgets/sidebar/` contains widgets usable in the left or right sidebar,
  including `RecentPosts`, `TagCloud`, `WebsiteStatus`, `TableOfContents`, and
  their composition helpers. They retain this role when responsive layouts
  place sidebar content in drawers.
- `src/widgets/article/` contains components authored into MDX, including
  `Callout` and `TableContainer`. Keep article-specific public imports here.
- `src/assets/styles/` contains global CSS and themes. Keep local client
  enhancements in their owning `.astro` files; extract scripts into
  `src/assets/scripts/` only when multiple consumers need them. Shared
  build-time/browser logic remains in `src/utils/`.

### Import Paths

Use the aliases in `tsconfig.json` for module imports within `src/`, including
Astro frontmatter, component scripts, TypeScript, MDX, and stylesheet imports.
Prefer the matching directory alias: `@assets/`, `@layouts/`, `@pages/`,
`@templates/`, `@type/`, or `@widgets/`. Use `~/` for other source modules,
such as `~/config`. This also applies to imports from the same directory.

Content-loader filesystem paths and browser URLs follow their own APIs; they
are not resolved through TypeScript aliases.

### Component Design Principles

- **No CSS framework dependencies**: Components are built with vanilla CSS
  scoped inside Astro `<style>` blocks. Do not add Tailwind, UnoCSS, or other
  utility frameworks.
- **Progressive Enhancement**: All content must be readable without JavaScript.
  Drawer toggles, theme switching, running counters, and copy buttons enhance
  the experience but must not break layout or hide content when scripts fail.
- **Accessible markup**: Use semantic elements (`<nav>`, `<aside>`, `<main>`,
  `<header>`, `<footer>`, `<article>`). Ensure buttons have descriptive
  `aria-label`s and interactive elements have appropriate ARIA attributes.
- **Theme-switch compatibility**: All components must look correct under both
  light and dark variants of any theme stylesheet. Always use `--ny-color-*`
  tokens rather than assumption-based colors.

### Icons

- The theme bundles Font Awesome 6 via CDN in `head-base.astro`.
- For component icons, use SVG with `fill="currentColor"` or Font Awesome
  classes (`<i class="fa-solid fa-..."></i>`).
- Profile / friend links support both icon strings and raw SVG paths in their
  config data.

### Typography

Reading text across posts and pages scales with the viewport through the prose
tokens in `src/assets/styles/themes/nayuta.css`. The scale keeps a stable hierarchy:

- Large article title: `--ny-font-size-title` (`2rem` - `2.375rem`), tight line
  height `--ny-line-height-heading`.
- Section headings:
  - `h1`: `--ny-font-size-h1` (`1.625rem` - `1.875rem`)
  - `h2`: `--ny-font-size-h2` (`1.375rem` - `1.5rem`)
  - `h3`: `--ny-font-size-h3` (`1.125rem` - `1.2rem`)
  - `h4`: `--ny-font-size-h4` (`1rem` - `1.0625rem`)
  - `h5` / `h6`: `--ny-font-size-prose` with uppercase / muted treatment.
- Body paragraphs and lists: `--ny-font-size-prose` (`1.0625rem` - `1.125rem`)
  with comfortable line height `--ny-line-height-prose` (`1.85`).
- Secondary UI, metadata, and breadcrumbs: `--ny-font-size-ui` (`0.875rem`),
  `--ny-font-size-meta` (`0.8125rem`), and `--ny-font-size-ui-micro` (`0.6875rem`).
- Code blocks and inline code: `--ny-font-size-code` (`0.875rem`),
  `--ny-font-family-code`, line height `--ny-line-height-code` (`1.65`).

When modifying `src/layouts/components/Prose.astro` or markdown rules, preserve body
readability. Avoid loose line heights below `1.7` on long-form paragraphs, and
keep section headings clearly separated with `margin-top: 1.8em` and a small
gap below them. Inline elements (`a`, `strong`, `code`, `mark`) inherit the
surrounding font-size; only specialized blocks (blockquotes, tables, figure
captions) may introduce subtle sizing variations.

Verify typography against `src/content/posts/typography-test.mdx`, which exercises
lists, nested quotes, tables, code, media, and callouts at desktop and mobile
widths. Also check post summaries and the friends template when adjusting the
shared typography scale. Prose tables and code blocks scroll horizontally
within the reading region when their contents are wider than the viewport.

### Content

`src/content/*` contains authored Markdown/MDX pages, posts, and their colocated
assets. It is reserved for final content; theme TypeScript modules do not belong
there. Content schemas and collection loaders belong in `src/content.config.ts`.

Current content collections:

- `posts`: Markdown/MDX blog posts with title, publishDate, cover,
  description, draft flag, and optional tags.
- `pages`: Markdown/MDX standalone pages supporting customizable templates,
  breadcrumbs, widget slots, and structured friend metadata.

Post `draft` is a boolean defaulting to `false`. Draft posts (`draft: true`) are
completely excluded during production builds (`astro build` / `import.meta.env.PROD`),
emitting no static HTML files or routes, and omitting draft-only tags and metadata from
listings, widgets, and status counters. In development mode (`astro dev`), drafts
remain accessible for author preview, decorated with a `Draft` badge (`Badge` variant `"draft"`).
Centralized querying is provided by `getPosts()` in `src/utils/posts.ts`.

Post `tags` is a string array defaulting to `[]`. The schema trims names, rejects
blank values, and removes duplicates while retaining author order. Names remain
case-sensitive. The post reader renders tag links after the body, outside prose
styling, and omits the tag bar when empty. `/tag/<name>` statically paginates
matching posts, using `PostList` for shared presentation. Tag-cloud
queries and archive grouping remain in their consuming `.astro` frontmatter.
URLs encode tag names, including Chinese text and spaces; display labels retain
their original text. Friend-card tags do not participate in post archives.

Post and tag archives use `[...page].astro` routes and `paginateList()` around
Astro's native `paginate()`. Page one keeps `/posts` or `/tag/<name>`; later pages
use `/posts/page/2` and `/tag/<name>/page/2`. `config.postsPerPage` is a positive
integer; omitting it defaults to 10. Apply visibility filtering and
`sortPosts()` before pagination, never after slicing; equal dates are ordered
by content ID.
Tag archives group the sorted posts in one pass before paginating each group.

`PostList.astro` and `PostListItem.astro` live in `src/layouts/widgets/post-list/`.
Consumers can import `PostList` from `@layouts/widgets/post-list/PostList.astro`.
`PostList` renders a light-DOM `<nayuta-post-list>` custom element with two modes.
The default static mode takes `page: Page<CollectionEntry<'posts'>>` and renders
only `page.data`, including reading-time preparation. Its complete HTML and
ordinary links work without JavaScript. Dynamic mode uses
`<PostList mode="dynamic" id="search-results" pageSize={10} />`; `pageSize`
defaults to `config.postsPerPage`, then 10. The host owns its state, event
listeners, status messages and DOM updates. `PostListItem.astro` supplies the
same summary markup and scoped CSS for static articles and one inert dynamic
`<template>`. Clones retain Astro's scope attributes, including the draft badge.
Keep only the current page's summaries in the rendered list.

Both modes include the reusable `Pagination` component. Static links follow
the shared archive-root and `/page/<number>` convention. Dynamic links update
`?page=<number>` while retaining search terms, other parameters and fragments.
Other list types can reuse `paginateList()` and `Pagination` without
post-specific presentation.
Pagination emits at most five page numbers plus gaps and previous/next controls.
Use the same plain-text bracket styling as the draft badge and drawer close
control: `[prev] 1 [2] 3 4 5 [next]`. The current page is bracketed and bold;
other numbers and previous/next links use regular weight. Omit previous on the
first page and next on the last page. Keep the controls compact and inline,
using theme text colors, with no filled backgrounds or decorative borders.
Align the whole selector to the left. A native `ResizeObserver` checks the
selector's available width and hides the middle page-number group when it
does not fit, retaining the available previous/next links. Recheck after fonts
load and restore numbers when space returns. Without JavaScript, keep all
links usable with wrapping as the fallback.
Single-page/empty lists hide the selector, and an empty post list shows
`No posts yet.`. Out-of-range page numbers have no generated route. Keep
browser payloads bounded to the current page; never ship
the entire collection for client-side hiding. Total static build cost still
depends on the number of posts and archive pages.

The `<nayuta-pagination>` custom element owns width adaptation and, in dynamic
mode, the selector's state and rendering. `connectedCallback()` creates the observer for that
instance, and `disconnectedCallback()` releases it when the element is removed.
This keeps multiple selectors independent and makes setup and cleanup follow
DOM insertion/removal without a document-wide initialization registry. Ordinary
scripts could implement the same behavior; the custom element packages that
lifecycle locally and is not required by Astro's pagination API.

Measure the selector's actual content and available width because sidebar
layouts, font metrics, and the number of digits can change whether it fits at
the same viewport size. When hiding the numbered links, move keyboard focus to
an available previous/next link if needed. The custom element uses the light
DOM: Astro generates static navigation at build time, while dynamic navigation
clones scoped control templates. Dynamic `setPage()` merges a partial
`{ currentPage, lastPage, firstPageUrl }` update and recalculates width even when
the container itself did not resize. There is no Shadow DOM, framework
hydration, or additional dependency. Theme tokens and scoped Astro styles continue to apply normally,
and native link navigation remains usable when the enhancement cannot run.

Static route pagination keeps each response limited to the requested page and
makes the URL authoritative through normal browser navigation. This avoids
shipping the full collection to implement display-only pagination. The shared
`paginateList()` data contract allows reuse across archives, while each route
still owns its query and static path generation.

`bun run test` covers tag validation, draft handling, and generated article,
archive, and tag-cloud HTML using temporary content in an isolated copy of the
site. Test fixtures do not modify authored content.
Pagination coverage includes page boundaries, stable ordering, tag URL encoding,
empty/single-page archives, draft exclusion, and selected pages from 100,000
numeric entries. The last check exercises slicing and bounded controls; it is
not a benchmark for building 100,000 authored posts.

### Dynamic PostList API

Wait for `customElements.whenDefined('nayuta-post-list')` before calling instance
methods. `src/types/post-list.ts` defines the browser data contract and typed
custom-element/event maps. `setPage(update: Partial<PostListPage>)` merges only
provided values; omitted or `undefined` fields retain their values. Its fields
are `items`, `total`, `currentPage`, and `pageSize`. Initially these are `[]`, `0`,
`1`, and the configured page size. `total` must be a non-negative safe integer;
`pageSize` must be a positive safe integer. Invalid page numbers normalize to 1,
and numbers beyond the known total clamp to the last page (at least 1).
Initialize the result total before requesting another page.

```ts
await customElements.whenDefined('nayuta-post-list');
const list = document.querySelector('nayuta-post-list');

// Initial result: pass the current page's summaries and pagination metadata.
list?.setPage({ items: firstPageItems, total: 42, pageSize: 10 });

// Retain total, pageSize and article nodes; request page two and show loading.
list?.setPage({ currentPage: 2 });

// Complete the request without resending pagination metadata.
list?.setPage({ items: secondPageItems });

// Explicitly clear results; an omitted items field never clears the list.
list?.setPage({ total: 0, items: [] });
```

A page-number/page-size change without `items` dispatches a bubbling
`page-request` event with `{ currentPage, pageSize, href }` and sets `aria-busy`
on the retained results. Normal dynamic pagination clicks call the same method.
Modified clicks keep native link behavior. An update containing `items` is a
result delivery: it replaces the summary nodes, ends loading, clears errors,
and does not emit another request. Metadata-only changes preserve the item DOM;
`{}` is a no-op except refreshing links if the surrounding URL has changed.
`setLoading(boolean)` and `setError(message)` support the page's async workflow;
`setError()` clears an error. Loading, failures and empty results are visible,
while successful counts are announced without changing the summary layout.
Keyboard pagination focuses the result after delivery. Listeners and resize
observers are cleaned up on disconnection and restored on reconnection.

The consuming search page owns the search index/query, slicing, URL history,
initial query parsing and `popstate`. Listen for `page-request`, update the URL,
obtain that page's results, and call `setPage({ items })`. For a new search or
history navigation, supply `items`, the result `total` and `currentPage`
together; this avoids request loops. The caller must cancel or ignore stale
async results when requests overlap. The component does not fetch data or
cache all pages. A static search shell must include the rendered no-JavaScript
message and archive link; authored articles remain available as static pages.

Each item has `href`, `title`, `publishDate`, `readingTimeMinutes`, optional
`description`/`draft`, and optional `cover: { src, width?, height?, srcset?, sizes? }`.
Use `getPosts()` to filter production drafts before publishing any search data.
Prepare reading time with the existing remark pipeline. For local covers,
prepare deployable image URLs/attributes using `astro:assets` at build time;
the browser does not call `render()` or resolve collection image metadata.
Dynamic summaries use text nodes for text fields and HTTP(S)/relative URLs for
links and image sources. Static summaries retain Astro's `Image` handling.

`tests/components/post-list.test.ts` builds its fixtures outside the repository and runs
real-browser checks using an installed Chromium/Chrome (or `CHROME_BIN`). Browser
checks explicitly skip if no browser is available; build and utility checks
still run. Coverage includes partial updates, DOM preservation, query URLs,
multiple instances, reconnects, focus, error/empty states, browser history, and
static/dynamic style parity at mobile, tablet and desktop widths in both themes.

### Shared Theme Utilities

Keep logic specific to a page, component, widget, or layout in that `.astro`
file. Its frontmatter should own its queries, sorting, and display preparation.
Extract a module into `src/utils/*` only when multiple consumers actually share
identical calculation or data normalization.

Current shared utilities:

- `src/utils/reading-time.ts`:
  - `remarkReadingTime`: unified plugin for the Markdown/MDX processor pipeline.
    Walks AST nodes, strips syntax, and counts words: CJK characters count
    individually (at 400 chars/min), and Latin/non-CJK whitespace-separated
    words count at 200 words/min. Injects `readingTimeMinutes` (positive integer)
    into file frontmatter.
  - `formatReadingTime`: standardizes the display string (e.g. `'1 min'`,
    `'5 mins'`). Always use this helper instead of formatting reading time
    ad-hoc in page or component templates.
- `src/utils/posts.ts`:
  - `isVisiblePost`: determines if a post is visible based on environment (`import.meta.env.PROD` vs dev mode) and `draft` status.
  - `getPosts`: queries all posts from `astro:content` and applies visibility filtering so production builds do not compile draft posts.
  - `sortPosts`: sorts posts by descending publish date, breaking ties by content ID.
- `src/utils/pagination.ts`:
  - `paginateList`: adapts Astro pagination for `[...page].astro` routes while retaining the archive's first URL and adding `/page/<number>` for later pages.
  - `getPageUrl`: shares the pagination URL convention between route generation and numbered navigation links.
  - `getQueryPageUrl`: updates query pagination while preserving the rest of the URL.
  - `getVisiblePages` / `normalizePageNumber`: shared bounded controls and page normalization for build-time and browser consumers.

---

## Technical Debt & Ongoing Issues

### Astro 5 Content Layer & MDX Directive Warnings

During `astro build`, Vite emits `MODULE_LEVEL_DIRECTIVE` warnings:

> The semantics of the module level directive "use astro:head-inject" in "src/content/.../file.mdx?astroPropagatedAssets" may not be preserved when bundling.

This is an upstream issue in `@astrojs/mdx` when used with Vite's bundling pipeline in Astro 5. It does not affect build correctness or output HTML. No action needed unless upstream provides a fix.

---

## Common Pitfalls & Agent Rules

- **Do not introduce heavy JS frameworks**: Nayuta is an Astro-native theme. Do not add React, Vue, or Svelte components unless explicitly requested by the user.
- **Preserve semantic markup & CSS variables**: Every custom element or layout modification must use `--ny-*` variables for colors, fonts, and dimensions.
- **Check mobile/responsive layouts**: Whenever a layout component is added or modified, verify how it looks on mobile screens (`<= 640px`) and tablet screens (`<= 900px`).
- **Follow lint and type checks**: Always run `bun run check` and `bun run build` before considering a task complete.
