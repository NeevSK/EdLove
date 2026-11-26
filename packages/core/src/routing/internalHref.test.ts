import { describe, expect, expectTypeOf, it } from 'vitest';
import { buildHref, checkInternalHref } from './internalHref';
import type { AppHref, RoutePattern } from './routeHref';

describe('internal hrefs / G1, real route catalogue', () => {
  describe('checkInternalHref', () => {
    it('accepts a path to a screen that exists, with or without its group, query and fragment', () => {
      expect(checkInternalHref('/workspace', 'mobile')).toMatchObject({ ok: true });
      expect(checkInternalHref('/(tabs)/workspace/inventory', 'mobile')).toMatchObject({
        ok: true,
        route: '/(tabs)/workspace/inventory',
      });
      expect(checkInternalHref('/onboarding?entry=guest#top', 'mobile')).toMatchObject({
        ok: true,
        path: '/onboarding',
      });
      expect(checkInternalHref('/school/42', 'web')).toMatchObject({ ok: true, route: '/school/[id]' });
    });

    it.each([
      ['https://evil.example/self', 'not_internal'],
      ['javascript:alert(1)', 'not_internal'],
      ['gurudevi://self', 'not_internal'],
      ['//evil.example/self', 'not_internal'],
      ['/\\evil.example', 'not_internal'],
      ['self', 'not_internal'],
      ['/self/<script>', 'unsafe_characters'],
      ['/self\u0000', 'unsafe_characters'],
      ['/self%0d%0aSet-Cookie:x', 'unsafe_characters'],
      ['/self/\\..\\', 'unsafe_characters'],
      ['/self/../workspace', 'traversal'],
      ['/self/%2e%2e/workspace', 'traversal'],
      ['/self/%E0%A4%A', 'traversal'],
      ['/self/wisdom/[id]', 'unfilled_params'],
      ['/no-such-screen', 'unknown_route'],
    ] as const)('rejects %s as %s', (href, reason) => {
      expect(checkInternalHref(href, 'mobile')).toMatchObject({ ok: false, reason });
    });

    it('rejects what is not a string, and what is too long', () => {
      expect(checkInternalHref(undefined, 'mobile')).toEqual({ ok: false, reason: 'not_a_string' });
      expect(checkInternalHref({ pathname: '/self' }, 'mobile')).toMatchObject({ ok: false });
      expect(checkInternalHref(`/self?${'a'.repeat(9000)}`, 'mobile')).toMatchObject({
        ok: false,
        reason: 'too_long',
      });
    });
  });

  describe('buildHref', () => {
    it('fills dynamic segments, encoded, and sends the rest to the query', () => {
      expect(buildHref('/(tabs)/self/wisdom/[id]', { id: 'a b/c', tab: 'notes' })).toBe(
        '/(tabs)/self/wisdom/a%20b%2Fc?tab=notes',
      );
      expect(buildHref('/self', { feature: 'gratitude' })).toBe('/self?feature=gratitude');
      expect(buildHref('/library/[[...path]]', {})).toBe('/library');
    });

    it('leaves a missing required segment in place, so the check refuses it', () => {
      const href = buildHref('/(tabs)/self/wisdom/[id]', {});
      expect(checkInternalHref(href, 'mobile')).toMatchObject({ ok: false, reason: 'unfilled_params' });
    });
  });

  it('types hrefs from the catalogue', () => {
    expectTypeOf<'/workspace'>().toExtend<AppHref>();
    expectTypeOf<'/(tabs)/workspace/inventory'>().toExtend<AppHref>();
    expectTypeOf<'/onboarding?entry=guest'>().toExtend<AppHref>();
    expectTypeOf<'/self/wisdom/42'>().toExtend<AppHref>();
    expectTypeOf<'/no-such-screen'>().not.toExtend<AppHref>();
    expectTypeOf<'/school/7'>().toExtend<AppHref<'web'>>();
    expectTypeOf<'/self/wisdom/[id]'>().toExtend<RoutePattern>();
  });
});
