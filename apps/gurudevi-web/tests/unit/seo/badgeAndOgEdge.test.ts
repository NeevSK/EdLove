import { describe, expect, it } from 'vitest';
import { GET as getBadgeSvg } from '../../../app/badge.svg/route';
import { GET as getOgCard } from '../../../app/api/og/route';
import { resolveHostRouting } from '../../../lib/host-routing';

describe('Phase 1: Edge Media & WhatsApp-Safe Badges Suite', () => {
  describe('Dynamic Badge SVG Route (/badge.svg)', () => {
    it('generates valid, crisp Sinhala badge with canonical orthography by default', async () => {
      const req = new Request('https://gurudevi.app/badge.svg');
      const res = getBadgeSvg(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

      const svg = await res.text();
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

    it('generates canonical Tamil badge when requested', async () => {
      const req = new Request('https://gurudevi.app/badge.svg?lang=ta&school=chundikuli');
      const res = getBadgeSvg(req);

      expect(res.status).toBe(200);
      const svg = await res.text();

      expect(svg).toContain('குருதெவி');
      expect(svg).toContain('ஒருங்கிணைந்த கல்வியின் அமைதிச் சோலை');
      expect(svg).toContain('CHUNDIKULI');

      // Zero long-vowel violations
      expect(svg).not.toMatch(/குருதேவி|குருதேவீ/);
    });

    it('supports diurnal themes (night, dawn, dusk)', async () => {
      const nightReq = new Request('https://gurudevi.app/badge.svg?theme=night');
      const nightRes = getBadgeSvg(nightReq);
      const nightSvg = await nightRes.text();
      expect(nightSvg).toContain('#15120E'); // Night background

      const dawnReq = new Request('https://gurudevi.app/badge.svg?theme=dawn');
      const dawnRes = getBadgeSvg(dawnReq);
      const dawnSvg = await dawnRes.text();
      expect(dawnSvg).toContain('#FFF8EE'); // Dawn background
    });
  });

  describe('WhatsApp-Safe Edge OG Pipeline (/api/og)', () => {
    it('generates full 1200x630 card strictly under 50KB to beat the WhatsApp 300KB limit', async () => {
      const req = new Request('https://gurudevi.app/api/og?school=ananda&lang=si');
      const res = getOgCard(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

      const svg = await res.text();
      expect(svg).toContain('width="1200" height="630"');
      expect(svg).toContain('ANANDA');
      expect(svg).toContain('ගුරුදෙවි');
      expect(svg).toContain('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');

      // The WhatsApp 300KB invariant: Card payload must be comfortably under 50KB
      const byteSize = new TextEncoder().encode(svg).length;
      expect(byteSize).toBeLessThan(50_000);
      expect(byteSize).toBeGreaterThan(1_000); // Verify content is not empty
    });

    it('supports custom titles with canonical branding', async () => {
      const req = new Request('https://gurudevi.app/api/og?title=Fire+Journal+Sanctuary&theme=night');
      const res = getOgCard(req);
      const svg = await res.text();

      expect(svg).toContain('Fire Journal Sanctuary');
      expect(svg).toContain('#120F0C'); // Night palette
    });
  });

  describe('Subdomain Host-Routing for Edge Media', () => {
    it('rewrites /badge.svg on school subdomain to include school query param', () => {
      const decision = resolveHostRouting('ananda.gurudevi.app', '/badge.svg', 'GET');
      expect(decision).toEqual({
        kind: 'rewrite',
        pathname: '/badge.svg?school=ananda',
      });
    });

    it('allows /api/og directly on school subdomains', () => {
      const decision = resolveHostRouting('visakha.gurudevi.app', '/api/og', 'GET');
      expect(decision).toEqual({
        kind: 'allow',
      });
    });
  });
});
