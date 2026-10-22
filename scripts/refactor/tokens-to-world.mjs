#!/usr/bin/env node
/**
 * Codemod: legacy static colour tokens -> world tokens.
 *
 *   node scripts/refactor/tokens-to-world.mjs path/to/File.tsx [...]
 *
 * Rewrites `tokens.semantic.*` and `tokens.colors.*` colour reads to `wt.*`.
 * It does not add the hook: put `const wt = useWorld().tokens;` at the top of
 * each component that now reads `wt`, import `useWorld` from
 * '@repo/ui/world/native', then run `pnpm check:world`.
 *
 * Review each result by eye. A thin line or small text in `lamp` may need
 * `lampDeep` to stay legible on the ground.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const MAP = {
  'tokens.semantic.surface.canvas': 'wt.ground',
  'tokens.semantic.surface.elevated': 'wt.raised',
  'tokens.semantic.surface.interactive': 'wt.sunken',
  'tokens.semantic.text.primary': 'wt.ink',
  'tokens.semantic.text.secondary': 'wt.inkSoft',
  'tokens.semantic.text.muted': 'wt.inkFaint',
  'tokens.semantic.text.inverse': 'wt.onLamp',
  'tokens.semantic.border.subtle': 'wt.line',
  'tokens.colors.surfaceInteractive': 'wt.sunken',
  'tokens.colors.inkSubtle': 'wt.inkSoft',
  'tokens.colors.error': 'wt.danger',
  'tokens.colors.success': 'wt.success',
  'tokens.colors.primary': 'wt.lamp',
};

const keys = Object.keys(MAP).sort((a, b) => b.length - a.length);

for (const file of process.argv.slice(2)) {
  let src = readFileSync(file, 'utf8');
  let count = 0;
  for (const k of keys) {
    const parts = src.split(k);
    count += parts.length - 1;
    src = parts.join(MAP[k]);
  }
  writeFileSync(file, src);
  const left = src.match(/tokens\.(?:semantic|colors)\.[\w.]+/g) ?? [];
  console.log(`${file}: ${count} replaced${left.length ? `; needs a decision: ${[...new Set(left)].join(', ')}` : ''}`);
}
