import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { handleCoordination } from './coordination.js';

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'coordination-test-'));
  writeFileSync(path.join(root, 'source.txt'), 'original');
  const options = {
    root,
    databasePath: path.join(root, 'state.sqlite'),
    checks: [{ id: 'verify', impacts: ['api'] }],
    runCheck: () => ({ ok: true, stdout: 'ok', stderr: '', exitCode: 0 }),
  };
  const call = (request: unknown) => handleCoordination(request, options);
  call({
    action: 'create',
    id: 'change',
    goal: 'Inspect',
    impacts: ['api'],
    sources: [{ path: 'source.txt', scope: 'test' }],
  });
  const analysis = {
    action: 'record',
    id: 'change',
    actionId: 'a',
    stage: 'analysis',
    notes: 'Reviewed',
    evidencePaths: ['source.txt'],
    unresolved: [],
  };
  return { root, options, call, analysis };
}
describe('developer coordination', () => {
  it('serializes identical records from two independent processes', async () => {
    const { root, options, call, analysis } = fixture();
    const moduleUrl = pathToFileURL(path.resolve('src/coordination.ts')).href;
    const script = `import { handleCoordination } from ${JSON.stringify(moduleUrl)};
      process.stdout.write('ready\\n');
      await new Promise(resolve => process.stdin.once('data', resolve));
      const options = { root: process.argv[1], databasePath: process.argv[2], checks: [{id: 'verify', impacts: ['api']}], runCheck: () => ({ok: true, stdout: '', stderr: '', exitCode: 0}) };
      process.stdout.write(JSON.stringify(handleCoordination(JSON.parse(process.argv[3]), options)) + '\\n');`;
    function start() {
      const child = spawn(
        process.execPath,
        [
          '--import',
          'tsx',
          '--input-type=module',
          '-e',
          script,
          root,
          options.databasePath,
          JSON.stringify(analysis),
        ],
        { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] },
      );
      let output = '';
      let errors = '';
      child.stderr.on('data', (chunk: Buffer) => {
        errors += chunk.toString();
      });
      const ready = new Promise<void>((resolve, reject) => {
        child.stdout.on('data', (chunk: Buffer) => {
          output += chunk.toString();
          if (output.includes('ready\n')) resolve();
        });
        child.once('error', reject);
        child.once('exit', (code) => {
          if (code !== 0) reject(new Error(errors));
        });
      });
      const done = new Promise<string>((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code) => (code === 0 ? resolve(output) : reject(new Error(errors))));
      });
      return { child, ready, done };
    }
    const first = start();
    const second = start();
    await Promise.all([first.ready, second.ready]);
    first.child.stdin.end('go');
    second.child.stdin.end('go');
    const outputs = await Promise.all([first.done, second.done]);
    const duplicates = outputs
      .map((output) => JSON.parse(output.trim().split('\n').at(-1) ?? '').duplicate)
      .sort();
    expect(duplicates).toEqual([false, true]);
    expect(call({ action: 'status', id: 'change' }).events).toHaveLength(1);
  });
  it('rejects missing prerequisites, records checks and survives reopening the store', () => {
    const { call, analysis } = fixture();
    expect(() => call({ action: 'check', id: 'change', actionId: 'c', checkId: 'verify' })).toThrow(
      'missing_prerequisite',
    );
    call(analysis);
    call({ action: 'check', id: 'change', actionId: 'c', checkId: 'verify' });
    call({ ...analysis, actionId: 'r', stage: 'reconciliation' });
    expect(call({ action: 'status', id: 'change' }).readiness).toBe('ready-for-review');
  });
  it('deduplicates retries and rejects changed payloads', () => {
    const { call, analysis } = fixture();
    call(analysis);
    expect(call(analysis)).toMatchObject({ duplicate: true });
    expect(() => call({ ...analysis, notes: 'Different' })).toThrow('action_id_conflict');
  });
  it('retains history but blocks changed sources and sticky unresolved decisions', () => {
    const { call, analysis, root } = fixture();
    call({ ...analysis, unresolved: ['Owner decision'] });
    call({ action: 'check', id: 'change', actionId: 'c', checkId: 'verify' });
    expect(() => call({ ...analysis, actionId: 'r', stage: 'reconciliation' })).toThrow(
      'missing_prerequisite',
    );
    writeFileSync(path.join(root, 'source.txt'), 'changed');
    const status = call({ action: 'status', id: 'change' });
    expect(status.staleSources).toEqual(['source.txt']);
    expect(status.events).toHaveLength(2);
    expect(status.readiness).toBe('blocked');
  });
  it('leaves an interrupted invocation unknown and does not repeat it', () => {
    const { options, analysis } = fixture();
    handleCoordination(analysis, options);
    const request = { action: 'check', id: 'change', actionId: 'c', checkId: 'verify' };
    expect(() =>
      handleCoordination(request, {
        ...options,
        runCheck: () => {
          throw new Error('interrupted');
        },
      }),
    ).toThrow('interrupted');
    const result = handleCoordination(request, {
      ...options,
      runCheck: () => {
        throw new Error('reran');
      },
    });
    expect(result).toMatchObject({ duplicate: true });
    expect(result.events.at(-1)?.state).toBe('pending');
  });
  it('blocks a failed check and requires reconciliation after a later check', () => {
    const { call, analysis, options } = fixture();
    call(analysis);
    const request = { action: 'check', id: 'change', actionId: 'c', checkId: 'verify' };
    handleCoordination(request, {
      ...options,
      runCheck: () => ({ ok: false, stdout: '', stderr: 'failed', exitCode: 1 }),
    });
    expect(() => call({ ...analysis, actionId: 'r', stage: 'reconciliation' })).toThrow(
      'missing_prerequisite',
    );
    call({ ...request, actionId: 'c2' });
    call({ ...analysis, actionId: 'r', stage: 'reconciliation' });
    call({ ...request, actionId: 'c3' });
    expect(call({ action: 'status', id: 'change' }).readiness).toBe('blocked');
  });
  it('blocks secrets, uncovered impacts and changed procedure identity', () => {
    const { root, options, call } = fixture();
    writeFileSync(path.join(root, '.env'), 'secret');
    expect(() =>
      call({
        action: 'create',
        id: 'secret',
        goal: 'Inspect',
        impacts: ['api'],
        sources: [{ path: '.env', scope: 'secret' }],
      }),
    ).toThrow('invalid_source_path');
    expect(() =>
      call({
        action: 'create',
        id: 'uncovered',
        goal: 'Inspect',
        impacts: ['security'],
        sources: [{ path: 'source.txt', scope: 'test' }],
      }),
    ).toThrow('uncovered_impact');
    expect(
      handleCoordination(
        { action: 'status', id: 'change' },
        { ...options, procedureRevision: 'changed' },
      ).procedureChanged,
    ).toBe(true);
  });
  it('invalidates a check when its source changes during invocation', () => {
    const { root, options, analysis } = fixture();
    handleCoordination(analysis, options);
    const result = handleCoordination(
      { action: 'check', id: 'change', actionId: 'c', checkId: 'verify' },
      {
        ...options,
        runCheck: () => {
          writeFileSync(path.join(root, 'source.txt'), 'changed');
          return { ok: true, stdout: '', stderr: '', exitCode: 0 };
        },
      },
    );
    expect(result.events.at(-1)?.state).toBe('stale');
    expect(result.readiness).toBe('blocked');
  });
  it('enforces H5 WIP throttling when previous change has unresolved checks and allows override flags', () => {
    const { call } = fixture();
    // In fixture(), 'change' was created with impact 'api' (requires 'verify' check), and has not run checks.
    expect(() =>
      call({
        action: 'create',
        id: 'change-2',
        goal: 'Second change',
        impacts: ['api'],
        sources: [{ path: 'source.txt', scope: 'test' }],
      }),
    ).toThrow(
      "WIP_SATURATION: Domain 'api' verification capacity saturated (R_gen > R_ver); resolve or reconcile pending changes in 'api' before initiating new changes",
    );

    // Bypassing with bypassWipCheck: true succeeds
    const bypassed = call({
      action: 'create',
      id: 'change-2',
      goal: 'Second change',
      impacts: ['api'],
      sources: [{ path: 'source.txt', scope: 'test' }],
      bypassWipCheck: true,
    });
    expect(bypassed.change.id).toBe('change-2');
    expect(bypassed.wip).toMatchObject({ activeCount: 2, saturated: false });

    // Bypassing with force: true succeeds
    const forced = call({
      action: 'create',
      id: 'change-3',
      goal: 'Third change',
      impacts: ['api'],
      sources: [{ path: 'source.txt', scope: 'test' }],
      force: true,
    });
    expect(forced.change.id).toBe('change-3');
  });
  it('enforces domain isolation: unverified api change blocks api but does not block independent web change', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'coordination-domain-test-'));
    writeFileSync(path.join(root, 'source.txt'), 'original');
    const options = {
      root,
      databasePath: path.join(root, 'state.sqlite'),
      checks: [
        { id: 'verify-api', impacts: ['api'] },
        { id: 'verify-web', impacts: ['web'] },
      ],
      runCheck: () => ({ ok: true, stdout: 'ok', stderr: '', exitCode: 0 }),
    };
    const call = (request: unknown) => handleCoordination(request, options);

    // 1. Create an initial unverified change in 'api'
    call({
      action: 'create',
      id: 'change-api-1',
      goal: 'First API change',
      impacts: ['api'],
      sources: [{ path: 'source.txt', scope: 'test' }],
    });

    // 2. Verify an unverified change in 'api' blocks a subsequent 'api' change
    expect(() =>
      call({
        action: 'create',
        id: 'change-api-2',
        goal: 'Second API change',
        impacts: ['api'],
        sources: [{ path: 'source.txt', scope: 'test' }],
      }),
    ).toThrow(
      "WIP_SATURATION: Domain 'api' verification capacity saturated (R_gen > R_ver); resolve or reconcile pending changes in 'api' before initiating new changes",
    );

    // 3. Verify an unverified change in 'api' does NOT block an independent 'web' change!
    const webChange = call({
      action: 'create',
      id: 'change-web-1',
      goal: 'First Web change',
      impacts: ['web'],
      sources: [{ path: 'source.txt', scope: 'test' }],
    });
    expect(webChange.change.id).toBe('change-web-1');
    expect(webChange.readiness).toBe('blocked');

    // 4. Check status reports domain WIP counts and saturated domains
    const statusApi = call({ action: 'status', id: 'change-api-1' });
    expect(statusApi.wip).toMatchObject({
      globalActiveCount: 2,
      domainCounts: expect.objectContaining({ api: 1, web: 1 }),
      saturatedDomains: [],
    });
  });
  it('allows creating a change normally once previous change checks are resolved and reconciled', () => {
    const { call, analysis } = fixture();
    // Resolve checks on first change
    call(analysis);
    call({ action: 'check', id: 'change', actionId: 'c1', checkId: 'verify' });
    call({ ...analysis, actionId: 'r1', stage: 'reconciliation' });
    expect(call({ action: 'status', id: 'change' }).readiness).toBe('ready-for-review');

    // Now creating change-2 without force succeeds because previous change has no unresolved checks
    const created = call({
      action: 'create',
      id: 'change-2',
      goal: 'Second change',
      impacts: ['api'],
      sources: [{ path: 'source.txt', scope: 'test' }],
    });
    expect(created.change.id).toBe('change-2');
  });
  it('enforces maximum concurrent WIP capacity limit and reports feedback in status', () => {
    const { call, options } = fixture();
    // Create changes up to custom maxWip of 2
    const customOptions = { ...options, maxWip: 2 };
    const customCall = (request: unknown) => handleCoordination(request, customOptions);

    customCall({
      action: 'create',
      id: 'wip-2',
      goal: 'Second',
      impacts: ['api'],
      sources: [{ path: 'source.txt', scope: 'test' }],
      bypassWipCheck: true,
    });

    // 2 active unverified changes exist now ('change' and 'wip-2'). Attempting a 3rd with maxWip: 2 throws:
    expect(() =>
      customCall({
        action: 'create',
        id: 'wip-3',
        goal: 'Third',
        impacts: ['api'],
        sources: [{ path: 'source.txt', scope: 'test' }],
      }),
    ).toThrow(/WIP_SATURATION: Domain 'api' verification capacity saturated/);

    const status = customCall({ action: 'status', id: 'wip-2' });
    expect(status.wip).toMatchObject({
      activeCount: 2,
      maxWip: 2,
      saturated: true,
      globalActiveCount: 2,
      domainCounts: expect.objectContaining({ api: 2 }),
      saturatedDomains: ['api'],
      warning:
        "WIP_SATURATION: Domain 'api' verification capacity saturated (R_gen > R_ver); resolve or reconcile pending changes in 'api' before initiating new changes",
    });
  });
});
