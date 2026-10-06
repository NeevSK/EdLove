import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

describe('Next host proxy', () => {
  it('preserves path and query when moving a safe request to Sanctuary', async () => {
    const response = await proxy(
      new NextRequest('https://gurudevi.app/sign-in?returnTo=%2Fself'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://sanctuary.gurudevi.app/sign-in?returnTo=%2Fself',
    );
  });

  it('does not replay an unsafe request on a different origin', async () => {
    const response = await proxy(
      new NextRequest('https://gurudevi.app/auth/signout', { method: 'POST' }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('location')).toBeNull();
  });
});
