// @ts-check
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './src/utils/reading-time';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  },
});
