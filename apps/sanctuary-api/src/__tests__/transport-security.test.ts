import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { loadProductionTlsOptions } from '../core/nodeTransport';
import {
  requireHttpsMiddleware,
  resolveAllowedCorsOrigin,
} from '../core/transportSecurity';

function createProbeApp(nodeEnv: string | undefined, onHandler: () => void) {
  const probe = new Hono<{ Variables: { requestId: string } }>();
  probe.use('*', requestId({ generator: () => 'generated-request-id' }));
  probe.use('*', secureHeaders());
  probe.use('*', requireHttpsMiddleware(nodeEnv));
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
