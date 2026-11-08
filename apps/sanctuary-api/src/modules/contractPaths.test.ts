import { oc } from '@orpc/contract';
import { os } from '@orpc/server';
import { appContract } from '@repo/core/api/v1/contract';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { implementedPaths, procedurePaths } from './contractPaths';

const leaf = oc.input(z.string()).output(z.string());
const nested = {
  identity: { session: leaf },
  learning: { assignments: { submit: leaf, list: leaf } },
};

describe('contract paths', () => {
  it('flattens the v1 contract to dotted capability names', () => {
    expect(procedurePaths(appContract)).toEqual([
      'authority.refreshSnapshot',
      'identity.createInitialBond',
      'identity.entry',
      'identity.scopes',
      'identity.session',
    ]);
  });

  it('flattens two- and three-level namespaces alike', () => {
    expect(procedurePaths(nested)).toEqual([
      'identity.session',
      'learning.assignments.list',
      'learning.assignments.submit',
    ]);
  });

  it('counts only paths that resolve to a real handler, not the contract behind it', () => {
    const handler = os.handler(() => 'ok');
    const partial = {
      identity: { session: handler },
      learning: { assignments: { list: handler } },
    };
    expect(implementedPaths(partial, nested)).toEqual([
      'identity.session',
      'learning.assignments.list',
    ]);
  });
});
