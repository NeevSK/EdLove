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
    expect(response.headers.get('cross-origin-opener-policy')).toBe('same-origin-allow-popups');
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
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qzoawolfkuwiuyaoiybz.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

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

  it('allows explore guest showroom routes (workspace, community, library, settings, profile)', async () => {
    const workspaceRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/workspace'),
    );
    expect(workspaceRes.status).toBe(200);

    const communityRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/community'),
    );
    expect(communityRes.status).toBe(200);

    const libraryRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/library'),
    );
    expect(libraryRes.status).toBe(200);

    const supportRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/support'),
    );
    expect(supportRes.status).toBe(200);
  });

  it('gracefully redirects private sanctuary-only routes on explore host to sanctuary.gurudevi.app/welcome gateway', async () => {
    const adminRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/admin'),
    );
    expect(adminRes.status).toBe(307);
    expect(adminRes.headers.get('location')).toBe('https://sanctuary.gurudevi.app/welcome?returnTo=%2Fadmin');
  });

  it('allows explore showroom sub-floors with case-insensitive and trailing slash tolerance', async () => {
    const timetableRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/workspace/timetable'),
    );
    expect(timetableRes.status).toBe(200);

    const trailingSlashRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/Workspace/'),
    );
    expect(trailingSlashRes.status).toBe(200);
  });

  it('rewrites unknown unmapped routes on explore host to /not-found with 404 status', async () => {
    const response = await proxy(
      new NextRequest('https://explore.gurudevi.app/unmapped-route-xyz'),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('x-middleware-rewrite')).toContain('/not-found');
  });

  it('allows the Tutti interactive walkthrough tour (/intro) on explore, sanctuary, and public', async () => {
    const exploreIntro = await proxy(
      new NextRequest('https://explore.gurudevi.app/intro'),
    );
    expect(exploreIntro.status).toBe(200);

    const sanctuaryIntro = await proxy(
      new NextRequest('https://sanctuary.gurudevi.app/intro'),
    );
    expect(sanctuaryIntro.status).toBe(200);

    const publicIntro = await proxy(
      new NextRequest('https://gurudevi.app/intro'),
    );
    expect(publicIntro.status).toBe(200);
  });

  it('redirects public legal and informational paths on explore non-discriminatorily to gurudevi.app', async () => {
    const privacyRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/privacy'),
    );
    expect(privacyRes.status).toBe(307);
    expect(privacyRes.headers.get('location')).toBe('https://gurudevi.app/privacy');

    const termsRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/terms'),
    );
    expect(termsRes.status).toBe(307);
    expect(termsRes.headers.get('location')).toBe('https://gurudevi.app/terms');

    const faqRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/faq'),
    );
    expect(faqRes.status).toBe(307);
    expect(faqRes.headers.get('location')).toBe('https://gurudevi.app/faq');
  });

  it('returns RFC 7807 problem details JSON when unmapped API or JSON request 404s', async () => {
    const apiRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/api/unmapped-endpoint', {
        headers: { accept: 'application/json' },
      }),
    );
    expect(apiRes.status).toBe(404);
    expect(apiRes.headers.get('content-type')).toContain('application/problem+json');
    const json = await apiRes.json();
    expect(json.title).toBe('Not Found');
    expect(json.status).toBe(404);
  });

  it('differentiates Cache-Control headers between public CDN edge and private sanctuary/explore', async () => {
    const publicRes = await proxy(new NextRequest('https://gurudevi.app/'));
    expect(publicRes.headers.get('cache-control')).toContain('public');
    expect(publicRes.headers.get('cache-control')).toContain('s-maxage=86400');

    const sanctuaryRes = await proxy(new NextRequest('https://sanctuary.gurudevi.app/workspace'));
    expect(sanctuaryRes.headers.get('cache-control')).toContain('no-store');

    const exploreRes = await proxy(new NextRequest('https://explore.gurudevi.app/workspace'));
    expect(exploreRes.headers.get('cache-control')).toContain('no-store');
  });

  it('responds to CORS OPTIONS preflight requests with 204 No Content and appropriate headers', async () => {
    const optionsRes = await proxy(
      new NextRequest('https://explore.gurudevi.app/workspace', {
        method: 'OPTIONS',
        headers: {
          origin: 'https://explore.gurudevi.app',
        },
      }),
    );
    expect(optionsRes.status).toBe(204);
    expect(optionsRes.headers.get('access-control-allow-methods')).toContain('OPTIONS');
    expect(optionsRes.headers.get('access-control-max-age')).toBe('86400');
  });

  it('safely extracts validated host from X-Forwarded-Host behind trusted reverse proxies', async () => {
    const forwardedRes = await proxy(
      new NextRequest('http://cluster-internal.local/self', {
        headers: {
          host: 'cluster-internal.local',
          'x-forwarded-host': 'explore.gurudevi.app:443',
        },
      }),
    );
    // Should route to explore showroom /self without being classified as 'other'
    expect(forwardedRes.status).toBe(200);
    expect(forwardedRes.headers.get('cache-control')).toContain('no-store');
  });

  it('rejects spoofed X-Forwarded-Host headers and falls back closed to public host', async () => {
    const spoofedRes = await proxy(
      new NextRequest('http://cluster-internal.local/self', {
        headers: {
          host: 'cluster-internal.local',
          'x-forwarded-host': 'attacker.evil.com',
        },
      }),
    );
    // Rejected candidate falls back closed to gurudevi.app.
    // Visiting /self on public marketing redirects to sanctuary.gurudevi.app/self
    expect(spoofedRes.status).toBe(307);
    expect(spoofedRes.headers.get('location')).toBe('https://sanctuary.gurudevi.app/self');
  });
});
