import { describe, expect, it } from 'vitest';
import { safeReturnPath, signInPath } from './routeSafety';

describe('safeReturnPath', () => {
  it('uses Self as the real-account default', () => {
    expect(safeReturnPath(null)).toBe('/self');
    expect(signInPath()).toBe('/sign-in?returnTo=%2Fself');
  });

  it('preserves a local account destination and its query', () => {
    expect(safeReturnPath('/workspace?date=2026-09-18')).toBe('/workspace?date=2026-09-18');
  });

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)'])(
    'rejects an external or ambiguous destination %s',
    (candidate) => {
      expect(safeReturnPath(candidate)).toBe('/self');
    },
  );
});
