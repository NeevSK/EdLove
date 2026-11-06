import { describe, expect, it } from 'vitest';
import {
  classifyGurudeviHost,
  EXPLORE_GURUDEVI_HOST,
  isLocalPreviewHost,
  isSanctuaryPath,
  PUBLIC_GURUDEVI_HOST,
  resolveHostRouting,
  SANCTUARY_GURUDEVI_HOST,
} from './host-routing';

describe('Gurudevi hostname policy', () => {
  it('recognizes all canonical production hosts', () => {
    expect(classifyGurudeviHost('GURUDEVI.APP.')).toBe('public');
    expect(classifyGurudeviHost(SANCTUARY_GURUDEVI_HOST)).toBe('sanctuary');
    expect(classifyGurudeviHost(EXPLORE_GURUDEVI_HOST)).toBe('explore');
    expect(classifyGurudeviHost('localhost')).toBe('public');
    expect(classifyGurudeviHost('custom-proxy.internal')).toBe('other');
  });

  it('recognizes local preview hosts without changing production host classification', () => {
    expect(isLocalPreviewHost('localhost:3000')).toBe(true);
    expect(isLocalPreviewHost('127.0.0.1:3000')).toBe(true);
    expect(isLocalPreviewHost('[::1]:3000')).toBe(true);
    expect(isLocalPreviewHost('explore.gurudevi.app')).toBe(false);
    expect(classifyGurudeviHost('localhost')).toBe('public');
    expect(classifyGurudeviHost('custom-proxy.internal')).toBe('other');
    expect(classifyGurudeviHost('sanctuary.localhost:3000')).toBe('sanctuary');
    expect(classifyGurudeviHost('explore.localhost:3000')).toBe('explore');
  });

  it('routes browser auth and product paths to Sanctuary', () => {
    expect(isSanctuaryPath('/auth/complete')).toBe(true);
    expect(isSanctuaryPath('/self/journal')).toBe(true);
    expect(isSanctuaryPath('/api/community/groups')).toBe(true);
    expect(isSanctuaryPath('/kit')).toBe(true);
    expect(isSanctuaryPath('/icon-lab')).toBe(true);
    expect(isSanctuaryPath('/verger-lab')).toBe(true);
    expect(resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/sign-in', 'GET')).toEqual({
      kind: 'redirect',
      host: SANCTUARY_GURUDEVI_HOST,
    });
  });

  it('retires legacy Explore routes instead of retaining a second route family', () => {
    expect(isSanctuaryPath('/explore')).toBe(false);
    expect(resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/explore/self', 'GET')).toEqual({
      kind: 'not-found',
    });
    expect(resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/explore', 'HEAD')).toEqual({
      kind: 'not-found',
    });
    expect(resolveHostRouting('platform.gurudevi.app', '/', 'GET')).toEqual({
      kind: 'redirect',
      host: SANCTUARY_GURUDEVI_HOST,
      pathname: '/welcome',
    });
    expect(resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/', 'GET')).toEqual({
      kind: 'redirect',
      host: SANCTUARY_GURUDEVI_HOST,
      pathname: '/welcome',
    });
    expect(resolveHostRouting('gurudevi.lk', '/anything', 'GET')).toEqual({
      kind: 'redirect',
      host: PUBLIC_GURUDEVI_HOST,
    });
  });

  describe('Explore host — allowlist routing (R3 security hardening)', () => {
    it('rewrites root to /welcome', () => {
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/', 'GET')).toEqual({
        kind: 'rewrite',
        pathname: '/welcome',
      });
    });

    it('allows explicitly listed demo paths', () => {
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/welcome', 'GET')).toEqual({ kind: 'allow' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/self', 'GET')).toEqual({ kind: 'allow' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/self/journal', 'GET')).toEqual({ kind: 'allow' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/badge.svg', 'GET')).toEqual({ kind: 'allow' });
    });

    it('blocks sanctuary-authenticated routes that were previously allowed (allowlist fix)', () => {
      // These were allowed under the old blocklist model — they must now be blocked.
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/workspace', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/profile', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/settings', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/notifications', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/community', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/library', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/admin', 'GET')).toEqual({ kind: 'not-found' });
    });

    it('blocks API and auth paths', () => {
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/api/identity', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/onboarding', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/recovery', 'GET')).toEqual({ kind: 'not-found' });
    });

    it('redirects auth flows to sanctuary (not served on explore)', () => {
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/sign-in', 'GET')).toEqual({
        kind: 'redirect',
        host: SANCTUARY_GURUDEVI_HOST,
        pathname: '/sign-in',
      });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/sign-up', 'GET')).toEqual({
        kind: 'redirect',
        host: SANCTUARY_GURUDEVI_HOST,
        pathname: '/sign-up',
      });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/auth/complete', 'GET')).toEqual({
        kind: 'redirect',
        host: SANCTUARY_GURUDEVI_HOST,
        pathname: '/auth/complete',
      });
    });

    it('blocks all non-GET/HEAD methods on explore host', () => {
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/self', 'POST')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/welcome', 'PUT')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/', 'DELETE')).toEqual({ kind: 'not-found' });
    });

    it('allows developer labs on local preview hosts while blocking them on production explore', () => {
      // In local preview, engineers can test UI kit and labs across surfaces
      expect(resolveHostRouting('explore.localhost:3000', '/kit', 'GET')).toEqual({ kind: 'allow' });
      expect(resolveHostRouting('sanctuary.localhost:3000', '/kit', 'GET')).toEqual({ kind: 'allow' });
      expect(resolveHostRouting('sanctuary.localhost:3000', '/icon-lab', 'GET')).toEqual({ kind: 'allow' });

      // In production explore, UI kit and labs remain strictly not-found
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/kit', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/icon-lab', 'GET')).toEqual({ kind: 'not-found' });
    });

    it('blocks any future routes not in the allowlist by default', () => {
      // These do not exist — simulating a developer adding a new sanctuary route
      // without thinking about explore. They must be blocked without any explicit action.
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/gradebook', 'GET')).toEqual({ kind: 'not-found' });
      expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/unknown-future-surface', 'GET')).toEqual({ kind: 'not-found' });
    });
  });

  it('routes public content back to the public origin', () => {
    expect(isSanctuaryPath('/journal/first-entry')).toBe(false);
    expect(resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/privacy', 'HEAD')).toEqual({
      kind: 'redirect',
      host: PUBLIC_GURUDEVI_HOST,
    });
  });

  it('does not alter preview or local development host behavior', () => {
    expect(resolveHostRouting('localhost', '/self', 'GET')).toEqual({ kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST });
    expect(resolveHostRouting('localhost', '/privacy', 'GET')).toEqual({ kind: 'allow' });
    expect(resolveHostRouting('branch-preview.example.com', '/privacy', 'GET')).toEqual({
      kind: 'allow',
    });
  });

  it('does not replay unsafe cross-origin requests', () => {
    expect(resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/auth/signout', 'POST')).toEqual({
      kind: 'not-found',
    });
    expect(resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/support', 'POST')).toEqual({
      kind: 'not-found',
    });
  });

  it('allows .well-known verification endpoints directly on all hosts without redirection', () => {
    expect(
      resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/.well-known/assetlinks.json', 'GET'),
    ).toEqual({ kind: 'allow' });
    expect(resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/.well-known/assetlinks.json', 'GET')).toEqual(
      { kind: 'allow' },
    );
    expect(
      resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/.well-known/apple-app-site-association', 'GET'),
    ).toEqual({ kind: 'allow' });
  });

  describe('School subdomain routing + anti-squatting (R5 hardening)', () => {
    it('recognizes and routes school vanity subdomains to dynamic school profiles', () => {
      expect(classifyGurudeviHost('ananda.gurudevi.app')).toBe('school');
      expect(classifyGurudeviHost('royal-college.gurudevi.app')).toBe('school');
      expect(classifyGurudeviHost('sanctuary.gurudevi.app')).toBe('sanctuary');

      expect(resolveHostRouting('ananda.gurudevi.app', '/', 'GET')).toEqual({
        kind: 'rewrite',
        pathname: '/school/ananda',
      });

      expect(resolveHostRouting('ananda.gurudevi.app', '/workspace/school', 'GET')).toEqual({
        kind: 'redirect',
        host: SANCTUARY_GURUDEVI_HOST,
        pathname: '/workspace/school',
      });

      expect(resolveHostRouting('ananda.gurudevi.app', '/articles/sports-2026', 'GET')).toEqual({
        kind: 'rewrite',
        pathname: '/school/ananda/articles/sports-2026',
      });

      expect(resolveHostRouting('ananda.gurudevi.app', '/school/ananda', 'GET')).toEqual({
        kind: 'allow',
      });

      expect(resolveHostRouting('ananda.gurudevi.app', '/', 'POST')).toEqual({
        kind: 'not-found',
      });
    });

    it('blocks school subdomain squatting with reserved names (R5)', () => {
      // These look like system subdomains and must not be registerable as schools.
      expect(classifyGurudeviHost('login.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('account.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('my.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('app.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('cdn.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('static.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('help.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('docs.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('security.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('dev.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('staging.gurudevi.app')).toBe('other');
      expect(classifyGurudeviHost('beta.gurudevi.app')).toBe('other');
    });
  });
});
