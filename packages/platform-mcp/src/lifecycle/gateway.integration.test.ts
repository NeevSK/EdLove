import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { getDefaultEnvironment, StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { expect, it } from 'vitest';
import { z } from 'zod';
import { analysisArtifact, baseLifecycleActors, productArtifacts } from './fixtures.js';
import { lifecycleStateSchema } from './model.js';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const compiled = process.env.COORDINATION_TEST_COMPILED === '1';
const runtimeArgs = compiled ? [] : ['--import', 'tsx'];
const entrypoint = (name: string) =>
  path.join(root, 'packages/platform-mcp', compiled ? `dist/${name}.js` : `src/${name}.ts`);
const response = z
  .object({ state: lifecycleStateSchema, graphTrace: z.array(z.string()) })
  .passthrough();
const mcpResponse = z.object({
  content: z.array(z.object({ type: z.literal('text'), text: z.string() })),
  isError: z.boolean().optional(),
});

it('persists actual role handoffs across CLI and MCP and records a real PJC invocation', {
  timeout: 60000,
}, async () => {
  const databasePath = path.join(
    mkdtempSync(path.join(os.tmpdir(), 'lifecycle-gateway-')),
    'state.sqlite',
  );
  const id = 'lifecycle-gateway';
  const source = 'AGENTS.md';
  const cli = (request: unknown) =>
    response.parse(
      JSON.parse(
        execFileSync(
          process.execPath,
          [...runtimeArgs, entrypoint('cli/coordination'), '-', '--store', databasePath],
          {
            cwd: root,
            input: JSON.stringify({ action: 'lifecycle', request }),
            encoding: 'utf8',
            timeout: 25000,
            maxBuffer: 2 * 1024 * 1024,
          },
        ),
      ),
    );
  let current = cli({
    action: 'create',
    id,
    operationId: 'create',
    expectedRevision: 0,
    goal: 'Verify local role handoff; no product admission',
    scope: 'feature',
    sourcePaths: [source],
    actors: baseLifecycleActors(),
    externalRefs: [],
  });
  current = cli({
    action: 'publish',
    id,
    operationId: 'analysis',
    expectedRevision: current.state.revision,
    artifact: analysisArtifact(source),
  });
  const client = new Client({ name: 'lifecycle-gateway-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [...runtimeArgs, entrypoint('index')],
    cwd: root,
    env: {
      ...getDefaultEnvironment(),
      MCP_MODE: 'GATEWAY',
      PLATFORM_MCP_SKIP_DOWNSTREAM: '1',
      PLATFORM_MCP_SKIP_SKILL_SYNC: '1',
      COORDINATION_STORE: databasePath,
    },
    stderr: 'pipe',
  });
  try {
    await client.connect(transport);
    const call = async (request: unknown) => {
      const result = mcpResponse.parse(
        await client.callTool({
          name: 'sovereign_coordination',
          arguments: { request: { action: 'lifecycle', request } },
        }),
      );
      expect(result.isError, JSON.stringify(result.content)).not.toBe(true);
      const text = result.content[0]?.text;
      if (!text) throw new Error('Missing MCP lifecycle response');
      return response.parse(JSON.parse(text));
    };
    current = await call({
      action: 'plan',
      id,
      operationId: 'plan',
      expectedRevision: current.state.revision,
      analysisRef: { id: 'analysis', version: 1 },
    });
    expect(current.state.tasks.map((task) => task.role)).toEqual(
      expect.arrayContaining([
        'product',
        'ux',
        'visual-motion',
        'architecture',
        'dependencies',
        'implementation',
        'verification',
      ]),
    );
    current = cli({
      action: 'tool-decision',
      id,
      operationId: 'decision',
      expectedRevision: current.state.revision,
      taskId: 'product',
      actorId: 'product-agent',
      toolId: 'pjc-check',
      decision: 'tool',
      evidence: [],
    });
    current = cli({
      action: 'run-tool',
      id,
      operationId: 'real-pjc',
      expectedRevision: current.state.revision,
      taskId: 'product',
      actorId: 'product-agent',
      toolId: 'pjc-check',
    });
    expect(current.graphTrace).toEqual([
      'recover',
      'begin_tool',
      'execute_tool',
      'finish_tool',
      'project',
    ]);
    expect(current.state.toolRuns[0]?.result).toMatchObject({ ok: true, exitCode: 0 });
    const outputs = productArtifacts(source, { id: 'analysis', version: 1 });
    for (const artifact of outputs)
      current = await call({
        action: 'publish',
        id,
        operationId: `publish-${artifact.id}`,
        expectedRevision: current.state.revision,
        artifact,
      });
    const refs = outputs.map((artifact) => ({ id: artifact.id, version: 1 }));
    current = await call({
      action: 'submit',
      id,
      operationId: 'submit',
      expectedRevision: current.state.revision,
      taskId: 'product',
      actorId: 'product-agent',
      outputs: refs,
    });
    current = await call({
      action: 'review',
      id,
      operationId: 'review',
      expectedRevision: current.state.revision,
      taskId: 'product',
      actorId: 'verifier',
      outcome: 'accept',
      findings: [
        'Scoped proposed output is ready for UX analysis; PJC structure does not prove feature behavior.',
      ],
      refs,
    });
    const context = cli({ action: 'context', id, taskId: 'ux' });
    const task = context.state.tasks.find((item) => item.id === 'product');
    expect(task?.status).toBe('accepted');
    const packet = z
      .object({
        packets: z.array(
          z.object({
            taskId: z.string(),
            inputs: z.array(z.object({ id: z.string(), version: z.number() })),
          }),
        ),
      })
      .parse(context);
    expect(packet.packets[0]?.inputs).toEqual(expect.arrayContaining(refs));
    const history = z
      .object({ history: z.array(z.object({ operationId: z.string() })) })
      .parse(cli({ action: 'history', id }));
    expect(history.history.some((event) => event.operationId === 'real-pjc')).toBe(true);
    const forged = await client.callTool({
      name: 'sovereign_coordination',
      arguments: {
        request: {
          action: 'lifecycle',
          request: {
            action: 'run-tool',
            id,
            operationId: 'forged',
            expectedRevision: current.state.revision,
            taskId: 'product',
            actorId: 'product-agent',
            toolId: 'pjc-check',
            result: { ok: true },
          },
        },
      },
    });
    expect(forged.isError).toBe(true);
  } finally {
    await client.close();
  }
});
