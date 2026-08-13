import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '..');
const packageManifest = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
) as { exports: Record<string, unknown> };

describe('community capability entry points', () => {
  it('publishes the complete capability surface', () => {
    expect(Object.keys(packageManifest.exports)).toEqual(
      expect.arrayContaining([
        './api',
        './announcements',
        './chat',
        './feed',
        './groups',
        './onboarding',
        './profile',
      ]),
    );
  });

  it('keeps each capability as a focused source module', () => {
    for (const entryPoint of ['announcements', 'chat', 'feed', 'groups', 'onboarding', 'profile']) {
      expect(readFileSync(resolve(packageRoot, 'src', `${entryPoint}.ts`), 'utf8')).toBeTruthy();
    }
    expect(readFileSync(resolve(packageRoot, 'src', 'api', 'index.ts'), 'utf8')).toBeTruthy();
  });
});
