import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = resolve(import.meta.dirname, '../../../app');
// The root stack has no anchor on purpose: its natural anchor, the tabs, is protected, and putting it
// under a public deep link (a shared form) would redirect a signed-out person away from it.
const UNANCHORED = new Set(['_layout.tsx']);

const layouts = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return layouts(path);
    return name === '_layout.tsx' ? [path] : [];
  });

describe('navigator anchors / G0 source contract over the real route tree', () => {
  const stacks = layouts(APP).filter((file) => {
    const source = readFileSync(file, 'utf8');
    return /<(Stack|Tabs)\b/.test(source) && !UNANCHORED.has(relative(APP, file));
  });

  it('finds the nested navigators', () => {
    expect(stacks.map((file) => relative(APP, file)).sort()).toEqual(
      expect.arrayContaining([
        '(tabs)/_layout.tsx',
        '(tabs)/self/_layout.tsx',
        '(tabs)/workspace/_layout.tsx',
      ]),
    );
  });

  it.each(layouts(APP).map((file) => [relative(APP, file), file]))(
    '%s anchors to a screen it has, if it has an overview',
    (name, file) => {
      if (UNANCHORED.has(name)) return;
      const source = readFileSync(file, 'utf8');
      if (!/<(Stack|Tabs)\b/.test(source)) return;
      const anchor = /unstable_settings\s*=\s*\{[^}]*anchor:\s*'([^']+)'/.exec(source)?.[1];
      const dir = dirname(file);
      const hasOverview = existsSync(join(dir, 'index.tsx'));
      if (!hasOverview && !anchor) return;
      expect(anchor, `${name} should export unstable_settings.anchor`).toBeDefined();
      const target = anchor as string;
      expect(
        existsSync(join(dir, `${target}.tsx`)) || existsSync(join(dir, target)),
        `${name} anchors to '${target}', which it does not have`,
      ).toBe(true);
    },
  );
});
