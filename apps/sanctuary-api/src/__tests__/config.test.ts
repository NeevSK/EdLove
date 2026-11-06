import { describe, expect, it } from 'vitest';
import { readServerConfig } from '../config';

describe('foundation configuration admission', () => {
  it.each([
    { API_REQUEST_TIMEOUT_MS: '0' },
    { API_STREAM_TIMEOUT_MS: 'Infinity' },
    { SHUTDOWN_TIMEOUT_MS: '-1' },
    { NODE_REQUEST_TIMEOUT_MS: '600001' },
    { NODE_KEEP_ALIVE_TIMEOUT_MS: '1.5' },
    { NODE_HEADERS_TIMEOUT_MS: '40000', NODE_REQUEST_TIMEOUT_MS: '30000' },
    { NODE_MAX_HEADER_BYTES: '999999' },
    { NODE_MAX_HEADERS: '0' },
    { NODE_ENV: 'prod' },
    { API_AUTHENTICATION: 'required' },
    { DB_POOL_MAX: '0' },
    { API_ACCOUNT_REQUESTS_PER_MINUTE: '0' },
    { API_MAX_UNKNOWN_LENGTH_REQUESTS: '0' },
    { API_MAX_UNKNOWN_LENGTH_REQUESTS: '1001' },
    { API_MAX_AUTHENTICATION_REQUESTS: '0' },
    { API_MAX_AUTHENTICATION_REQUESTS: '1001' },
    { API_MAX_IN_FLIGHT_REQUESTS: '0' },
    { API_BROWSER_ORIGINS: 'https://web.example/path' },
    { API_BROWSER_ORIGINS: 'not a url' },
    { API_MAX_IN_FLIGHT_REQUESTS: '1001' },
    { API_MAX_IN_FLIGHT_REQUESTS: '1.5' },
  ])('rejects invalid budgets %j', (environment) => {
    expect(() => readServerConfig(environment)).toThrow();
  });

  it('ignores unrelated environment values without returning credentials', () => {
    const config = readServerConfig({
      PRIVATE_SECRET: 'not-public',
      API_REQUEST_TIMEOUT_MS: '500',
    });
    expect(config.API_REQUEST_TIMEOUT_MS).toBe(500);
    expect(config).not.toHaveProperty('PRIVATE_SECRET');
  });

  it.each([{ NODE_ENV: 'production' }, { NODE_ENV: 'production', API_AUTHENTICATION: 'disabled' }])(
    'rejects production without required authentication: %j',
    (environment) => {
      expect(() => readServerConfig(environment)).toThrow();
    },
  );

  it.each(['development', 'test'])('allows disabled authentication in %s', (NODE_ENV) => {
    expect(readServerConfig({ NODE_ENV, API_AUTHENTICATION: 'disabled' }).API_AUTHENTICATION).toBe(
      'disabled',
    );
  });

  it('admits production with complete required authentication configuration', () => {
    expect(
      readServerConfig({
        NODE_ENV: 'production',
        API_AUTHENTICATION: 'required',
        DATABASE_URL: 'postgresql://localhost/api',
        AUTH_ISSUER: 'https://auth.example.test',
        AUTH_JWKS_URL: 'https://auth.example.test/jwks',
        AUTH_AUDIENCE: 'api',
        SNAPSHOT_SIGNING_PRIVATE_KEY: 'pkcs8-pem',
      }).API_AUTHENTICATION,
    ).toBe('required');
  });

  it('rejects production without the permission snapshot signing key', () => {
    expect(() =>
      readServerConfig({
        NODE_ENV: 'production',
        API_AUTHENTICATION: 'required',
        DATABASE_URL: 'postgresql://localhost/api',
        AUTH_ISSUER: 'https://auth.example.test',
        AUTH_JWKS_URL: 'https://auth.example.test/jwks',
        AUTH_AUDIENCE: 'api',
      }),
    ).toThrow(/snapshot signing key/);
  });
});
