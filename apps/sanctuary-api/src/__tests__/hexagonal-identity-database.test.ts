import { describe, expect, it } from 'vitest';
import { CompositeAuthProvider } from '../core/adapters/CompositeAuthProvider';
import { CompositeDatabaseProvider } from '../core/adapters/CompositeDatabaseProvider';
import { DatabricksAuthAdapter } from '../core/adapters/DatabricksAuthAdapter';
import { NeonAuthAdapter } from '../core/adapters/NeonAuthAdapter';
import { SupabaseAuthAdapter } from '../core/adapters/SupabaseAuthAdapter';

describe('Hexagonal Identity & Database Adapters', () => {
  describe('DatabricksAuthAdapter', () => {
    const adapter = new DatabricksAuthAdapter();

    it('identifies databricks provider name', () => {
      expect(adapter.providerName).toBe('databricks');
    });

    it('verifies Databricks Personal Access Tokens (PAT)', async () => {
      const patToken = 'dapi_test_pat_token_1234567890abcdef';
      const result = await adapter.verifyToken(patToken);
      expect(result).not.toBeNull();
      expect(result?.provider).toBe('databricks');
      expect(result?.role).toBe('service-principal');
      expect(result?.sub).toContain('databricks-pat-');
    });

    it('rejects invalid or non-databricks tokens', async () => {
      const invalidToken = 'invalid-token-string';
      const result = await adapter.verifyToken(invalidToken);
      expect(result).toBeNull();
    });
  });

  describe('NeonAuthAdapter', () => {
    const adapter = new NeonAuthAdapter();

    it('identifies neon provider name', () => {
      expect(adapter.providerName).toBe('neon');
    });

    it('verifies a valid Neon JWT payload structure', async () => {
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

      const result = await adapter.verifyToken(dummyToken);
      expect(result).not.toBeNull();
      expect(result?.provider).toBe('neon');
      expect(result?.sub).toBe('neon-user-456');
      expect(result?.email).toBe('dev@neon.tech');
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

      const result = await adapter.verifyToken(expiredToken);
      expect(result).toBeNull();
    });
  });

  describe('CompositeAuthProvider', () => {
    const composite = new CompositeAuthProvider('supabase');

    it('routes dapi tokens to DatabricksAuthAdapter', async () => {
      const patToken = 'dapi_another_pat_token';
      const result = await composite.verifyToken(patToken);
      expect(result?.provider).toBe('databricks');
    });

    it('routes explicit AUTH_PROVIDER env hints', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'neon-user-999',
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString('base64url');
      const token = `${header}.${payload}.sig`;

      const result = await composite.verifyToken(token, { AUTH_PROVIDER: 'neon' });
      expect(result?.provider).toBe('neon');
      expect(result?.sub).toBe('neon-user-999');
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
      const databricksUrl = 'databricks://adb-123456789.azuredatabricks.net:443/sql/1.0/warehouses/abc';
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
