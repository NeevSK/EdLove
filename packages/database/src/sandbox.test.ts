import { describe, expect, it } from 'vitest';
import {
  MockSandboxProvider,
  NeonSandboxProvider,
  getSandboxDatabaseProvider,
} from './sandbox';
import { InMemoryDuckDbAdapter, createDuckDbClient } from './duckdb';

describe('ISandboxDatabasePort & Providers', () => {
  it('spawns, queries, and drops an ephemeral mock branch', async () => {
    const provider = new MockSandboxProvider();
    expect(provider.providerName).toBe('mock');

    const branch = await provider.createBranch({
      name: 'agent-run-101',
      ttlMinutes: 30,
    });

    expect(branch.id).toBeDefined();
    expect(branch.name).toBe('agent-run-101');
    expect(branch.expiresAt).toBeDefined();
    expect(provider.getActiveBranchCount()).toBe(1);

    const connStr = await provider.getBranchConnectionString(branch.id);
    expect(connStr).toContain('agent-run-101');

    await provider.deleteBranch(branch.id);
    expect(provider.getActiveBranchCount()).toBe(0);

    await expect(provider.getBranchConnectionString(branch.id)).rejects.toThrow(
      /Branch not found/,
    );
  });

  it('fails safely when deleting a non-existent branch', async () => {
    const provider = new MockSandboxProvider();
    await expect(provider.deleteBranch('phantom-branch')).rejects.toThrow(
      /Cannot delete non-existent branch/,
    );
  });

  it('resolves Mock provider when Neon credentials are missing', () => {
    const provider = getSandboxDatabaseProvider(true);
    expect(provider.providerName).toBe('mock');
  });

  it('initializes Neon provider structure safely', () => {
    const neon = new NeonSandboxProvider({
      apiKey: 'test-key',
      projectId: 'test-project',
    });
    expect(neon.providerName).toBe('neon');
  });
});

describe('IDuckDatabasePort (OLAP & Telemetry)', () => {
  it('creates tables and executes queries in memory', async () => {
    const duck = createDuckDbClient();
    expect(duck.isInMemory).toBe(true);

    await duck.execute('CREATE TABLE IF NOT EXISTS agent_evaluations (id TEXT, score FLOAT)');
    await duck.execute('INSERT INTO agent_evaluations', [{ id: 'run-1', score: 0.98 }]);

    const results = await duck.query<{ id: string; score: number }>(
      'SELECT * FROM agent_evaluations',
    );
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('run-1');
    expect(results[0]?.score).toBe(0.98);

    await duck.close();
    await expect(duck.query('SELECT * FROM agent_evaluations')).rejects.toThrow(
      /Engine is closed/,
    );
  });
});
