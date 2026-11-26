import { describe, expect, it } from 'vitest';
import {
  architectureSourcePlugin,
  findRepoRoot,
  readArchitectureSource,
} from './architectureSource';

const root = findRepoRoot();

describe('Architecture explorer source reader (G1 / Vitest; real repository files)', () => {
  it('rejects a missing path', () => {
    expect(readArchitectureSource(null, root)).toEqual({
      status: 400,
      body: { error: 'Missing path parameter' },
    });
  });

  it('rejects traversal and absolute paths', () => {
    for (const p of ['../../../etc/passwd', '/etc/passwd']) {
      const answer = readArchitectureSource(p, root);
      expect(answer.status).toBe(400);
      expect(answer.body).toEqual({ error: 'Invalid path: traversal not allowed' });
    }
  });

  it('blocks sensitive files (.env, keys, credentials)', () => {
    for (const p of [
      '.env',
      '.env.local',
      '.env.production',
      'apps/gurudevi-web/.env',
      'config/credentials.json',
      'certs/server.key',
      'id_rsa',
      'secrets.txt',
    ]) {
      expect(readArchitectureSource(p, root)).toEqual({
        status: 403,
        body: { error: 'Access denied: protected file' },
      });
    }
  });

  it('answers 404 for a file that does not exist', () => {
    const answer = readArchitectureSource('packages/core/does-not-exist.ts', root);
    expect(answer.status).toBe(404);
  });

  it('reads a real file with content, line count and size', () => {
    const answer = readArchitectureSource(
      'packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts',
      root,
    );
    expect(answer.status).toBe(200);
    if (answer.status !== 200) return;
    expect(answer.body.loc).toBeGreaterThan(50);
    expect(answer.body.sizeBytes).toBeGreaterThan(100);
    expect(answer.body.content).toContain('useSanctuaryFeature');
  });

  it('exists only on the dev server, never in a build', () => {
    expect(architectureSourcePlugin().apply).toBe('serve');
  });
});
