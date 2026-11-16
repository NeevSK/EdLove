import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { appContract } from '@repo/core/api/v1/contract';
import { describe, expect, it } from 'vitest';
import { cardPath, readCard } from '../conformance/cards.adapter';
import { router } from '../core/router';
import {
  admittedNamespaces,
  capabilities,
  channels,
  domainModules,
  domainNames,
  platformModules,
} from './catalog';
import { implementedPaths, procedurePaths } from './contractPaths';

const repo = (path: string) => fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
const allNames = [...domainModules.map((m) => m.name), ...platformModules.map((m) => m.name)];

describe('module catalog fitness', () => {
  it('names every module once', () => {
    expect(new Set(allNames).size).toBe(allNames.length);
  });

  it('exposes exactly the admitted namespaces in the router', () => {
    expect(Object.keys(router).sort()).toEqual(admittedNamespaces());
  });

  it('keeps the domain index in step with the catalog', () => {
    const index = readFileSync(repo('docs/architecture/domains/README.md'), 'utf8');
    const listed = new Set(
      [...index.matchAll(/\|\s*`([a-z]+(?:\.[a-z]+)?)`\s*\|/g)].map((m) => m[1]),
    );
    for (const name of [...allNames, ...domainNames]) expect(listed, name).toContain(name);
    for (const name of listed)
      expect(
        [...allNames, ...domainNames],
        `${name} is in the index but not the catalog`,
      ).toContain(name);
  });

  it('gives every domain a Cedar namespace', () => {
    for (const domain of domainNames)
      expect(existsSync(repo(`packages/policies/src/modules/${domain}.cedarschema`)), domain).toBe(
        true,
      );
  });

  it('admits a module only with its card, platform modules included', () => {
    for (const m of [...domainModules, ...platformModules].filter((d) => d.status === 'admitted'))
      expect(existsSync(repo(cardPath(m.name))), m.name).toBe(true);
  });

  it("lists every admitted capability in its module's card, under its kind", () => {
    for (const c of capabilities.filter((x) => x.status === 'admitted')) {
      const card = readCard(repo(''), c.module);
      expect(card?.[c.kind === 'command' ? 'commands' : 'queries'], c.name).toContain(c.name);
    }
  });

  it('lets domain modules read only other domain modules', () => {
    for (const m of domainModules)
      for (const read of m.reads) {
        expect(read).not.toBe(m.name);
        expect(domainModules.map((d) => d.name)).toContain(read);
      }
  });

  it('declares every contract procedure as an admitted capability, and no more', () => {
    const admitted = capabilities.filter((c) => c.status === 'admitted').map((c) => c.name);
    expect(procedurePaths(appContract)).toEqual([...admitted].sort());
  });

  it('implements every capability in the contract with a handler in the router', () => {
    expect(implementedPaths(router, appContract)).toEqual(procedurePaths(appContract));
  });

  it('names every capability once, under its own module', () => {
    const names = capabilities.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    for (const c of capabilities) expect(c.name.startsWith(`${c.module}.`), c.name).toBe(true);
  });

  it('admits a capability only in an admitted module', () => {
    const modules = [...platformModules, ...domainModules];
    for (const c of capabilities.filter((x) => x.status === 'admitted'))
      expect(modules.find((m) => m.name === c.module)?.status, c.name).toBe('admitted');
  });

  it('opens capabilities only on catalog channels', () => {
    const known = channels.map((ch) => ch.name);
    for (const c of capabilities) for (const ch of c.channels) expect(known, c.name).toContain(ch);
  });

  it('keeps the app channel as the only admitted channel until another is reviewed', () => {
    expect(channels.filter((c) => c.status === 'admitted').map((c) => c.name)).toEqual(['app']);
  });
});
