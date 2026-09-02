import { describe, expect, it } from 'vitest';

/**
 * WCAG 2.1 Contrast Formula Implementation (W3C Specification)
 */

function sRgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  const R = sRgbToLinear(r);
  const G = sRgbToLinear(g);
  const B = sRgbToLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getWcagContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const L1 = getRelativeLuminance(foregroundHex);
  const L2 = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function blendOverBackground(fgHex: string, opacity: number, bgHex: string): string {
  const cleanFg = fgHex.replace('#', '');
  const cleanBg = bgHex.replace('#', '');

  const fgR = parseInt(cleanFg.substring(0, 2), 16);
  const fgG = parseInt(cleanFg.substring(2, 4), 16);
  const fgB = parseInt(cleanFg.substring(4, 6), 16);

  const bgR = parseInt(cleanBg.substring(0, 2), 16);
  const bgG = parseInt(cleanBg.substring(2, 4), 16);
  const bgB = parseInt(cleanBg.substring(4, 6), 16);

  const r = Math.round(fgR * opacity + bgR * (1 - opacity));
  const g = Math.round(fgG * opacity + bgG * (1 - opacity));
  const b = Math.round(fgB * opacity + bgB * (1 - opacity));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

describe('Rigorous WCAG 2.1 Contrast Auditing for Gurudevi Marketing Sanctuary', () => {
  const surfaces = {
    creamSilence: '#F7F2E8',
    templeStone: '#EBE3D4',
    darkCharcoal: '#1D2933',
    darkVoid: '#0F0F1E',
  };

  const inkColors = {
    charcoalTruth: '#1D2933',
    mudBrown: '#685E55',
    sanctuarySaffron: '#C86F3D',
    templeGold: '#D4843A',
    sacredWhite: '#FFFDF8',
  };

  it('audits body copy (regular 16px-18px) against WCAG AA (≥ 4.5:1)', () => {
    const gurudeviBody = getWcagContrastRatio(inkColors.charcoalTruth, surfaces.creamSilence);
    expect(gurudeviBody).toBeGreaterThanOrEqual(4.5);

    const gurudeviSub80 = getWcagContrastRatio(
      blendOverBackground(inkColors.charcoalTruth, 0.8, surfaces.creamSilence),
      surfaces.creamSilence
    );
    expect(gurudeviSub80).toBeGreaterThanOrEqual(4.5);
  });

  it('audits large headings and accent chips against WCAG AA Large Text (≥ 3.0:1)', () => {
    const saffronContrast = getWcagContrastRatio(inkColors.sanctuarySaffron, surfaces.creamSilence);
    expect(saffronContrast).toBeGreaterThanOrEqual(3.0);
  });

  it('audits inverse white text on dark cards against WCAG AAA (≥ 7.0:1)', () => {
    const whiteOnCharcoal = getWcagContrastRatio(inkColors.sacredWhite, surfaces.darkCharcoal);
    expect(whiteOnCharcoal).toBeGreaterThanOrEqual(7.0);
  });
});
