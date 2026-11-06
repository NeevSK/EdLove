import { describe, expect, it } from 'vitest';
import { generateDownstreamCedarSchema, generateMcpCedarSchema } from './cedarMcpSchema.js';

describe('Cedar MCP schema generation', () => {
  it('preserves a tool name and its required input in the generated action', () => {
    const result = generateMcpCedarSchema([
      {
        name: 'local_read',
        inputSchema: {
          type: 'object',
          properties: { path: { type: 'string' } },
          required: ['path'],
        },
      },
    ]);
    expect(result.tools).toEqual(['local_read']);
    expect(result.schema).toContain('action "local_read"');
    expect(result.schema).toMatch(/path:\s*String/);
  });

  it('rejects malformed descriptions and duplicate action names', () => {
    expect(() => generateMcpCedarSchema([{ name: 'bad' }])).toThrow();
    const tool = { name: 'same', inputSchema: { type: 'object' } };
    expect(() => generateMcpCedarSchema([tool, tool])).toThrow('unique');
  });

  it('uses the downstream input schema and gateway-prefixed action name', () => {
    const result = generateDownstreamCedarSchema('files', [
      {
        name: 'read',
        inputSchema: {
          type: 'object',
          properties: { path: { type: 'string' } },
          required: ['path'],
        },
      },
    ]);
    expect(result.tools).toEqual(['files_read']);
    expect(result.schema).toContain('action "files_read"');
    expect(result.schema).toMatch(/path:\s*String/);
  });

  it('retains distinct gateway action names that require Cedar identifier escaping', () => {
    const result = generateMcpCedarSchema([
      { name: 'alpha-beta_read', inputSchema: { type: 'object' } },
      { name: 'alpha_beta_read', inputSchema: { type: 'object' } },
    ]);
    expect(result.schema).toContain('action "alpha-beta_read"');
    expect(result.schema).toContain('action "alpha_beta_read"');
  });
});
