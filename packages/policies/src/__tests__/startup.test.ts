import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const source = vi.hoisted(() => ({ failure: '', policyReads: [] as string[] }));
vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return {
    ...fs,
    readFileSync(
      file: Parameters<typeof fs.readFileSync>[0],
      options: Parameters<typeof fs.readFileSync>[1],
    ) {
      if (String(file).endsWith('.cedar')) source.policyReads.push(String(file));
      if (String(file).endsWith('schema.cedarschema')) {
        if (source.failure === 'missing') throw new Error('Schema unavailable');
        if (source.failure === 'invalid') return 'invalid cedar schema !!!';
        if (source.failure === 'reload-policy' || source.failure === 'reload-invalid-policy') {
          return String(fs.readFileSync(file, options)).replace(
            'entity User {',
            'entity User { reload_required: String,',
          );
        }
      }
      if (source.failure === 'reload-policy' && String(file).endsWith('admin.cedar')) {
        throw new Error('Policy unavailable');
      }
      if (
        ['reload-invalid-policy', 'startup-invalid-policy'].includes(source.failure) &&
        String(file).endsWith('admin.cedar')
      ) {
        return 'invalid cedar policy !!!';
      }
      if (
        ['reload-invalid-schema-policy', 'startup-invalid-schema-policy'].includes(
          source.failure,
        ) &&
        String(file).endsWith('admin.cedar')
      ) {
        return 'permit(principal, action, resource) when { principal.missing_attribute };';
      }
      if (source.failure === 'reload-valid-policy' && String(file).endsWith('admin.cedar')) {
        return 'forbid(principal, action, resource);';
      }
      return fs.readFileSync(file, options);
    },
  };
});

describe('Cedar startup integrity / policy filesystem boundary substituted', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    source.failure = '';
    source.policyReads.length = 0;
    vi.resetModules();
  });

  it('loads each checked-in policy at startup and on reload', async () => {
    const root = fileURLToPath(new URL('../policies/', import.meta.url));
    const collect = (directory: string): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const name = join(directory, entry.name);
        return entry.isDirectory()
          ? collect(name)
          : entry.isFile() && name.endsWith('.cedar')
            ? [name]
            : [];
      });
    const expected = collect(root).sort();
    expect(expected.length).toBeGreaterThan(0);
    source.policyReads.length = 0;
    const engine = await import('../engine/evaluator');
    expect([...source.policyReads].sort()).toEqual(expected);
    source.policyReads.length = 0;
    engine.reinitializeCedar();
    expect([...source.policyReads].sort()).toEqual(expected);
  });

  it.each(['missing', 'invalid'])(
    'refuses to initialize when the schema is %s',
    async (failure) => {
      source.failure = failure;
      await expect(import('../engine/evaluator')).rejects.toThrow(
        'CEDAR_POLICY_INITIALIZATION_FAILED',
      );
    },
  );

  it.each(['startup-invalid-policy', 'startup-invalid-schema-policy'])(
    'refuses to initialize with %s',
    async (failure) => {
      source.failure = failure;
      await expect(import('../engine/evaluator')).rejects.toThrow(
        'CEDAR_POLICY_INITIALIZATION_FAILED',
      );
    },
  );

  it('keeps the previous schema and policies when policy reload fails', async () => {
    const engine = await import('../engine/evaluator');
    const request = {
      principal: {
        type: 'admin',
        id: 'admin-1',
        attributes: { capacity: 'admin', school_id: 's1' },
      },
      action: 'read',
      resource: { type: 'School', id: 's1', attributes: {} },
    };
    expect(engine.check(request).permitted).toBe(true);
    source.failure = 'reload-policy';
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      engine.reinitializeCedar();
      expect(engine.check(request).permitted).toBe(true);
      expect(error).toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });

  it('keeps the previous schema and policies when a reloaded policy is invalid', async () => {
    const engine = await import('../engine/evaluator');
    const request = {
      principal: {
        type: 'admin',
        id: 'admin-1',
        attributes: { capacity: 'admin', school_id: 's1' },
      },
      action: 'read',
      resource: { type: 'School', id: 's1', attributes: {} },
    };
    expect(engine.check(request).permitted).toBe(true);
    source.failure = 'reload-invalid-policy';
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      engine.reinitializeCedar();
      expect(engine.check(request).permitted).toBe(true);
      expect(error).toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });

  it('keeps the previous policy set when a valid policy fails schema validation', async () => {
    const engine = await import('../engine/evaluator');
    const request = {
      principal: {
        type: 'admin',
        id: 'admin-1',
        attributes: { capacity: 'admin', school_id: 's1' },
      },
      action: 'read',
      resource: { type: 'School', id: 's1', attributes: {} },
    };
    expect(engine.check(request).permitted).toBe(true);
    source.failure = 'reload-invalid-schema-policy';
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      engine.reinitializeCedar();
      expect(engine.check(request).permitted).toBe(true);
      expect(error).toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });

  it('publishes a successfully validated policy update', async () => {
    const engine = await import('../engine/evaluator');
    const request = {
      principal: {
        type: 'admin',
        id: 'admin-1',
        attributes: { capacity: 'admin', school_id: 's1' },
      },
      action: 'read',
      resource: { type: 'School', id: 's1', attributes: {} },
    };
    expect(engine.check(request).permitted).toBe(true);
    source.failure = 'reload-valid-policy';
    engine.reinitializeCedar();
    expect(engine.check(request).permitted).toBe(false);
  });

  it('retains AI authorization after a successful reload', async () => {
    const engine = await import('../engine/evaluator');
    const request = {
      principal: {
        type: 'member',
        id: 'member-1',
        attributes: { capacity: 'member', school_id: '' },
      },
      action: 'use_ai',
      resource: { type: 'AIAssistant', id: 'assistant', attributes: {} },
    };
    expect(engine.check(request).permitted).toBe(true);
    engine.reinitializeCedar();
    expect(engine.check(request).permitted).toBe(true);
  });
});
