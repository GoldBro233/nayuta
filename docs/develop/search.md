# Search

[< Development guide](index.md)

Nayuta uses Pagefind to search rendered article titles and bodies. The static
search route at `src/pages/search/index.astro` composes the same `Frame`, `Prose`,
and `PostList` used by archives. Results run through `PostList`'s dynamic API.

## Query and Navigation

The sidebar's `SearchWidget` is a native GET form with a labeled input named `q`.
It submits to `/search`. The search page trims surrounding query whitespace and
uses the result for its heading, document title, breadcrumbs, and sidebar inputs.
With a query, the heading is `Search: <query>` and breadcrumbs are
`Home > Posts > Search: <query>`. The document title adds the usual site title
suffix. An empty query displays `Search` and does not load Pagefind. A site with
no eligible posts also skips loading Pagefind and shows an empty first page.

| URL                           | Behavior                                           |
| ----------------------------- | -------------------------------------------------- |
| `/search?q=Astro`             | First page of matches.                             |
| `/search?q=Astro&page=`       | First page of matches.                             |
| `/search?q=Astro&page=2`      | Second page, if available.                         |
| `/search?q=Astro&page=0`      | Navigate to the 404 page.                          |
| `/search?q=Astro&page=999999` | Navigate to the 404 page when outside the results. |

Page numbers must consist of decimal digits and represent positive safe integers.
A missing or empty `page` defaults to 1. Empty result sets have one valid page.
`config.postsPerPage`, defaulting to 10, controls the page size.

Because this is a static site and the result count is determined in the browser,
query validation navigates to `/404.html` with `location.replace()`. It does not
change the HTTP status of the original static `/search` response. The search
shell includes `noindex` metadata.

## Result Delivery

The search custom element waits for `nayuta-post-list`, imports
`/pagefind/pagefind.js` when a nonempty query needs results, and retains the match
handles for the active query. It loads result details only for the requested page.
The returned relevance order is preserved.

Pagefind metadata supplies titles, dates, reading times, and draft badges. Its
marked excerpt is read in an inert template and converted to plain text plus
highlight ranges. `PostList` creates the visible summaries and `<mark>` elements;
no Pagefind HTML is inserted into live results. The list's public highlight API
also supports title ranges. See [Text highlights](components.md#text-highlights).

A `page-request` updates browser history and loads the requested slice. `popstate`
restores the query and page, and direct URLs work after refresh. Result delivery
sets `items`, `total`, and `currentPage` together, avoiding additional requests.
Sequence checks ignore obsolete responses after navigation or disconnection.
Listeners are removed when the custom element disconnects.

Loading and error announcements belong to `PostList`. Empty results and failed
requests provide a post archive link. A failed result batch clears results and
shows `Search is unavailable.` Without JavaScript, `PostList` supplies a message
and archive link; article pages and native sidebar forms remain usable.

## Astro Integration

`astro.config.ts` registers `src/integrations/pagefind/index.ts`. The package
scripts run `astro dev` and `astro build`; Pagefind generation belongs to the
integration lifecycle.

- **Build:** `astro:build:done` reads rendered HTML, selects
  `[data-pagefind-body]`, and writes the Pagefind bundle under `dist/pagefind/`.
  Generation errors fail the build. Deploy that directory with the site.
- **Development:** a development-only `/_pagefind/posts.json` endpoint lists
  eligible post URLs through `getPosts()`. After the server starts, the integration
  fetches the rendered articles and creates an in-memory bundle. `/pagefind/*`
  requests await that bundle and receive uncached assets.
- **Source updates:** adding, editing, or removing source files invalidates the
  development bundle. The next index request rebuilds it. Reload the search page
  to discard the browser's Pagefind module cache and see updated results.

Both modes index rendered article content and use the same metadata markers.
The post route omits `data-pagefind-body` for `exclude_in_search: true`. Production
routes omit drafts; development can search and label draft posts. Standalone
pages, archive pages, sidebars, tag controls, and copyright notices are not search
content. Even when every post is excluded, the integration produces a search
bundle. The development manifest is absent from the static build.

## Validation

`tests/components/search.test.ts` builds isolated content and checks real Pagefind
results in Chromium. It covers URL encoding, page slices, metadata, highlighting,
page bounds, history, focus, index failures, drafts, excluded posts, no-JavaScript
fallbacks, mobile drawers, palette colors, and responsive widths. A fresh dev
fixture checks index generation and article additions, edits, and removal without
a production build. `tests/fixtures/post-list.astro` also checks safe highlighted
text and rejected ranges alongside the shared dynamic list contract.

Run the repository's formatting, type checks, tests, and build as described in
[Contributing](../../CONTRIBUTING.md#checks-and-formatting). Browser checks require
Chromium or Chrome; report any skipped cases.
