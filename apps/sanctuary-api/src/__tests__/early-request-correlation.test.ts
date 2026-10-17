import './setup';
import { describe, expect, it } from 'vitest';
import { app } from '../core/app';

describe('early API rejection correlation', () => {
  it.each([undefined, 'synthetic-request', 'invalid request?'])(
    'correlates body-limit rejection with incoming request ID %s',
    async (incoming) => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (incoming) headers.set('X-Request-Id', incoming);
      const response = await app.request('/api/self/burnJournal', {
        method: 'POST',
        headers,
        body: 'x'.repeat(6 * 1024 * 1024),
      });

      expect(response.status).toBe(413);
      const requestId = response.headers.get('X-Request-Id');
      if (incoming === 'synthetic-request') {
        expect(requestId).toBe(incoming);
      } else {
        expect(requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      }
    },
  );
});
