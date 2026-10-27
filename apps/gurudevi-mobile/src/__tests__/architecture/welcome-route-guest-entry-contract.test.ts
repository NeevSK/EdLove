import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const welcomeRoutePath = resolve(import.meta.dirname, '../../../app/welcome.tsx');
const welcomeRoute = readFileSync(welcomeRoutePath, 'utf8');

describe('welcome route guest-entry contract', () => {
  it('delegates the native Sanctuary guest action to the offline-first route handler', () => {
    expect(welcomeRoute).toMatch(
      /<SanctuaryWelcomeScreen[\s\S]*?onStartGuest=\{handleStartGuest\}[\s\S]*?\/>/,
    );
  });

  it('falls back from unavailable anonymous auth to a persisted device-local guest session', () => {
    expect(welcomeRoute).toContain('await authAPI.signInAnonymously()');
    expect(welcomeRoute).toContain('await getOrCreateLocalGuestSession()');
    expect(welcomeRoute).toContain("router.push('/onboarding?entry=guest')");
  });
});
