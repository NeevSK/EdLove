import { describe, expect, it, vi } from 'vitest';
import { CompositeAuthProvider } from '../core/adapters/CompositeAuthProvider';
import { CompositeDatabaseProvider } from '../core/adapters/CompositeDatabaseProvider';
import { DatabricksAuthAdapter } from '../core/adapters/DatabricksAuthAdapter';
import { NeonAuthAdapter } from '../core/adapters/NeonAuthAdapter';

describe('Hexagonal Identity & Database Adapters', () => {
  describe('DatabricksAuthAdapter', () => {
    const adapter = new DatabricksAuthAdapter();

    it('identifies databricks provider name', () => {
      expect(adapter.providerName).toBe('databricks');
    });

    it('fails loudly until Databricks verification is implemented', async () => {
      const patToken = 'dapi_test_pat_token_1234567890abcdef';
      await expect(adapter.verifyToken(patToken)).rejects.toThrow(
        'DATABRICKS_AUTH_NOT_IMPLEMENTED',
      );
    });

    it('rejects invalid or non-databricks tokens', async () => {
      const invalidToken = 'invalid-token-string';
      await expect(adapter.verifyToken(invalidToken)).rejects.toThrow(
        'DATABRICKS_AUTH_NOT_IMPLEMENTED',
      );
    });
  });

  describe('NeonAuthAdapter', () => {
    const adapter = new NeonAuthAdapter();

    it('identifies neon provider name', () => {
      expect(adapter.providerName).toBe('neon');
    });

    it('refuses to treat an unsigned Neon payload as verification', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'neon-user-456',
          email: 'dev@neon.tech',
          iss: 'https://auth.neon.tech',
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString('base64url');
      const dummyToken = `${header}.${payload}.signature`;

      await expect(adapter.verifyToken(dummyToken)).rejects.toThrow('NEON_AUTH_NOT_IMPLEMENTED');
    });

    it('rejects expired tokens', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'neon-user-456',
          iss: 'https://auth.neon.tech',
          exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
        }),
      ).toString('base64url');
      const expiredToken = `${header}.${payload}.signature`;

      await expect(adapter.verifyToken(expiredToken)).rejects.toThrow('NEON_AUTH_NOT_IMPLEMENTED');
    });
  });

  describe('CompositeAuthProvider', () => {
    const composite = new CompositeAuthProvider('supabase');

    it('does not let a token prefix select a different trust authority', async () => {
      const configured = new CompositeAuthProvider();
      const verifyToken = vi.fn().mockResolvedValue(null);
      const databricks = vi.fn();
      configured.registerAdapter({ providerName: 'supabase', verifyToken });
      configured.registerAdapter({ providerName: 'databricks', verifyToken: databricks });
      const patToken = 'dapi_another_pat_token';
      expect(await configured.verifyToken(patToken)).toBeNull();
      expect(verifyToken).toHaveBeenCalledWith(patToken, undefined);
      expect(databricks).not.toHaveBeenCalled();
    });

    it('fails loudly when explicitly configured with unfinished Neon auth', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'neon-user-999',
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString('base64url');
      const token = `${header}.${payload}.sig`;

      await expect(composite.verifyToken(token, { AUTH_PROVIDER: 'neon' })).rejects.toThrow(
        'NEON_AUTH_NOT_IMPLEMENTED',
      );
    });

    it('does not try another verifier after the configured issuer rejects a forged JWT', async () => {
      const configured = new CompositeAuthProvider();
      const secondary = vi.fn().mockResolvedValue({ sub: 'victim', provider: 'neon' });
      configured.registerAdapter({
        providerName: 'supabase',
        verifyToken: vi.fn().mockResolvedValue(null),
      });
      configured.registerAdapter({ providerName: 'neon', verifyToken: secondary });
      const forged = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"sub":"victim"}').toString('base64url')}.forged`;
      expect(await configured.verifyToken(forged)).toBeNull();
      expect(secondary).not.toHaveBeenCalled();
    });

    it('rejects an unknown provider configuration instead of falling back', async () => {
      await expect(composite.verifyToken('token', { AUTH_PROVIDER: 'typo' })).rejects.toThrow(
        'AUTH_PROVIDER_NOT_CONFIGURED',
      );
    });
  });

  describe('CompositeDatabaseProvider', () => {
    const dbComposite = new CompositeDatabaseProvider();

    it('routes neon.tech URLs to NeonDatabaseAdapter', () => {
      const neonUrl = 'postgres://user:pass@ep-cool-branch.neon.tech/neondb?sslmode=require';
      expect(dbComposite.canConnect(neonUrl)).toBe(true);
      const client = dbComposite.getClient({ id: 'user-1', provider: 'neon' }, neonUrl);
      expect(client).not.toBeNull();
    });

    it('routes databricks URLs to DatabricksDatabaseAdapter', () => {
      const databricksUrl =
        'databricks://adb-123456789.azuredatabricks.net:443/sql/1.0/warehouses/abc';
      expect(dbComposite.canConnect(databricksUrl)).toBe(true);
      const client = dbComposite.getClient({ id: 'user-2', provider: 'databricks' }, databricksUrl);
      expect(client).not.toBeNull();
      expect(client.endpointUrl).toBe(databricksUrl);
    });

    it('routes standard postgres URLs to ZenStackDatabaseAdapter', () => {
      const pgUrl = 'postgresql://postgres:postgres@localhost:5432/sanctuary';
      expect(dbComposite.canConnect(pgUrl)).toBe(true);
      const client = dbComposite.getClient({ id: 'user-3', provider: 'supabase' }, pgUrl);
      expect(client).not.toBeNull();
    });
  });
});
