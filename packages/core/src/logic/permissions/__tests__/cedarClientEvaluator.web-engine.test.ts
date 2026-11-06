import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { initSync } from '@cedar-policy/cedar-wasm/web';
import { describe, expect, it } from 'vitest';
import { evaluateShape2 } from '../cedarClientEvaluator';

describe('client Cedar web binding with real WASM', () => {
  it('initializes the web binding and evaluates a real request', async () => {
    const require = createRequire(import.meta.url);
    const nodeEntry = require.resolve('@cedar-policy/cedar-wasm/nodejs');
    initSync({ module: readFileSync(join(dirname(nodeEntry), '..', 'web', 'cedar_wasm_bg.wasm')) });
    await expect(
      evaluateShape2('permit(principal, action, resource);', {
        user: { id: 'alice', attrs: { school_id: 's1', capacity: 'teacher', classroom_ids: [] } },
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'c1',
        resourceAttrs: {},
      }),
    ).resolves.toBe(true);

    const user = {
      id: 'alice',
      attrs: { school_id: 's1', capacity: 'teacher', classroom_ids: [] },
    };
    const gradeOnly = 'permit(principal, action == Action::"grade", resource);';
    await expect(
      evaluateShape2(gradeOnly, {
        user,
        action: 'grade',
        resourceType: 'GradeMark',
        resourceId: 'g1',
        resourceAttrs: {},
      }),
    ).resolves.toBe(true);
    await expect(
      evaluateShape2(gradeOnly, {
        user,
        action: 'grade',
        resourceType: 'Assignment',
        resourceId: 'a1',
        resourceAttrs: {},
      }),
    ).resolves.toBe(false);
  });
});
