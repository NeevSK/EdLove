import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { getDefaultEnvironment, StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { expect, it, vi } from 'vitest';
import { z } from 'zod';

const workspace = fileURLToPath(new URL('../../../', import.meta.url));
const cedarCli = process.env.CEDAR_CLI;

it('exposes and executes the Cedar audit over the gateway stdio transport', {
  timeout: 30000,
}, async () => {
  const client = new Client({ name: 'cedar-gateway-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', 'tsx', path.join(workspace, 'packages/platform-mcp/src/index.ts')],
    cwd: workspace,
    env: {
      ...getDefaultEnvironment(),
      PLATFORM_MCP_SKIP_DOWNSTREAM: '1',
      ...(cedarCli ? { CEDAR_CLI: cedarCli } : {}),
    },
    stderr: 'pipe',
  });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toContain('sovereign_audit');
    expect(tools.map((tool) => tool.name)).toContain('sovereign_discovery');
    const result = await client.callTool({
      name: 'sovereign_audit',
      arguments: { action: 'cedar' },
    });
    expect(JSON.stringify(result.content)).toMatch(/cedar/i);
    if (cedarCli && existsSync(cedarCli)) {
      expect(result.isError).not.toBe(true);
      expect(JSON.stringify(result.content)).toMatch(/validat/i);
    }
    const scenarios = await client.callTool({
      name: 'sovereign_audit',
      arguments: { action: 'cedar_scenarios' },
    });
    expect(JSON.stringify(scenarios.content)).toMatch(/cedar|test/i);
    if (cedarCli && existsSync(cedarCli)) expect(scenarios.isError).not.toBe(true);

    const missingDownstream = await client.callTool({
      name: 'sovereign_discovery',
      arguments: { action: 'cedar_mcp_schema', params: { server: 'not-connected' } },
    });
    expect(missingDownstream.isError).toBe(true);
    expect(JSON.stringify(missingDownstream.content)).toContain('not connected');
  } finally {
    await client.close();
  }
});

it('generates a Cedar schema from a connected downstream over MCP', {
  timeout: 30000,
}, async () => {
  const client = new Client({ name: 'cedar-downstream-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', 'tsx', path.join(workspace, 'packages/platform-mcp/src/index.ts')],
    cwd: workspace,
    env: {
      ...getDefaultEnvironment(),
      PLATFORM_MCP_SKIP_SKILL_SYNC: '1',
      PLATFORM_MCP_DOWNSTREAMS: 'sequential-thinking',
    },
    stderr: 'pipe',
  });
  try {
    await client.connect(transport);
    await vi.waitFor(
      async () => {
        const { tools } = await client.listTools();
        expect(tools.some((tool) => tool.name.startsWith('sequential-thinking_'))).toBe(true);
      },
      { timeout: 15000, interval: 200 },
    );
    const result = await client.callTool({
      name: 'sovereign_discovery',
      arguments: { action: 'cedar_mcp_schema', params: { server: 'sequential-thinking' } },
    });
    expect(result.isError, JSON.stringify(result.content)).not.toBe(true);
    const content = z
      .array(z.object({ type: z.literal('text'), text: z.string() }))
      .parse(result.content);
    const generated = z
      .object({ tools: z.array(z.string()), schema: z.string() })
      .parse(JSON.parse(content[0]?.text ?? ''));
    expect(generated.tools).toContain('sequential-thinking_sequentialthinking');
    expect(generated.schema).toContain('action "sequential-thinking_sequentialthinking"');
    const invocation = await client.callTool({
      name: 'sequential-thinking_sequentialthinking',
      arguments: {
        thought: 'Verify the connected tool route.',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      },
    });
    expect(invocation.isError).not.toBe(true);
    if (cedarCli && existsSync(cedarCli)) {
      const directory = mkdtempSync(path.join(os.tmpdir(), 'cedar-mcp-schema-'));
      const schemaPath = path.join(directory, 'schema.cedarschema');
      const policyPath = path.join(directory, 'policy.cedar');
      try {
        writeFileSync(schemaPath, generated.schema);
        execFileSync(cedarCli, ['check-parse', '--schema', schemaPath], { encoding: 'utf8' });
        writeFileSync(
          policyPath,
          'permit(principal, action == PlatformMcp::Action::"sequential-thinking_sequentialthinking", resource);',
        );
        execFileSync(cedarCli, ['validate', '--schema', schemaPath, '--policies', policyPath], {
          encoding: 'utf8',
        });
      } finally {
        if (existsSync(policyPath)) unlinkSync(policyPath);
        if (existsSync(schemaPath)) unlinkSync(schemaPath);
        rmdirSync(directory);
      }
    }
  } finally {
    await client.close();
  }
});
