import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('onboarding capability state', () => {
  it('keeps the entry route explicit without importing retired onboarding workflows', () => {
    const route = fs.readFileSync(path.join(APP_ROOT, 'app/onboarding.tsx'), 'utf8');
    expect(route).toContain('Account setup is unavailable');
    expect(route).toContain('No setup changes were made');
    expect(route).not.toContain('OnboardingWrapper');
    expect(route).not.toContain('@repo/core');
  });
});
