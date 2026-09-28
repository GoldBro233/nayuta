import { afterAll, beforeAll, expect, test } from 'bun:test';
import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openChromium } from '../fixtures/chromium';

const repositoryRoot = join(import.meta.dir, '../..');
const chrome =
  process.env.CHROME_BIN ??
  Bun.which('chromium') ??
  Bun.which('google-chrome') ??
  ((await Bun.file(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ).exists())
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);
const fixtures: {
  root: string;
  server: ReturnType<typeof Bun.serve>;
  control: ServerControl;
}[] = [];
const temporaryRoots: string[] = [];

type Browser = Awaited<ReturnType<typeof openChromium>>;
interface ServerControl {
  failIndex: boolean;
  failFragments: boolean;
  indexRequests: number;
}

async function build(root: string) {
  const child = Bun.spawn(['bun', 'run', '--bun', 'build'], {
    cwd: root,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, output: stdout + stderr };
}

async function prepare() {
  const root = await mkdtemp(join(tmpdir(), 'nayuta-search-'));
  temporaryRoots.push(root);
  await Promise.all(
    ['src', 'astro.config.ts', 'package.json', 'tsconfig.json'].map((path) =>
      cp(join(repositoryRoot, path), join(root, path), { recursive: true }),
    ),
  );
  await symlink(
    join(repositoryRoot, 'node_modules'),
    join(root, 'node_modules'),
    'dir',
  );
  await rm(join(root, 'src/content'), { recursive: true });
  await Bun.write(
    join(root, 'src/content/index.md'),
    '---\ntitle: Fixture home\n---\n\nFixture home.\n',
  );
  const globalPath = join(root, 'src/assets/styles/global.css');
  await Bun.write(
    globalPath,
    (await Bun.file(globalPath).text()).replace(/^@import url\([^\n]+;$/gm, ''),
  );
  const headPath = join(root, 'src/layouts/head-base.astro');
  await Bun.write(
    headPath,
    (await Bun.file(headPath).text()).replace(
      /<link\s[^>]*href="https:[\s\S]*?\/>/g,
      '',
    ),
  );
  for (let number = 1; number <= 12; number++) {
    const content = [
      'batchneedle',
      number <= 4 ? 'fourneedle' : '',
      number <= 5 ? 'fiveneedle' : '',
      number <= 6 ? 'sixneedle encodeneedle 中文 & Astro + CSS' : '',
    ]
      .filter(Boolean)
      .join(' ');
    await Bun.write(
      join(root, 'src/content/posts', `article-${number}.md`),
      `---\n${JSON.stringify({ title: `Fixture article ${number}`, publishDate: '2026-01-01' })}\n---\n\n${content}.\n`,
    );
  }
  await Bun.write(
    join(root, 'src/content/posts/draft.md'),
    '---\ntitle: Draft hidden article\npublishDate: "2026-01-01"\ndraft: true\n---\n\nbatchneedle sixneedle.\n',
  );
  await Bun.write(
    join(root, 'src/content/posts/excluded.md'),
    '---\ntitle: Excluded published article\npublishDate: "2026-01-01"\ntags: [ExcludedFromSearch]\nexclude_in_search: true\n---\n\nbatchneedle excludedneedle.\n',
  );
  return root;
}

async function fixture() {
  const root = await prepare();
  const result = await build(root);
  expect(result.code, result.output).toBe(0);
  const control: ServerControl = {
    failIndex: false,
    failFragments: false,
    indexRequests: 0,
  };
  const server = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    async fetch(request) {
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      if (pathname.startsWith('/pagefind/')) {
        control.indexRequests++;
        if (control.failIndex)
          return new Response('Unavailable', { status: 503 });
        if (control.failFragments && pathname.includes('/fragment/'))
          return new Response('Unavailable', { status: 503 });
      }
      const file = Bun.file(join(root, 'dist', pathname));
      if (await file.exists()) return new Response(file);
      const index = Bun.file(join(root, 'dist', pathname, 'index.html'));
      return (await index.exists())
        ? new Response(index)
        : new Response('Not found', { status: 404 });
    },
  });
  const ready = { root, server, control };
  fixtures.push(ready);
  return ready;
}

function url(server: ReturnType<typeof Bun.serve>, path: string) {
  return new URL(path, server.url).href;
}

async function evaluate<T>(browser: Browser, expression: string): Promise<T> {
  const result = await browser.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value as T;
}

async function until<T>(
  browser: Browser,
  expression: string,
  predicate: (value: T) => boolean,
) {
  let value: T | undefined;
  for (let attempt = 0; attempt < 200; attempt++) {
    value = await evaluate<T>(browser, expression);
    if (predicate(value)) return value;
    await Bun.sleep(50);
  }
  throw new Error(
    `Timed out waiting for ${expression}; last value: ${JSON.stringify(value)}`,
  );
}

async function navigate(
  browser: Browser,
  server: ReturnType<typeof Bun.serve>,
  path: string,
) {
  await browser.send('Page.navigate', { url: url(server, path) });
  await until(
    browser,
    `location.pathname === ${JSON.stringify(new URL(path, server.url).pathname)} && document.readyState === 'complete'`,
    Boolean,
  );
}

async function session(run: (browser: Browser) => Promise<void>, root: string) {
  const profile = await mkdtemp(join(root, 'chrome-'));
  const browser = await openChromium(chrome!, profile);
  try {
    await browser.send('Page.enable');
    await run(browser);
  } finally {
    await browser.close();
  }
}

async function input(browser: Browser, selector: string, value: string) {
  await evaluate(
    browser,
    `(() => { const field = document.querySelector(${JSON.stringify(selector)}); field.value = ${JSON.stringify(value)}; field.dispatchEvent(new Event('input', { bubbles: true })); })()`,
  );
}

async function submit(browser: Browser, selector: string) {
  await evaluate(
    browser,
    `document.querySelector(${JSON.stringify(selector)}).requestSubmit()`,
  );
}

const pageState = `(() => {
  const root = document.querySelector('nayuta-search-page');
  return root && {
    count: root.querySelectorAll('.search-results li').length,
    links: [...root.querySelectorAll('.search-results li a')].map(a => new URL(a.href).pathname),
    metadata: [...root.querySelectorAll('.search-results li .post-meta')].map(n => n.textContent),
    status: root.querySelector('.search-status').textContent,
    fallback: !root.querySelector('.search-fallback').hidden,
    busy: root.querySelector('.search-results').getAttribute('aria-busy')
  };
})()`;
type SearchState = {
  count: number;
  links: string[];
  status: string;
  metadata: string[];
  fallback: boolean;
  busy?: string;
};

let defaults: Awaited<ReturnType<typeof fixture>>;
beforeAll(async () => {
  defaults = await fixture();
}, 120_000);

afterAll(async () => {
  for (const { server } of fixtures) {
    server.stop(true);
  }
  await Promise.all(
    temporaryRoots.map((root) => rm(root, { recursive: true, force: true })),
  );
});

test.skipIf(!chrome)(
  'sidebar search navigates with encoded query and never previews results',
  async () => {
    await session(async (browser) => {
      defaults.control.indexRequests = 0;
      await navigate(browser, defaults.server, '/');
      const encoded = 'encodeneedle 中文 & Astro + CSS';
      await input(browser, '#left-sidebar .search-form input', encoded);
      expect(defaults.control.indexRequests).toBe(0);
      expect(
        await evaluate<number>(
          browser,
          `document.querySelectorAll('#left-sidebar .search-results, #left-sidebar .search-more, #left-sidebar .widget-header a').length`,
        ),
      ).toBe(0);
      await submit(browser, '#left-sidebar .search-form');
      const result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '6 matching articles',
      );
      expect(result.count).toBe(6);
      expect(
        new URL(
          await evaluate<string>(browser, 'location.href'),
        ).searchParams.get('q'),
      ).toBe(encoded);
      expect(
        await evaluate<string[]>(
          browser,
          `[...document.querySelectorAll('.breadcrumbs a[href="/search"]')].map(a => a.textContent)`,
        ),
      ).toEqual([`Search: ${encoded}`, `Search: ${encoded}`]);

      await navigate(browser, defaults.server, '/');
      await input(
        browser,
        '#left-sidebar .search-form input',
        '  fourneedle  ',
      );
      await evaluate(
        browser,
        `document.querySelector('#left-sidebar .search-submit').click()`,
      );
      const clicked = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '4 matching articles',
      );
      expect(clicked.count).toBe(4);
      expect(
        new URL(
          await evaluate<string>(browser, 'location.href'),
        ).searchParams.get('q'),
      ).toBe('fourneedle');
    }, defaults.root);
  },
  30_000,
);

test.skipIf(!chrome)(
  'direct search shows all results with post metadata, refresh, empty and history',
  async () => {
    await session(async (browser) => {
      await navigate(browser, defaults.server, '/search?q=batchneedle');
      let result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '12 matching articles',
      );
      expect([result.count, result.busy]).toEqual([12, 'false']);
      expect(new Set(result.links).size).toBe(12);
      expect(
        result.links.every((href) => href.startsWith('/posts/article-')),
      ).toBe(true);
      expect(result.metadata).toHaveLength(12);
      expect(
        result.metadata.every(
          (value) =>
            value.includes('Published: 2026-01-01') &&
            value.includes('Reading: 1 min'),
        ),
      ).toBe(true);
      await navigate(browser, defaults.server, '/search?q=batchneedle');
      result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '12 matching articles',
      );
      expect(result.count).toBe(12);
      await input(browser, '#left-sidebar .search-form input', 'sixneedle');
      await submit(browser, '#left-sidebar .search-form');
      result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '6 matching articles',
      );
      expect(result.count).toBe(6);
      await input(browser, '#left-sidebar .search-form input', 'fourneedle');
      await submit(browser, '#left-sidebar .search-form');
      await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '4 matching articles',
      );
      await browser.send('Page.navigateToHistoryEntry', {
        entryId: (await browser.send('Page.getNavigationHistory')).entries.at(
          -2,
        ).id,
      });
      result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '6 matching articles',
      );
      expect(
        await evaluate<string>(
          browser,
          `document.querySelector('.main-region .breadcrumbs a[href="/search"]').textContent`,
        ),
      ).toBe('Search: sixneedle');
      await navigate(browser, defaults.server, '/search?q=unmatchedneedle');
      result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === 'No matching articles.',
      );
      expect([result.count, result.fallback]).toEqual([0, true]);
    }, defaults.root);
  },
  30_000,
);
test.skipIf(!chrome)(
  'excluded posts remain in routes and tag archives but not Pagefind',
  async () => {
    await session(async (browser) => {
      await navigate(browser, defaults.server, '/posts/excluded');
      expect(
        await evaluate<string>(
          browser,
          `document.querySelector('h1.page-title').textContent.trim()`,
        ),
      ).toBe('Excluded published article');

      await navigate(browser, defaults.server, '/tag/ExcludedFromSearch');
      expect(
        await evaluate<string>(
          browser,
          `new URL(document.querySelector('.post-list .post-title a').href).pathname`,
        ),
      ).toBe('/posts/excluded');

      await navigate(browser, defaults.server, '/search?q=excludedneedle');
      const result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === 'No matching articles.',
      );
      expect([result.count, result.fallback]).toEqual([0, true]);
    }, defaults.root);
  },
  30_000,
);

test.skipIf(!chrome)(
  'failed result details show the archive fallback without partial results',
  async () => {
    await session(async (browser) => {
      defaults.control.failFragments = true;
      try {
        await navigate(browser, defaults.server, '/search?q=batchneedle');
        const failed = await until<SearchState>(
          browser,
          pageState,
          (value) => value?.status === 'Search is unavailable.',
        );
        expect([failed.count, failed.fallback, failed.busy]).toEqual([
          0,
          true,
          'false',
        ]);
      } finally {
        defaults.control.failFragments = false;
      }
    }, defaults.root);
  },
  30_000,
);

test.skipIf(!chrome)(
  'empty routes never request Pagefind and failed index shows archive fallback',
  async () => {
    await session(async (browser) => {
      defaults.control.indexRequests = 0;
      await navigate(browser, defaults.server, '/search');
      await navigate(browser, defaults.server, '/search?q=%20%20');
      expect(defaults.control.indexRequests).toBe(0);
      defaults.control.failIndex = true;
      try {
        await navigate(browser, defaults.server, '/search?q=fourneedle');
        const failed = await until<SearchState>(
          browser,
          pageState,
          (value) => value?.status === 'Search is unavailable.',
        );
        expect([failed.count, failed.fallback]).toEqual([0, true]);
        expect(
          await evaluate<string>(
            browser,
            `document.querySelector('nayuta-search-page .search-fallback a').getAttribute('href')`,
          ),
        ).toBe('/posts');
      } finally {
        defaults.control.failIndex = false;
      }
    }, defaults.root);
  },
  30_000,
);

test.skipIf(!chrome)(
  'mobile drawer submits search and no-script fallback remains accessible',
  async () => {
    await session(async (browser) => {
      await browser.send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await navigate(browser, defaults.server, '/');
      await evaluate(
        browser,
        `document.querySelector('#open-widgets-btn').click()`,
      );
      await input(browser, '#widgets-drawer .search-form input', 'sixneedle');
      await submit(browser, '#widgets-drawer .search-form');
      const result = await until<SearchState>(
        browser,
        pageState,
        (value) => value?.status === '6 matching articles',
      );
      expect(result.count).toBe(6);
      expect(
        await evaluate<string>(
          browser,
          `document.querySelector('.mobile-sticky-header .breadcrumbs a[href="/search"]').textContent`,
        ),
      ).toBe('Search: sixneedle');
      await browser.send('Emulation.setScriptExecutionDisabled', {
        value: true,
      });
      await navigate(browser, defaults.server, '/search');
      expect(
        await evaluate<boolean>(
          browser,
          `getComputedStyle(document.querySelector('nayuta-search-page .search-ui')).display === 'none'`,
        ),
      ).toBe(true);
      expect(
        await evaluate<string>(
          browser,
          `document.querySelector('nayuta-search-page noscript').textContent`,
        ),
      ).toContain('Browse posts');
      await navigate(browser, defaults.server, '/');
      expect(
        await evaluate<string>(
          browser,
          `document.querySelector('#left-sidebar .search-form').getAttribute('action')`,
        ),
      ).toBe('/search');
    }, defaults.root);
  },
  30_000,
);
