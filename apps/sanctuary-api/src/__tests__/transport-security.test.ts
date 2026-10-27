import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { describe, expect, it } from 'vitest';
import { loadProductionTlsOptions, loadServerTlsOptions } from '../core/nodeTransport';
import {
  requireHttpsMiddleware,
  resolveAllowedCorsOrigin,
  resolveTlsTerminationMode,
} from '../core/transportSecurity';

function createProbeApp(
  nodeEnv: string | undefined,
  onHandler: () => void,
  tlsTermination: 'direct' | 'render' = 'direct',
) {
  const probe = new Hono<{ Variables: { requestId: string } }>();
  probe.use('*', requestId({ generator: () => 'generated-request-id' }));
  probe.use('*', secureHeaders());
  probe.use('*', requireHttpsMiddleware(nodeEnv, tlsTermination));
  probe.get('/health/live', (context) => context.json({ status: 'ok' }));
  probe.get('/health/ready', (context) => context.json({ status: 'ready' }));
  probe.post('/probe/:secretPath', async (context) => {
    onHandler();
    return context.json({ received: await context.req.json() });
  });
  return probe;
}

describe('HTTPS transport boundary', () => {
  it('allows HTTPS requests through to routes', async () => {
    let handlerCalls = 0;
    const app = createProbeApp('production', () => handlerCalls++);
    const response = await app.request(
      new Request('https://sanctuary.gurudevi.app/probe/known', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ proof: 'https' }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: { proof: 'https' } });
    expect(handlerCalls).toBe(1);
  });

  it('rejects HTTP before body parsing and route handlers, even with forged forwarding headers', async () => {
    let handlerCalls = 0;
    const app = createProbeApp('production', () => handlerCalls++);
    const response = await app.request(
      new Request('http://sanctuary.gurudevi.app/probe/private-value', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-proto': 'https' },
        body: '{invalid json',
      }),
    );
    const responseText = await response.text();

    expect(response.status).toBe(400);
    expect(response.headers.get('x-request-id')).toBe('generated-request-id');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(responseText).toContain('HTTPS_REQUIRED');
    expect(responseText).not.toContain('private-value');
    expect(handlerCalls).toBe(0);
  });

  it('rejects production localhost requests', async () => {
    const app = createProbeApp('production', () => undefined);
    const response = await app.request('http://localhost:3000/probe/health');

    expect(response.status).toBe(400);
  });

  it('retains HTTP localhost requests in test mode', async () => {
    const app = createProbeApp('test', () => undefined);
    const response = await app.request(
      new Request('http://localhost:3000/probe/health', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'test' }),
      }),
    );

    expect(response.status).toBe(200);
  });
});

describe('G1 explicit Render TLS termination / substituted platform environment', () => {
  const renderEnvironment = {
    NODE_ENV: 'production',
    SANCTUARY_TLS_TERMINATION: 'render',
    RENDER: 'true',
    RENDER_SERVICE_ID: 'srv-test-development',
  };

  it('keeps direct TLS as the default, including on Render without an explicit mode', () => {
    expect(resolveTlsTerminationMode({})).toBe('direct');
    expect(resolveTlsTerminationMode({ RENDER: 'true', RENDER_SERVICE_ID: 'srv-test' })).toBe(
      'direct',
    );
    expect(() => loadServerTlsOptions({ NODE_ENV: 'production' })).toThrow(
      'Production HTTPS requires',
    );
    expect(() => loadServerTlsOptions({})).toThrow('Production HTTPS requires');
  });

  it('starts without local TLS certificates only for an explicitly admitted Render runtime', () => {
    expect(resolveTlsTerminationMode(renderEnvironment)).toBe('render');
    expect(loadServerTlsOptions(renderEnvironment)).toBeUndefined();
    expect(loadServerTlsOptions({ NODE_ENV: 'development' })).toBeUndefined();
    expect(loadServerTlsOptions({ NODE_ENV: 'test' })).toBeUndefined();
  });

  it.each([
    { SANCTUARY_TLS_TERMINATION: 'proxy' },
    { SANCTUARY_TLS_TERMINATION: 'render' },
    { ...renderEnvironment, RENDER: 'false' },
    { ...renderEnvironment, RENDER_SERVICE_ID: '' },
    { ...renderEnvironment, RENDER_SERVICE_ID: ' ' },
  ])('fails closed on an unverified termination configuration', (environment) => {
    expect(() => resolveTlsTerminationMode(environment)).toThrow(
      'Invalid Sanctuary TLS termination configuration',
    );
    expect(() => loadServerTlsOptions(environment)).toThrow(
      'Invalid Sanctuary TLS termination configuration',
    );
  });

  it('admits an exact HTTPS forwarding header in the admitted Render mode', async () => {
    let calls = 0;
    const app = createProbeApp(
      'production',
      () => calls++,
      resolveTlsTerminationMode(renderEnvironment),
    );
    const response = await app.request('http://internal/probe/value', {
      method: 'POST',
      headers: { 'x-forwarded-proto': 'https', 'content-type': 'application/json' },
      body: JSON.stringify({ proof: 'edge-https' }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: { proof: 'edge-https' } });
    expect(calls).toBe(1);
  });

  it.each(['', 'http', 'https,http', 'http,https', 'HTTPS', 'ftp'])(
    'denies ambiguous or missing forwarding metadata: %s',
    async (protocol) => {
      let calls = 0;
      const app = createProbeApp('production', () => calls++, 'render');
      const response = await app.request('http://internal/probe/private-value', {
        method: 'POST',
        headers: {
          ...(protocol ? { 'x-forwarded-proto': protocol } : {}),
          'content-type': 'application/json',
        },
        body: '{invalid json',
      });
      expect(response.status).toBe(400);
      expect(await response.text()).toContain('HTTPS_REQUIRED');
      expect(calls).toBe(0);
    },
  );

  it('admits only the exact GET liveness path without proxy metadata', async () => {
    const app = createProbeApp('production', () => undefined, 'render');
    expect((await app.request('http://localhost:3000/health/live')).status).toBe(200);
    expect((await app.request('http://localhost:3000/health/ready')).status).toBe(400);
    expect((await app.request('http://localhost:3000/health/live/')).status).toBe(400);
    expect(
      (await app.request('http://localhost:3000/health/live', { method: 'POST' })).status,
    ).toBe(400);
    expect(
      (await app.request('http://localhost:3000/health/live', { method: 'HEAD' })).status,
    ).toBe(400);
    const direct = createProbeApp('production', () => undefined);
    expect((await direct.request('http://localhost:3000/health/live')).status).toBe(400);
  });
});

describe('CORS origin allowlist', () => {
  it('allows only exact localhost hosts in development and test', () => {
    expect(resolveAllowedCorsOrigin('http://localhost:3000', 'development')).toBe(
      'http://localhost:3000',
    );
    expect(resolveAllowedCorsOrigin('https://localhost:8443', 'test')).toBe(
      'https://localhost:8443',
    );
    expect(resolveAllowedCorsOrigin('http://localhost.attacker.test', 'development')).toBeNull();
  });

  it('allows only the approved HTTPS production origins', () => {
    expect(resolveAllowedCorsOrigin('https://gurudevi.app', 'production')).toBe(
      'https://gurudevi.app',
    );
    expect(resolveAllowedCorsOrigin('https://sanctuary.gurudevi.app', 'production')).toBe(
      'https://sanctuary.gurudevi.app',
    );
    expect(resolveAllowedCorsOrigin('http://localhost:3000', 'production')).toBeNull();
    expect(resolveAllowedCorsOrigin('https://explore.gurudevi.app', 'production')).toBeNull();
  });

  it('allows valid institutional school subdomains while rejecting reserved or hostile origins', () => {
    expect(resolveAllowedCorsOrigin('https://ananda.gurudevi.app', 'production')).toBe(
      'https://ananda.gurudevi.app',
    );
    expect(resolveAllowedCorsOrigin('https://visakha.gurudevi.app', 'production')).toBe(
      'https://visakha.gurudevi.app',
    );
    expect(resolveAllowedCorsOrigin('https://chundikuli-college.gurudevi.app', 'production')).toBe(
      'https://chundikuli-college.gurudevi.app',
    );
    // Reserved administrative subdomains must be rejected
    expect(resolveAllowedCorsOrigin('https://admin.gurudevi.app', 'production')).toBeNull();
    expect(resolveAllowedCorsOrigin('https://api.gurudevi.app', 'production')).toBeNull();
    expect(resolveAllowedCorsOrigin('https://auth.gurudevi.app', 'production')).toBeNull();
    // Hostile spoofing attempts must be rejected
    expect(
      resolveAllowedCorsOrigin('https://ananda.gurudevi.app.attacker.com', 'production'),
    ).toBeNull();
    expect(resolveAllowedCorsOrigin('http://ananda.gurudevi.app', 'production')).toBeNull();
  });
});

describe('production TLS startup configuration', () => {
  it('requires both PEM values without logging or reflecting either value', () => {
    expect(() => loadProductionTlsOptions('private-key-secret', undefined)).toThrow(
      'Production HTTPS requires SANCTUARY_TLS_KEY and SANCTUARY_TLS_CERT.',
    );
  });

  it('fails closed on invalid certificate material with a sanitized error', () => {
    expect(() => loadProductionTlsOptions('private-key-secret', 'certificate-secret')).toThrow(
      'Production HTTPS certificate configuration is invalid.',
    );
  });
});
