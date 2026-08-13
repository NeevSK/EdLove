import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('profile navigation contracts', () => {
  it('canonicalizes settings navigation while retaining the profile compatibility surface', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ProfileNavigationContext.tsx'), 'utf8');

    expect(source).toContain("export const PROFILE_SETTINGS_ROUTE = '/settings'");
    expect(source).toContain('router.push(PROFILE_SETTINGS_ROUTE)');
    expect(source).not.toContain("openSettings: () => router.push('/profile/settings')");
  });
});
