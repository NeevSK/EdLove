import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { router } from '../core/router';
import {
  admittedNamespaces,
  channels,
  domainModules,
  domainNames,
  platformModules,
} from './catalog';

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

  it('admits a domain module only with its card', () => {
    for (const m of domainModules.filter((d) => d.status === 'admitted')) {
      const [domain, subdomain] = m.name.split('.');
      expect(existsSync(repo(`docs/architecture/domains/${domain}/${subdomain}.md`)), m.name).toBe(
        true,
      );
    }
  });

  it('lets domain modules read only other domain modules', () => {
    for (const m of domainModules)
      for (const read of m.reads) {
        expect(read).not.toBe(m.name);
        expect(domainModules.map((d) => d.name)).toContain(read);
      }
  });

  it('keeps the app channel as the only admitted channel until another is reviewed', () => {
    expect(channels.filter((c) => c.status === 'admitted').map((c) => c.name)).toEqual(['app']);
  });
});
