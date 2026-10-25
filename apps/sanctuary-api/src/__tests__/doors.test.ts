import { describe, expect, it } from 'vitest';
import { app } from '../core/app';

describe('Sanctuary API: Sovereign Doors Ingress', () => {
  it('GET /api/mcp/info returns sovereign MCP metadata', async () => {
    const res = await app.request('/api/mcp/info', {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('status', 'active');
    expect(data).toHaveProperty('name', 'sanctuary-api-mcp');
    expect(data).toHaveProperty('capabilities');
  });

  it('GET /api/mcp/tools returns registered domain tools catalog', async () => {
    const res = await app.request('/api/mcp/tools', {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('tools');
    expect(Array.isArray(data.tools)).toBe(true);
  }, 15000);

  it('POST /api/mcp/call rejects invocation without tool name', async () => {
    const res = await app.request('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('POST /api/mcp/call returns 404 for nonexistent tool', async () => {
    const res = await app.request('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'nonexistent_procedure_xyz' }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('not found in Sanctuary MCP catalog');
  });

  it('GET /api/ws returns 501 Not Implemented by default (decoupled optional door)', async () => {
    const res = await app.request('/api/ws', {
      method: 'GET',
    });
    expect(res.status).toBe(501);
    const data = await res.json();
    expect(data.error).toBe('WebSocketsDisabled');
  });
});
