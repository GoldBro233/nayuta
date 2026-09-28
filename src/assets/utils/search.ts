export interface SearchResultData {
  url: string;
  meta: { title: string; publishDate: string; readingTimeMinutes: string };
  excerpt: string;
}

export interface SearchMatch {
  data(): Promise<SearchResultData>;
}
export async function searchPosts(query: string): Promise<SearchMatch[]> {
  if (!query.trim()) return [];
  // Pagefind generates this module only after the Astro build.
  const moduleUrl = '/pagefind/pagefind.js';
  const pagefind: {
    search(query: string): Promise<{ results: SearchMatch[] }>;
  } = await import(/* @vite-ignore */ moduleUrl);
  const response = await pagefind.search(query);
  return response.results;
}
