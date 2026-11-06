import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { getFileSourceAction } from '../../../(sanctuary)/architecture/actions';

describe('GET /api/architecture/source and getFileSourceAction security', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('GET /api/architecture/source', () => {
    it('rejects missing path parameter with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/architecture/source');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Missing path');
    });

    it('rejects path traversal attacks with 400', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/architecture/source?path=../../../etc/passwd',
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('traversal not allowed');
    });

    it('blocks sensitive files (.env, keys, credentials) with 403', async () => {
      const forbiddenPaths = [
        '.env',
        '.env.local',
        '.env.production',
        'apps/gurudevi-web/.env',
        'config/credentials.json',
        'certs/server.key',
        'id_rsa',
        'secrets.txt',
      ];

      for (const p of forbiddenPaths) {
        const req = new NextRequest(`http://localhost:3000/api/architecture/source?path=${encodeURIComponent(p)}`);
        const res = await GET(req);
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toContain('Access denied: protected file');
      }
    });

    it('returns 404 in production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const req = new NextRequest(
        'http://localhost:3000/api/architecture/source?path=packages/core/package.json',
      );
      const res = await GET(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe('Endpoint unavailable');
    });

    it('returns 404 for non-existent file in development', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/architecture/source?path=packages/core/does-not-exist.ts',
      );
      const res = await GET(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toContain('File not found');
    });

    it('reads real substrate file with content, loc, and sizeBytes', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/architecture/source?path=packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.path).toBe(
        'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
      );
      expect(body.loc).toBeGreaterThan(50);
      expect(body.sizeBytes).toBeGreaterThan(100);
      expect(body.content).toContain('useSanctuaryFeature');
    });
  });

  describe('getFileSourceAction Server Action', () => {
    it('blocks traversal and absolute paths', async () => {
      const res1 = await getFileSourceAction('../../../etc/passwd');
      expect(res1.error).toContain('directory traversal or absolute path rejected');

      const res2 = await getFileSourceAction('/etc/passwd');
      expect(res2.error).toContain('directory traversal or absolute path rejected');
    });

    it('blocks sensitive files (.env, keys, credentials)', async () => {
      const res = await getFileSourceAction('.env.local');
      expect(res.error).toContain('Access denied: protected file');
    });

    it('is blocked in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const res = await getFileSourceAction('packages/core/package.json');
      expect(res.error).toBe('Endpoint unavailable in production environment');
    });
  });
});
