import { describe, expect, it } from 'vitest';

import { isAllowedExternalUri } from './linking';

describe('external URI policy', () => {
  it.each([
    'https://example.com/path?q=1',
    'http://localhost:3000/dev',
    'http://127.0.0.1:8081/dev',
    'gurudevi://auth/callback',
    'mailto:support@gurudevi.edlove.org',
    'tel:+94770000000',
    'whatsapp://send?phone=94770000000',
  ])('accepts supported URI: %s', (uri) => {
    expect(isAllowedExternalUri(uri)).toBe(true);
  });

  it.each([
    'http://example.com/insecure',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'edlove://auth/callback',
    'not a URI',
  ])('rejects unsafe or malformed URI: %s', (uri) => {
    expect(isAllowedExternalUri(uri)).toBe(false);
  });
});
