import { describe, expect, it } from 'vitest';
import {
  PUBLIC_GURUDEVI_HOST,
  SANCTUARY_GURUDEVI_HOST,
  classifyGurudeviHost,
  isSanctuaryPath,
  resolveHostRouting,
} from './host-routing';

describe('Gurudevi hostname policy', () => {
  it('recognizes only the two canonical production hosts', () => {
    expect(classifyGurudeviHost('GURUDEVI.APP.')).toBe('public');
    expect(classifyGurudeviHost(SANCTUARY_GURUDEVI_HOST)).toBe('sanctuary');
    expect(classifyGurudeviHost('localhost')).toBe('other');
  });

  it('routes browser auth and product paths to Sanctuary', () => {
    expect(isSanctuaryPath('/auth/complete')).toBe(true);
    expect(isSanctuaryPath('/explore/self')).toBe(true);
    expect(isSanctuaryPath('/self/journal')).toBe(true);
    expect(isSanctuaryPath('/api/community/groups')).toBe(true);
    expect(resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/sign-in', 'GET')).toEqual({
      kind: 'redirect',
      host: SANCTUARY_GURUDEVI_HOST,
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
});
