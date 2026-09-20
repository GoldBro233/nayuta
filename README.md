<div align="center">

<img src="./public/assets/images/banner.png" alt="Nayuta Banner" width="100%" />

<br />
<br />

# Nayuta

**A sleek, responsive, reading-first Astro theme designed for developers and writers.**

[![Astro](https://img.shields.io/badge/Astro-7.x-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.x-FBF0DF?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)

[Features](#-features) • [Showcase](#-showcase) • [Quick Start](#-quick-start) • [Configuration](#-configuration)

</div>

---

## 📖 Overview

**Nayuta** is an Astro theme crafted with a strict **reading-first** philosophy. It combines high-performance static site generation with a clean, compact monospace visual aesthetic.

Featuring an adaptive multi-column layout, Nayuta keeps long-form prose comfortable and readable on wide desktop viewports while smoothly collapsing sidebars into accessible drawers on smaller screens.

> **Nayuta** takes its name from **Kani Nayuta** (_可児 那由多_), the eccentric genius novelist from Yomi Hirasaka's _A Sister's All You Need_ (_妹さえいればいい。_).

---

## ✨ Features

- 📖 **Reading-First Typography**: Monospace-centered typography stack (JetBrains Mono & Fira Code) with comfortable line lengths and prose rhythm.
- 📐 **Adaptive Multi-Column Layout**: Intelligent 3-column desktop structure that collapses into lightweight slide-out drawers on mobile and tablets.
- 🎨 **5 Curated Color Themes**: Includes `nayuta`, `nayuta-aqua`, `midnight-blue`, `oled-dark`, and `sakura-pink` palettes, easily switchable via config.
- ⚡ **Astro 7 & Content Collections**: Fully typed Markdown and MDX content powered by Zod validation and Astro glob loaders.
- ⏱️ **Automatic Reading Time**: Native bilingual (CJK + Latin) reading time estimation without browser runtime overhead.
- 🏷️ **Tags & Dynamic Archives**: Built-in tag filtering, tag cloud widget, and static `/tag/<name>` archive pages.
- 🧩 **Modular Sidebar Widgets**: Compose per-page Astro sidebars with shared defaults and a built-in article TOC.
- 👥 **Pre-built Templates**: Ready-to-use templates for personal homepages, post archives, and friends link walls.

---

## 📸 Showcase

<div align="center">

|                                    Desktop Experience (Home)                                    |                                      Mobile Responsive                                      |
| :---------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: |
| <img src="./docs/assets/01-home-desktop-1920x1080.png" alt="Nayuta Home Desktop" width="650" /> | <img src="./docs/assets/05-home-mobile-440x956.png" alt="Nayuta Home Mobile" width="180" /> |

<details>
<summary><b>🔍 View More Screenshots (Posts, Article, Friends)</b></summary>
<br />

| Page                |                      Desktop Experience (1920×1080)                      |                      Mobile Responsive (440×956)                      |
| :------------------ | :----------------------------------------------------------------------: | :-------------------------------------------------------------------: |
| **Posts Stream**    |  <img src="./docs/assets/02-posts-desktop-1920x1080.png" width="500" />  |  <img src="./docs/assets/06-posts-mobile-440x956.png" width="150" />  |
| **Article Reading** | <img src="./docs/assets/03-article-desktop-1920x1080.png" width="500" /> | <img src="./docs/assets/07-article-mobile-440x956.png" width="150" /> |
| **Friend Links**    | <img src="./docs/assets/04-friends-desktop-1920x1080.png" width="500" /> | <img src="./docs/assets/08-friends-mobile-440x956.png" width="150" /> |

</details>

</div>

---

## 🚀 Quick Start

### 1. Clone and Install

Make sure you have [Bun](https://bun.sh) (recommended) or [Node.js](https://nodejs.org) (v18+) installed.

```bash
# Clone the repository
git clone https://github.com/yuanzui-cf/nayuta.git
cd nayuta

# Install dependencies
bun install
```

### 2. Development

```bash
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) to preview your site.

### 3. Build & Test

```bash
# Type check Astro templates and TypeScript
bun run check

# Run test suite
bun run test

# Build static output (outputs to dist/)
bun run build

# Preview production build locally
bun run preview
```

---

## ⚙️ Configuration

### Site Settings (`src/config.ts`)

Customize your site profile, metadata, navigation, and theme preset in [`src/config.ts`](./src/config.ts):

```typescript
import type { Config } from './types/config';

const config: Config = {
  title: '✍️ Kani Nayuta',
  author: 'Kani Nayuta',
  avatar: '/assets/images/avatar.jpg',
  description: 'Genius Light Novelist | Author of "The Landscape Series"',
  site_url: 'https://nayuta.kani.dev',
  // Presets: 'nayuta' | 'nayuta-aqua' | 'midnight-blue' | 'oled-dark' | 'sakura-pink'
  theme: 'nayuta',
  since: '2024-01-01',
  links: [
    {
      text: 'Posts',
      url: '/posts',
      icon: { type: 'icon', name: 'fa-solid fa-file-lines' },
    },
    {
      text: 'Friends',
      url: '/friend',
      icon: { type: 'icon', name: 'fa-solid fa-users' },
    },
  ],
};

export default config;
```

### Writing Posts (`src/content/posts/`)

Place `.md` or `.mdx` files into `src/content/posts/`. You can author posts as standalone files or folder bundles:

```markdown
---
title: 'The Architecture of Reading-First Design'
publishDate: '2026-09-09'
description: 'A deep dive into balancing information density and typography.'
cover: '/assets/images/banner.png' # or './cover.png' in a folder bundle
tags: ['Astro', 'CSS Grid', 'Typography']
---

Article content here...
```

- **Reading Time**: Calculated automatically at compile time based on bilingual (CJK + Latin) content.
- **Folder Bundles**: For posts with collocated images, create `src/content/posts/<slug>/index.md` alongside your assets and use relative paths like `cover: './cover.png'`.
- **Article MDX Components**: Reusable components such as `<Callout />` are available under `src/widgets/article/`.

### Homepage and Custom Pages

Edit the homepage in `src/content/index.mdx`. You can use `index.md` or
`index.astro` instead; keep exactly one homepage file. The theme supplies the
page frame, title, sidebars and responsive drawers.

```text
src/content/
├── assets/                    # Shared content resources, never routes
├── index.mdx                  # Homepage: .md / .mdx / .astro
├── _left.astro                # Default left widgets
├── _right.astro               # Optional default right widgets
├── pages/
│   ├── about.astro            # /about
│   └── a/b/c/
│       ├── index.mdx          # /a/b/c
│       ├── _left.astro        # Override the left widgets for this directory
│       ├── _right.astro       # Override the right widgets for this directory
│       └── assets/
└── posts/
    └── hello/
        ├── index.mdx          # /posts/hello
        ├── _left.astro
        └── _right.astro       # Additional content below the mandatory TOC
```

Standalone pages accept `.md`, `.mdx` and `.astro`. For Markdown/MDX:

```markdown
---
title: About Me
description: A short introduction
template: default
---

Page content goes here...
```

An Astro page exports the same metadata as `page` and supplies body content:

```astro
---
export const page = { title: 'About Me', description: 'A short introduction' };
---

<p>Compose Astro components here. The theme renders the page title.</p>
```

Astro pages receive `entry` and `headings` props. Their `headings` array is empty;
automatic heading extraction applies to Markdown/MDX. Article bodies remain
Markdown/MDX so reading time, drafts, tags and the article TOC retain their normal
behavior. Astro pages can contain scoped styles and normal Astro scripts, but
should not include another HTML document or Frame. Dynamic route declarations
such as `[id].astro` belong in `src/pages`, not in authored content.

Routes follow the path below `content/pages`, without the extension or terminal
`index`. Thus `a/b/c.md` and `a/b/c/index.mdx` both describe `/a/b/c`; choose one.
Paths retain filename case. An optional `slug: published/path` overrides the URL
without changing where the theme finds sidebars or relative assets. Duplicate
standalone URLs, including different file formats, fail with the source paths.
The homepage dispatcher and generated system routes take priority over content
pages: `pages/posts.mdx` cannot replace the archive, and the build reports the
ignored route without failing. Only URLs actually emitted by system routes win;
this does not reserve every possible URL below `/posts` or `/tag`.

All `assets/` directories and underscore-prefixed files/directories are excluded
from page and post discovery. Resource files remain importable, including relative
Markdown images and MDX/Astro imports. They are not automatically copied to matching
public URLs; use `public/` for files that need stable, direct download URLs.
Only the root `index.*`, files under `pages/`, and registered posts are entries;
other files directly under `content/` do not become routes.

### Theme Templates

`src/layouts/widgets/ContentPage.astro` prepares the body and selects the template:
`template: friend` uses `FriendTemplate.astro`; other values use `PageTemplate.astro`.
Concrete templates live in `src/templates/` and share `TemplateProps` from
`@type/template`: `entry`, optional `content`, `headings` and `isHome`.
`PageEntry` and `TemplateHeader` are defined in the same module.

Inside a template, alias `content` to an uppercase component variable:
`const { content: Content } = Astro.props`. Render it with `<Content />`;
`<content />` would create an HTML element. Templates own the body presentation
and use `@layouts/content-frame.astro` for the page frame and sidebars.

### Custom Sidebars

Each side resolves independently: a `_left.astro` or `_right.astro` beside the
content file takes precedence over the corresponding file at `src/content/`.
There is no search through intermediate ancestor directories. Files in the same
directory share sidebars; use a folder bundle for independent per-page overrides.
The profile card and footer remain part of the layout.

For example, place this at `src/content/_right.astro` for a site-wide default,
or next to a page's `index.mdx` to replace that default for the page:

```astro
---
import RecentPosts from '@widgets/sidebar/RecentPosts.astro';
import WebsiteStatus from '@widgets/sidebar/WebsiteStatus.astro';
---

<RecentPosts />
<WebsiteStatus />
```

Without a local or root right component, ordinary pages have no right column or
right drawer. Article detail always renders its TOC first, followed by the chosen
right component. Article/tag archives and the 404 page use the root defaults.

Both sidebar components receive `entry`, `headings` and `pathname` through
`Astro.props`. `entry` is absent for system archive/404 pages, so access it with
optional chaining. Match sidebar links against `pathname`, not a collection ID.
Sidebars render in both desktop regions and mobile drawers; avoid fixed HTML IDs
and scope any client behavior to its component instance.

Optional metadata switches are `withLeftSidebar: false` (hide the entire left
region), `withProfileCard: false` (hide only the profile), and
`withRightSidebar: false` (hide optional right content). The latter never hides an
article's TOC. Setting it to `true` does not create an empty right column when no
right component exists. An empty local component replaces the root content but
still counts as an existing right component; use the switch to hide the region.

**Migration:** move old `rightWidgets` arrays into `_right.astro` imports; legacy
arrays produce an actionable error. The default left widgets now live in
`src/content/_left.astro`, and homepage content moved from `src/pages/index.astro`
to `src/content/index.mdx`. Markdown page collection IDs now retain the content
source path and extension (for example `pages/friend.mdx`); URLs are resolved
separately. Existing bundled site URLs are unchanged.

### Bundled Demos

Open `/demo` (also linked from the homepage) to explore the examples:

| Route                    | Source                                          | Demonstrates                                                    |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| `/demo/markdown`         | `src/content/pages/demo/markdown.md`            | Root left sidebar, no right sidebar                             |
| `/demo/notes/nested`     | `src/content/pages/demo/notes/nested/index.mdx` | Nested routing, local assets, local right sidebar               |
| `/demo/studio`           | `src/content/pages/demo/studio/index.astro`     | Astro body and both local sidebars                              |
| `/posts/typography-test` | `src/content/posts/typography-test/index.mdx`   | Bundled article, local sidebars, TOC before extra right content |

---

## 📄 License

[MIT](./LICENSE)
