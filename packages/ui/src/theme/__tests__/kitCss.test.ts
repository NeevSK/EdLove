import { describe, expect, it } from 'vitest';
import { kitStylesheet } from '../kitCss';
import { SIGN_CYCLE_MS, SIGNS, type SignKind } from '../signs';
import { WORLD_IDS } from '../worlds';

const KINDS = Object.keys(SIGN_CYCLE_MS) as SignKind[];

describe('kit stylesheet', () => {
  const css = kitStylesheet();

  it('gives every sign kind its loop and every world its sign and tempo', () => {
    for (const k of KINDS) expect(css).toContain(`.gd-s[data-sign="${k}"]{--gd-base:${SIGN_CYCLE_MS[k]}`);
    for (const id of WORLD_IDS) {
      expect(css).toContain(`html[data-world="${id}"] .gd-sign{--gd-tempo:`);
      expect(css).toContain(`html[data-world="${id}"] .gd-sign[data-auto]>.gd-s[data-sign="${SIGNS[id]}"]{display:flex}`);
    }
  });

  it('holds signs still for people who ask for reduced motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion:reduce\)\{\.gd-s \*\{animation-play-state:paused/);
  });

  it('uses no raw colours', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  });
});
