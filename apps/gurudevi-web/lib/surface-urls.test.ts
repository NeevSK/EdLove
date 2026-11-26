import { describe, expect, it } from 'vitest';
import { EDLOVE_URL, FOUNDER_URL, INTUITUI_URL } from '@repo/core/site';
import { EXTERNAL_LINK_PROPS, normalizeExternalUrl, resolveSurfaceUrl } from './surface-urls';

describe('Surface URLs Engine', () => {
  it('exports canonical external constants and security props', () => {
    expect(EDLOVE_URL).toBe('https://edlove.org');
    expect(INTUITUI_URL).toBe('https://intuituilabs.studio');
    expect(FOUNDER_URL).toBe('https://neevsk.intuituilabs.studio');
    expect(EXTERNAL_LINK_PROPS.target).toBe('_blank');
    expect(EXTERNAL_LINK_PROPS.rel).toBe('noopener noreferrer');
  });

  it('normalizes external URLs safely with fallback', () => {
    expect(normalizeExternalUrl('https://example.com')).toBe('https://example.com/');
    expect(normalizeExternalUrl('javascript:alert(1)')).toBe('https://edlove.org');
    expect(normalizeExternalUrl('not-a-valid-url')).toBe('https://edlove.org');
  });

  it('resolves production URLs when given production hosts', () => {
    const opts = { host: 'gurudevi.app', protocol: 'https:' };
    expect(resolveSurfaceUrl('public', '/', opts)).toBe('https://gurudevi.app/');
    expect(resolveSurfaceUrl('sanctuary', '/welcome', opts)).toBe(
      'https://sanctuary.gurudevi.app/welcome',
    );
    expect(resolveSurfaceUrl('explore', '/self', opts)).toBe('https://explore.gurudevi.app/self');
  });

  it('resolves local RFC 6761 URLs preserving port 3000', () => {
    const opts = { host: 'sanctuary.localhost:3000', protocol: 'http:' };
    expect(resolveSurfaceUrl('public', '/privacy', opts)).toBe(
      'http://localhost:3000/privacy',
    );
    expect(resolveSurfaceUrl('sanctuary', '/sign-in', opts)).toBe(
      'http://sanctuary.localhost:3000/sign-in',
    );
    expect(resolveSurfaceUrl('explore', '/self', opts)).toBe(
      'http://explore.localhost:3000/self',
    );
  });

  it('resolves local RFC 6761 URLs with custom dev port', () => {
    const opts = { host: 'localhost:8080', protocol: 'http:' };
    expect(resolveSurfaceUrl('explore', '/self', opts)).toBe(
      'http://explore.localhost:8080/self',
    );
    expect(resolveSurfaceUrl('sanctuary', '/welcome', opts)).toBe(
      'http://sanctuary.localhost:8080/welcome',
    );
  });
});
