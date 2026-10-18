import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

describe('Next host proxy', () => {
  it('preserves path and query when moving a safe request to Sanctuary', async () => {
    const response = await proxy(new NextRequest('https://gurudevi.app/sign-in?returnTo=%2Fself'));

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

  it('allows public Explore paths without refreshing a Sanctuary session', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3210/self', {
        headers: { host: 'explore.gurudevi.app:3210' },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('rewrites Explore root to /self', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3210/', {
        headers: { host: 'explore.gurudevi.app:3210' },
      }),
    );

    expect(response.headers.get('x-middleware-rewrite')).toContain('/self');
  });

  it('does not route from forwarded host when the direct Host header is unrelated', async () => {
    const response = await proxy(
      new NextRequest('https://gurudevi.app/sign-in', {
        headers: { host: 'untrusted.example', 'x-forwarded-host': 'explore.gurudevi.app' },
      }),
    );

    expect(response.headers.get('location')).toBeNull();
  });

  it('does not redirect .well-known verification files across hosts', async () => {
    const response = await proxy(
      new NextRequest('https://sanctuary.gurudevi.app/.well-known/assetlinks.json'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
