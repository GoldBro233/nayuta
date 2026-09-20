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
- 🧩 **Modular Sidebar Widgets**: Declaratively configure right sidebar widgets (TOC, recent posts, website status, tag cloud) per page.
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

### Custom Pages (`src/content/pages/`)

Add Markdown or MDX files in `src/content/pages/`. Routes map directly to filenames (e.g. `about.md` &rarr; `/about`):

```markdown
---
title: 'About Me'
template: 'default'
withRightSidebar: true
rightWidgets:
  - 'recent-posts'
  - 'website-status'
---

Page content goes here...
```

---

## 📄 License

[MIT](./LICENSE)
