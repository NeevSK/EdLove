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

  it('rewrites Explore root to /welcome', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3210/', {
        headers: { host: 'explore.gurudevi.app:3210' },
      }),
    );

    expect(response.headers.get('x-middleware-rewrite')).toContain('/welcome');
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

  it('redirects sanctuary paths on localhost root to sanctuary.localhost', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3000/self', {
        headers: { host: 'localhost:3000' },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://sanctuary.localhost:3000/self');
  });

  it('redirects sign-in on explore.localhost to sanctuary.localhost', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3000/sign-in', {
        headers: { host: 'explore.localhost:3000' },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://sanctuary.localhost:3000/sign-in');
  });

  it('redirects sanctuary paths on production public root to sanctuary.gurudevi.app', async () => {
    const response = await proxy(new NextRequest('https://gurudevi.app/self'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://sanctuary.gurudevi.app/self');
  });

  it('redirects sign-in on production explore.gurudevi.app to sanctuary.gurudevi.app', async () => {
    const response = await proxy(new NextRequest('https://explore.gurudevi.app/sign-in'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://sanctuary.gurudevi.app/sign-in');
  });

  it('redirects production sanctuary root to /welcome', async () => {
    const response = await proxy(new NextRequest('https://sanctuary.gurudevi.app/'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://sanctuary.gurudevi.app/welcome');
  });

  it('redirects public marketing requests on sanctuary to gurudevi.app', async () => {
    const response = await proxy(new NextRequest('https://sanctuary.gurudevi.app/about'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://gurudevi.app/about');
  });

  it('enforces clickjacking defense and MIME sniffing protection headers', async () => {
    const response = await proxy(
      new NextRequest('https://sanctuary.gurudevi.app/workspace'),
    );

    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('strict-transport-security')).toContain('max-age=63072000');
  });

  it('enforces restrictive Content-Security-Policy on Explore without external backend origins (R2)', async () => {
    const response = await proxy(
      new NextRequest('http://localhost:3210/self', {
        headers: { host: 'explore.gurudevi.app:3210' },
      }),
    );

    const csp = response.headers.get('content-security-policy') ?? '';
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain('supabase.co');
  });

  it('dynamically permits configured auth and API origins in Content-Security-Policy on Sanctuary (R2)', async () => {
    const response = await proxy(
      new NextRequest('https://sanctuary.gurudevi.app/workspace'),
    );

    const csp = response.headers.get('content-security-policy') ?? '';
    // Derives dynamically from active environment rather than hardcoding static vendor strings
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain('https://qzoawolfkuwiuyaoiybz.supabase.co');
    expect(csp).toContain('wss://qzoawolfkuwiuyaoiybz.supabase.co');
  });

  it('amputates all platform session cookies (vendor and generic) when hitting Explore host (R1)', async () => {
    const request = new NextRequest('http://localhost:3210/self', {
      headers: {
        host: 'explore.gurudevi.app:3210',
        cookie: 'sb-access-token=jwt; auth-token=token; gd_session=sess; theme=dark',
      },
    });

    const response = await proxy(request);
    const setCookieHeaders = response.headers.getSetCookie();

    // sb-*, auth-*, and gd_session cookies must all have max-age=0 / expired
    const expiredSb = setCookieHeaders.find((c) => c.includes('sb-access-token='));
    const expiredAuth = setCookieHeaders.find((c) => c.includes('auth-token='));
    const expiredGd = setCookieHeaders.find((c) => c.includes('gd_session='));

    expect(expiredSb).toBeDefined();
    expect(expiredSb).toContain('Max-Age=0');

    expect(expiredAuth).toBeDefined();
    expect(expiredAuth).toContain('Max-Age=0');

    expect(expiredGd).toBeDefined();
    expect(expiredGd).toContain('Max-Age=0');
  });
});
