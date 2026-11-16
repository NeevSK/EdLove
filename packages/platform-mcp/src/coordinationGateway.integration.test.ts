import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { getDefaultEnvironment, StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { expect, it } from 'vitest';
import { z } from 'zod';

const workspace = fileURLToPath(new URL('../../../', import.meta.url));
const compiled = process.env.COORDINATION_TEST_COMPILED === '1';
const runtimeArgs = compiled ? [] : ['--import', 'tsx'];
const entrypoint = (name: string) =>
  path.join(workspace, 'packages/platform-mcp', compiled ? `dist/${name}.js` : `src/${name}.ts`);
const responseSchema = z.object({
  content: z.array(z.object({ type: z.literal('text'), text: z.string() })),
  isError: z.boolean().optional(),
});

it('shares a persistent change between the real CLI and MCP gateway without activating downstreams or skill sync', {
  timeout: 60000,
}, async () => {
  const store = path.join(
    mkdtempSync(path.join(os.tmpdir(), 'coordination-gateway-')),
    'state.sqlite',
  );
  const cli = (request: unknown): unknown =>
    JSON.parse(
      execFileSync(
        process.execPath,
        [...runtimeArgs, entrypoint('cli/coordination'), '-', '--store', store],
        { cwd: workspace, input: JSON.stringify(request), encoding: 'utf8', timeout: 20000 },
      ),
    );
  const source = 'docs/architecture/model/gurudevi.c4';
  expect(
    cli({
      action: 'create',
      id: 'gateway-check',
      goal: 'Validate declared architecture',
      impacts: ['architecture'],
      sources: [{ path: source, scope: 'C4 model only' }],
    }),
  ).toMatchObject({ readiness: 'blocked' });
  const client = new Client({ name: 'coordination-integration-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [...runtimeArgs, entrypoint('index')],
    cwd: workspace,
    env: {
      ...getDefaultEnvironment(),
      MCP_MODE: 'GATEWAY',
      PLATFORM_MCP_SKIP_DOWNSTREAM: '1',
      PLATFORM_MCP_SKIP_SKILL_SYNC: '1',
      COORDINATION_STORE: store,
    },
    stderr: 'pipe',
  });
  try {
    await client.connect(transport);
    expect((await client.listTools()).tools.map((tool) => tool.name)).toContain(
      'sovereign_coordination',
    );
    const call = async (request: unknown): Promise<unknown> => {
      const result = responseSchema.parse(
        await client.callTool({ name: 'sovereign_coordination', arguments: { request } }),
      );
      expect(result.isError, JSON.stringify(result.content)).not.toBe(true);
      const text = result.content[0]?.text;
      if (!text) throw new Error('Missing coordination response');
      return JSON.parse(text);
    };
    expect(await call({ action: 'status', id: 'gateway-check' })).toMatchObject({
      change: { id: 'gateway-check' },
      readiness: 'blocked',
    });
    const analysis = {
      action: 'record',
      id: 'gateway-check',
      actionId: 'analysis',
      stage: 'analysis',
      notes: 'Declared C4 model only; runtime alignment unverified.',
      evidencePaths: [source],
      unresolved: [],
    };
    await call(analysis);
    expect(
      cli({ action: 'check', id: 'gateway-check', actionId: 'c4', checkId: 'c4-validate' }),
    ).toMatchObject({ missingChecks: [] });
    expect(await call({ ...analysis, actionId: 'review', stage: 'reconciliation' })).toMatchObject({
      readiness: 'ready-for-review',
    });
    expect(cli({ action: 'status', id: 'gateway-check' })).toMatchObject({
      readiness: 'ready-for-review',
    });
    expect(
      await call({ action: 'context', journeyId: 'journey:api.secure_operations' }),
    ).toMatchObject({ status: 'observed', journeyId: 'journey:api.secure_operations' });
    const rejected = await client.callTool({
      name: 'sovereign_coordination',
      arguments: {
        request: {
          action: 'record',
          id: 'gateway-check',
          actionId: 'forged',
          stage: 'analysis',
          notes: 'Forged',
          evidencePaths: [source],
          unresolved: [],
          result: { ok: true },
        },
      },
    });
    expect(rejected.isError).toBe(true);
  } finally {
    await client.close();
  }
});
