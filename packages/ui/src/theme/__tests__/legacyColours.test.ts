import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../color';
import { legacyColourNames, worldCssVariables } from '../css';
import { resolveWorld } from '../resolve';
import { WORLD_IDS } from '../worlds';

const WEB = join(__dirname, '../../../../../apps/gurudevi-web');

function cssFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === '.next') continue;
    if (statSync(p).isDirectory()) cssFiles(p, out);
    else if (name.endsWith('.css')) out.push(p);
  }
  return out;
}

describe('legacy colour names follow the world', () => {
  it('every --color-* name a web page uses is defined somewhere', () => {
    const files = [...cssFiles(join(WEB, 'app')), ...cssFiles(join(WEB, 'lib'))];
    const used = new Set<string>();
    const defined = new Set<string>(Object.keys(worldCssVariables(resolveWorld(WORLD_IDS[0]))));
    for (const f of files) {
      const css = readFileSync(f, 'utf8');
      for (const m of css.matchAll(/var\((--color-[a-z0-9-]+)/g)) used.add(m[1]);
      for (const m of css.matchAll(/^\s*(--color-[a-z0-9-]+)\s*:/gm)) defined.add(m[1]);
    }
    const missing = [...used].filter((n) => !defined.has(n)).sort();
    expect(missing).toEqual([]);
  });

  it.each(
    WORLD_IDS.flatMap((id) => (['light', 'dark'] as const).map((mode) => [id, mode] as const)),
  )('%s %s: text names stay readable on the surface names', (id, mode) => {
    const v = legacyColourNames(
      resolveWorld(id, mode === 'dark' ? 'night' : 'morning', mode).tokens,
    );
    for (const text of ['--color-text', '--color-text-secondary', '--color-text-muted']) {
      expect(contrastRatio(v[text], v['--color-surface'])).toBeGreaterThanOrEqual(4.5);
    }
  });
});
