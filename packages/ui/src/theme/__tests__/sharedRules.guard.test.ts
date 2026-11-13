/**
 * Shared rules guard: pages may not decide what a shared layer owns.
 * See the "Shared rules audit" doc (global vs room vs page). Each rule names its owner.
 * The allowlists only shrink: remove an entry when its file is cleaned, never add one.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '../../../../..');
const WEB_PAGES = join(ROOT, 'apps/gurudevi-web/app/(sanctuary)');

function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '__tests__') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (name.endsWith(ext) && !name.includes('.test.')) out.push(p);
  }
  return out;
}

const rel = (p: string) => relative(ROOT, p);
/** Labs and the unused workbench copy are not pages people use. */
const notAPage = (p: string) =>
  /\/(kit|[\w-]*lab|architecture)\/|\/components\/workbench\//.test(p);

const css = walk(WEB_PAGES, '.css').filter((p) => !notAPage(p));
const read = (p: string) =>
  readFileSync(p, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

function offenders(
  files: string[],
  test: (text: string) => boolean,
  allow: readonly string[] = [],
) {
  return files.map(rel).filter((p, i) => !allow.includes(p) && test(read(files[i])));
}

describe('shared rules guard (web pages)', () => {
  it('colours come from the world, not the page (owner: world)', () => {
    // The reader's sepia and night papers are a reading choice the person makes.
    const allow = ['apps/gurudevi-web/app/(sanctuary)/library/reader/[bookId]/reader.module.css'];
    const raw = /(?<![\w-])#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\((?!\s*var\()/;
    expect(offenders(css, (t) => raw.test(t), allow)).toEqual([]);
  });

  it('width media queries use only the three shared sizes (owner: platform)', () => {
    const shared = new Set(['47.99rem', '48rem', '63.99rem', '64rem', '79.99rem', '80rem']);
    const bad = (t: string) =>
      [...t.matchAll(/@media[^{]*\((?:max|min)-width\s*:\s*([\d.]+(?:px|rem|em))\)/g)].some(
        (m) => !shared.has(m[1]),
      );
    expect(offenders(css, bad)).toEqual([]);
  });

  it('pages do not style scroll bars (owner: platform, kit stylesheet)', () => {
    expect(
      offenders(css, (t) => /scrollbar-(width|color|gutter)|::-webkit-scrollbar/.test(t)),
    ).toEqual([]);
  });

  it('pages do not write their own reduced-motion block (owner: person + kit)', () => {
    // These four still turn off a transform, filter or opacity change; fold into the kit, then remove.
    const allow = [
      'apps/gurudevi-web/app/(sanctuary)/sanctuary-shell.module.css',
      'apps/gurudevi-web/app/(sanctuary)/components/task-strip.module.css',
      'apps/gurudevi-web/app/(sanctuary)/components/sync-status-pill.module.css',
      'apps/gurudevi-web/app/(sanctuary)/components/tutii-greeting.module.css',
    ];
    expect(offenders(css, (t) => /prefers-reduced-motion/.test(t), allow)).toEqual([]);
  });

  it('page transitions are timed by the world, not in ms (owner: world + verger)', () => {
    // Slow ceremonial moves (over 600 ms, like a breath) keep their own time; everyday ones use
    // var(--w-dur-micro | --w-dur | --w-dur-meaningful) and var(--w-ease).
    const quick = (t: string) =>
      [...t.matchAll(/(?<![\w-])transition(?:-duration)?\s*:([^;{}]*)/g)].some((m) =>
        [...(m[1] ?? '').matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)].some((d) => {
          const ms = Number(d[1]) * (d[2] === 's' ? 1000 : 1);
          return ms > 1 && ms <= 600;
        }),
      );
    expect(offenders(css, quick)).toEqual([]);
  });

  it('pages do not shrink touch targets below the platform minimum (owner: platform)', () => {
    expect(
      offenders(css, (t) => /min-(height|width)\s*:\s*(1\d|2\d|3\d|4[0-3])px/.test(t)).length,
    ).toBeLessThanOrEqual(TOUCH_BASELINE);
  });
});

/** Files that still set a fixed control size under 44px; a ratchet that may only go down. */
const TOUCH_BASELINE = 6;

describe('shared rules guard (phone)', () => {
  const phone = [
    ...walk(join(ROOT, 'apps/gurudevi-mobile/app'), '.tsx'),
    ...walk(join(ROOT, 'apps/gurudevi-mobile/src'), '.tsx'),
    ...['self', 'community', 'library', 'profile'].flatMap((d) =>
      walk(join(ROOT, `packages/${d}/src`), '.tsx'),
    ),
  ];

  it('vertical scroll views keep the OS indicator (owner: platform)', () => {
    expect(offenders(phone, (t) => /showsVerticalScrollIndicator=\{false\}/.test(t))).toEqual([]);
  });

  it('width checks go through the layout helpers, not page numbers (owner: platform)', () => {
    // Labs and the old shell decide their own lanes until they move.
    const allow = ['apps/gurudevi-mobile/src/lib/responsiveShell.ts'];
    const bad = (t: string) =>
      /\b(width|shell\.width)\s*(<|>|<=|>=)\s*(5\d\d|6\d\d|7\d\d|8\d\d|9\d\d|1\d{3})\b/.test(t);
    expect(offenders(phone, bad, allow)).toEqual([]);
  });
});
