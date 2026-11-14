import { describe, expect, it } from 'vitest';
import { admitsAppRoutes, type RouteDecision } from './bootstrapRoutes';

describe('admitsAppRoutes / G1', () => {
  it.each([
    ['app', true],
    ['booting', true],
    ['public', false],
    ['inactive-account', false],
    ['onboarding', false],
  ] as const satisfies readonly (readonly [RouteDecision, boolean])[])(
    '%s admits the app routes: %s',
    (decision, admitted) => {
      expect(admitsAppRoutes(decision)).toBe(admitted);
    },
  );
});
