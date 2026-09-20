import type { MarkdownHeading } from 'astro';
import type { CollectionEntry } from 'astro:content';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

/** Common validated metadata; template-specific fields remain unknown until parsed. */
export type TemplateHeader = CollectionEntry<'pages'>['data'];

/** Common source identity and metadata for Markdown, MDX and Astro pages. */
export type PageEntry = Pick<CollectionEntry<'pages'>, 'id' | 'filePath'> & {
  data: TemplateHeader;
};

/** Shared input contract for page templates. */
export interface TemplateProps {
  entry: PageEntry;
  content?: AstroComponentFactory;
  headings?: MarkdownHeading[];
  isHome?: boolean;
}
