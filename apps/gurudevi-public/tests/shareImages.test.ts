import { describe, expect, it } from 'vitest';
import { renderSchoolBadge } from '../src/lib/schoolBadge';
import { renderShareImage } from '../src/lib/shareImage';

describe('School badge and share card (G1 / Vitest)', () => {
  describe('badge', () => {
    it('generates valid, crisp Sinhala badge with canonical orthography by default', () => {
      const svg = renderSchoolBadge();
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 520 140"');
      expect(svg).toContain('ගුරුදෙවි');
      expect(svg).toContain('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');

      // Assert strict linguistic invariants
      expect(svg).not.toMatch(/ගුරුදේවි|ගුරුදේවී/);
      expect(svg).not.toMatch(/සුරක්ෂිත කෙම්බිම/);
      expect(svg).not.toMatch(/සමෝධානික/);

      // Byte budget assertion: Must be ultra-lightweight (< 15KB)
      const byteSize = new TextEncoder().encode(svg).length;
      expect(byteSize).toBeLessThan(15_000);
    });

    it('generates canonical Tamil badge when requested', () => {
      const svg = renderSchoolBadge({ lang: 'ta', school: 'chundikuli' });

      expect(svg).toContain('குருதெவி');
      expect(svg).toContain('ஒருங்கிணைந்த கல்வியின் அமைதிச் சோலை');
      expect(svg).toContain('CHUNDIKULI');

      // Zero long-vowel violations
      expect(svg).not.toMatch(/குருதேவி|குருதேவீ/);
    });

    it('supports diurnal themes (night, dawn, dusk)', () => {
      const nightSvg = renderSchoolBadge({ theme: 'night' });
      expect(nightSvg).toContain('#15120E'); // Night background

      const dawnSvg = renderSchoolBadge({ theme: 'dawn' });
      expect(dawnSvg).toContain('#FFF8EE'); // Dawn background
    });
  });

  describe('share card', () => {
    it('generates full 1200x630 card strictly under 50KB to beat the WhatsApp 300KB limit', () => {
      const svg = renderShareImage({ school: 'ananda', lang: 'si' });
      expect(svg).toContain('width="1200" height="630"');
      expect(svg).toContain('ANANDA');
      expect(svg).toContain('ගුරුදෙවි');
      expect(svg).toContain('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');

      // The WhatsApp 300KB invariant: Card payload must be comfortably under 50KB
      const byteSize = new TextEncoder().encode(svg).length;
      expect(byteSize).toBeLessThan(50_000);
      expect(byteSize).toBeGreaterThan(1_000); // Verify content is not empty
    });

    it('supports custom titles with canonical branding', () => {
      const svg = renderShareImage({ customTitle: 'Fire Journal Sanctuary', theme: 'night' });

      expect(svg).toContain('Fire Journal Sanctuary');
      expect(svg).toContain('#120F0C'); // Night palette
    });
  });
});
