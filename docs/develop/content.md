# Content and Templates

[< Development guide](index.md)

Authored content lives in `src/content/`. Collection loaders and common schemas
live in [src/content.config.ts](../../src/content.config.ts); shared discovery and
rendering live in [pages.ts](../../src/assets/utils/pages.ts). Keep theme utilities
and shared types outside the content tree.

## Discovery and URLs

| Content          | Accepted files                                        | Route                                                                           |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| Homepage         | One `src/content/index.md`, `.mdx`, or `.astro`       | `/`                                                                             |
| Standalone pages | `.md`, `.mdx`, or `.astro` below `src/content/pages/` | Relative path, without extension or terminal `index`; optional `slug` override. |
| Posts            | `.md` or `.mdx` below `src/content/posts/`            | `/posts/<collection-id>`                                                        |

Markdown/MDX pages belong to the `pages` collection. Their IDs retain source
filenames and extensions so duplicate public URLs can be detected across formats.
Astro pages are discovered separately at build time and export a `page` metadata
object, validated with the same `pageSchema`.

`src/pages/index.astro` dispatches the homepage; `src/pages/[...slug].astro`
dispatches standalone pages. Their shared discovery logic keeps source identities
separate from public paths. Page paths retain filename case. A custom `slug` is a
relative URL path without a leading slash, query, fragment, backslash, or `.` / `..`
segments. It does not change asset or sidebar resolution.

Duplicate authored page URLs fail with both source paths. Native Astro system
routes take precedence when they emit the same URL, producing a build warning
for the ignored content route. This applies to actual generated URLs, not every
possible path below `/posts` or `/tag`. Preserve this distinction when changing
route validation.

Every content loader and Astro discovery glob excludes `assets/` directories
and underscore-prefixed files/directories. These resources remain importable but
do not receive routes. Files elsewhere directly under `src/content/` also do not
become entries. Put dynamic Astro route declarations in `src/pages/`.
Use `public/` for stable download URLs; content assets are processed through
Markdown, MDX, or Astro imports.

## Metadata and Templates

The common `pageSchema` validates `title`, `description`, `template`, `slug`,
`breadcrumbs`, and sidebar visibility switches. It uses `z.looseObject()` to
preserve additional fields as unknown until the selected template validates them.

[`src/layouts/template.astro`](../../src/layouts/template.astro) is the unified
template entry point. It resolves the page's template ID, parses template metadata,
prepares body content and headings, computes default breadcrumbs, and renders
`frame.astro` around the selected template. The same parsed `entry` reaches the
frame, sidebars, template, and authored body. Parsed fields are merged with common
metadata and unrelated custom fields, including defaults and schema transforms.

Templates receive `TemplateProps` from `@type/template`:

| Prop       | Meaning                                                               |
| ---------- | --------------------------------------------------------------------- |
| `entry`    | Source identity plus common and template-specific validated metadata. |
| `headings` | Markdown/MDX headings; an empty array for Astro-authored pages.       |
| `isHome`   | Whether this is the root homepage.                                    |

The authored body is provided through the default `<slot />`. Place it wherever
the template needs it, using `Prose` around reading content. Templates control
their title, body arrangement, and styles; the entry point handles the document
frame and forwards `entry` and `headings` to the body. Authored Astro pages also
supply body markup without a document shell or frame.

The shared type module owns `TemplateDefinition`, `TemplateSchema`, `TemplateHeader`,
and `PageEntry`. Use `TemplateProps<typeof schema>` to infer template field types
from a separately exported schema, including its defaults and transforms. Use
plain `TemplateProps` when there is no schema. Import schemas with `import type`
in components; deriving props directly from a definition that loads that same
component would create a circular type dependency.

### Registry and IDs

[`src/templates/registry.ts`](../../src/templates/registry.ts) exports the single
`templates` registration list and `getTemplate(id, source?)` / `listTemplates()`.
Each definition is created with `defineTemplate()` and owns a unique `id`, an
optional display `name` and `description`, an optional `schema`, and a `load`
function returning a dynamic import of its Astro component. IDs use lowercase
kebab-case, starting with a letter. Duplicate registrations fail immediately.

The bundled IDs are `default` and `friend`. Omitting page metadata's `template`
selects `default`; specifying an unknown ID fails with the source and available
IDs. This replaces the previous fallback for misspelled or unregistered IDs.

`listTemplates()` returns display metadata without loading components. Definitions
and the registry are ordinary TypeScript modules, so Bun tools can enumerate them
without an Astro build:

```sh
bun -e 'import { listTemplates } from "./src/templates/registry"; console.log(listTemplates());'
```

`getTemplate()` also exposes the schema and lazy loader. Only rendering calls
`load()`. Keep component imports inside that function, and keep the central
content configuration independent of template components and the registry.

### Adding a Template

Create `src/templates/projects/index.ts` with metadata and, if needed, a schema
for its extra fields:

```ts
import { z } from 'astro/zod';
import { defineTemplate } from '@templates/define';

export const schema = z.object({
  projects: z
    .array(z.object({ name: z.string(), href: z.string() }))
    .default([]),
});

export default defineTemplate({
  id: 'projects',
  name: 'Projects',
  description: 'A reading introduction followed by project links.',
  schema,
  load: () => import('@templates/projects/Template.astro'),
});
```

Define only template-specific fields in this schema; common fields are already
validated by `pageSchema`. No schema or additional field types are needed for a
template that only changes presentation.

Create `src/templates/projects/Template.astro`:

```astro
---
import type { schema } from '@templates/projects';
import type { TemplateProps } from '@type/template';
import Prose from '@layouts/components/Prose.astro';

type Props = TemplateProps<typeof schema>;
const { entry } = Astro.props;
---

<Prose>
  <h1>{entry.data.title}</h1>
  <slot />
</Prose>

<ul>
  {
    entry.data.projects.map((project) => (
      <li>
        <a href={project.href}>{project.name}</a>
      </li>
    ))
  }
</ul>
```

Import the definition into `registry.ts` and append it to `templates`:

```ts
import projectsTemplate from '@templates/projects';

export const templates = [
  defaultTemplate,
  friendTemplate,
  projectsTemplate,
] as const;
```

Use it in any homepage or standalone page, for example
`src/content/pages/projects.mdx`:

```mdx
---
title: Projects
template: projects
projects:
  - name: Nayuta
    href: https://github.com/yuanzui-cf/nayuta
---

An introduction to my projects.
```

Astro-authored pages select the same ID and fields through their exported `page`
object. The bundled [default](../../src/templates/default/Template.astro) and
[friend](../../src/templates/friend/Template.astro) components provide further
examples. The friend definition validates `friends`, `categories`, and `mySite`,
defaulting omitted `friends` to an empty array.

Common metadata is checked during collection synchronization or Astro page
discovery. Template metadata is checked during rendering; failures include the
source file and field paths. `bun run check` alone cannot validate every custom
field. A static build is required when changing template schemas or content that
uses them.

## Sidebars

`frame.astro` resolves each side independently:

1. Use `_left.astro` or `_right.astro` beside the content source file, if present.
2. Otherwise use the matching file at `src/content/`.

Intermediate ancestor directories are not searched. Content in the same directory
shares local sidebars; folder bundles allow per-page overrides. Source paths,
not public slugs, choose the sidebar. System archive and 404 pages use root
defaults. The default left widgets are authored in `src/content/_left.astro`;
routes do not supply a hard-coded widget fallback.

Sidebar props are `entry`, `headings`, and `pathname`. `entry` is absent for system
pages, so use optional access. Match active navigation against `pathname`, not a
collection ID. Components render in both desktop regions and drawers; avoid fixed
IDs and scope browser behavior to each instance.

Articles always show the table of contents first, then optional right content.
Ordinary pages omit the right region when no right component exists.

| Metadata switch           | Behavior                                              |
| ------------------------- | ----------------------------------------------------- |
| `withLeftSidebar: false`  | Hide the entire left region.                          |
| `withProfileCard: false`  | Hide the profile while keeping other left content.    |
| `withRightSidebar: false` | Hide optional right content; retain an article's TOC. |

Setting `withRightSidebar: true` does not create a region without content. An
empty local component still replaces the root component and counts as present;
use the visibility switch to hide the optional region. The frame owns drawer
labels, focus handling, and the fallback that keeps sidebars in normal flow when
JavaScript is unavailable.

Frame callers can supply `head` and `left-header` slots for document metadata and
a custom profile header. Author sidebar content through `_left.astro` and
`_right.astro`; the merged frame resolves these for both content and system pages.
Explicit frame props override the corresponding metadata visibility switches.

Legacy `rightWidgets` page metadata is rejected with migration guidance. Move
those imports into `_right.astro`. Older homepage bodies belong in
`src/content/index.*`, leaving `src/pages/index.astro` as the dispatcher.

## Posts, Drafts, and Tags

The `posts` collection requires `title` and `publishDate`. Optional fields include
`description`, `cover`, `views`, and sidebar switches. `cover` accepts a public or
HTTP(S) URL or an image resolved relative to the content file. `draft` defaults
to `false`, and `tags` defaults to an empty array.

Use `getPosts()` from `@assets/utils/posts` for shared visibility filtering.
Production builds exclude draft posts from generated routes, archives, tags,
widgets, RSS, and counters. Development mode includes drafts for author preview
with a draft badge. New search data or other public listings must use the same
filter before exposing posts.

Tags are trimmed, nonempty, case-sensitive strings. Duplicate names are removed
while author order is retained. Tag URLs encode spaces and non-Latin characters;
labels retain their original text. Post detail renders tags after the body,
outside prose styling, and omits an empty tag bar. Friend-card tags are unrelated
to post archives.

`sortPosts()` orders by descending publication date, then content ID for ties.
Filter and sort before pagination. Keep tag grouping and widget queries in their
consuming `.astro` files. See [Components and pagination](components.md) for archive
URLs and list contracts.

## Reading Time

`remarkReadingTime` from `@assets/utils/reading-time` is registered in
`astro.config.ts`. It extracts static text from the Markdown/MDX syntax tree,
including code, while ignoring imports, expressions, raw HTML, attributes, URLs,
and image alt text. CJK characters count at 400 characters per minute; other
words count at 200 words per minute. The combined duration is rounded up to a
positive integer and stored as `readingTimeMinutes` in rendered frontmatter.

Use `formatReadingTime()` for display (`1 min`, `5 mins`). Prepare browser-facing
summaries at build time; browsers do not render content collections or resolve
Astro image metadata.

Authoring examples and the bundled `/demo` routes are listed in the
[README](../../README.md#content).
