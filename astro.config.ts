// @ts-check
import mdx from '@astrojs/mdx';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './src/assets/utils/reading-time';
import config from './src/config';

const site = config.site_url;
if (!site) {
  throw new Error('site_url in src/config.ts must be an absolute HTTP(S) URL.');
}

let siteUrl;

try {
  siteUrl = new URL(site);
} catch {
  throw new Error('site_url in src/config.ts must be an absolute HTTP(S) URL.');
}

if (siteUrl.protocol !== 'http:' && siteUrl.protocol !== 'https:') {
  throw new Error('site_url in src/config.ts must be an absolute HTTP(S) URL.');
}

// Astro components discovered outside src/pages need a fresh module graph when
// their file set changes. Edits to already imported components use normal HMR.
function contentEntryUpdates(): AstroIntegration {
  let contentDirectory: string;
  return {
    name: 'nayuta:content-entry-updates',
    hooks: {
      'astro:config:done': ({ config }) => {
        contentDirectory = fileURLToPath(new URL('content/', config.srcDir));
      },
      'astro:server:setup': ({ server }) => {
        let pending: ReturnType<typeof setTimeout> | undefined;
        const refresh = (file: string) => {
          const path = relative(contentDirectory, file).replaceAll('\\', '/');
          const segments = path.split('/');
          const filename = segments.pop()!;
          if (!filename.endsWith('.astro') || path.startsWith('../')) return;
          if (
            segments.some((part) => part === 'assets' || part.startsWith('_'))
          )
            return;
          const sidebar =
            filename === '_left.astro' || filename === '_right.astro';
          const page =
            !filename.startsWith('_') &&
            (segments[0] === 'pages' || path === 'index.astro');
          if (!sidebar && !page) return;
          clearTimeout(pending);
          pending = setTimeout(() => {
            for (const environment of Object.values(server.environments)) {
              environment.moduleGraph.invalidateAll();
              environment.hot.send({ type: 'full-reload' });
            }
          }, 50);
        };
        server.watcher.on('add', refresh);
        server.watcher.on('unlink', refresh);
        server.httpServer?.once('close', () => {
          clearTimeout(pending);
          server.watcher.off('add', refresh);
          server.watcher.off('unlink', refresh);
        });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [mdx(), sitemap(), contentEntryUpdates()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  },
});
