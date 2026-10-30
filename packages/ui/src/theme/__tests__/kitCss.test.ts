import { describe, expect, it } from 'vitest';
import { space } from '../../tokens/space';
import { kitStylesheet } from '../kitCss';
import { resolveWorld } from '../resolve';
import { SIGN_CYCLE_MS, SIGNS, type SignKind } from '../signs';
import { WORLD_IDS } from '../worlds';

const KINDS = Object.keys(SIGN_CYCLE_MS) as SignKind[];

describe('kit stylesheet', () => {
  const css = kitStylesheet();

  it('gives every sign kind its loop and every world its sign and tempo', () => {
    for (const k of KINDS)
      expect(css).toContain(`.gd-s[data-sign="${k}"]{--gd-base:${SIGN_CYCLE_MS[k]}`);
    for (const id of WORLD_IDS) {
      expect(css).toContain(`html[data-world="${id}"] .gd-sign{--gd-tempo:`);
      expect(css).toContain(
        `html[data-world="${id}"] .gd-sign[data-auto]>.gd-s[data-sign="${SIGNS[id]}"]{display:flex}`,
      );
    }
  });

  it('gives every spacing relation a rule in rem, so the reader text size opens it', () => {
    for (const r of ['inside', 'between', 'group', 'section'] as const) {
      const px = space[r].comfortable;
      expect(css).toContain(`.gd-inline[data-gap="${r}"]{gap:min(${px / 16}rem, ${px * 1.5}px)}`);
    }
  });

  it('gives every world its group inset and hairline weight', () => {
    for (const id of WORLD_IDS) {
      const g = resolveWorld(id).recipes.group;
      expect(css).toContain(
        `--w-group-indent:${g.indent}px;--w-group-divider-w:${g.divider.width}px`,
      );
    }
  });

  it('lets rows and wide cards lay out for their own width, not the screen', () => {
    expect(css).toContain('.gd-row{container-type:inline-size}@container (max-width: 299px)');
    expect(css).toContain('@container (max-width: 359px){.gd-card[data-shape="wide"]');
  });

  it('holds signs still for people who ask for reduced motion', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.gd-s \*\{animation-play-state:paused/,
    );
  });

  it('uses no raw colours', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  });
});
