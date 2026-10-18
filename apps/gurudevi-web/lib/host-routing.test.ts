import { describe, expect, it } from 'vitest';
import {
  classifyGurudeviHost,
  EXPLORE_GURUDEVI_HOST,
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
    expect(classifyGurudeviHost('localhost')).toBe('other');
  });

  it('routes browser auth and product paths to Sanctuary', () => {
    expect(isSanctuaryPath('/auth/complete')).toBe(true);
    expect(isSanctuaryPath('/self/journal')).toBe(true);
    expect(isSanctuaryPath('/api/community/groups')).toBe(true);
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
      pathname: '/self',
    });
    expect(resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/', 'GET')).toEqual({
      kind: 'redirect',
      host: SANCTUARY_GURUDEVI_HOST,
      pathname: '/self',
    });
    expect(resolveHostRouting('gurudevi.lk', '/anything', 'GET')).toEqual({
      kind: 'redirect',
      host: PUBLIC_GURUDEVI_HOST,
    });
  });

  it('maps Explore-only GET requests to canonical routes and denies privileged paths', () => {
    expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/', 'GET')).toEqual({
      kind: 'rewrite',
      pathname: '/self',
    });
    expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/self', 'GET')).toEqual({
      kind: 'allow',
    });
    expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/workspace', 'GET')).toEqual({
      kind: 'allow',
    });
    expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/api/identity', 'GET')).toEqual({
      kind: 'not-found',
    });
    expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/sign-in', 'GET')).toEqual({
      kind: 'redirect',
      host: SANCTUARY_GURUDEVI_HOST,
      pathname: '/sign-in',
    });
    expect(resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/self', 'POST')).toEqual({
      kind: 'not-found',
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
    expect(resolveHostRouting('localhost', '/self', 'GET')).toEqual({ kind: 'allow' });
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
});
