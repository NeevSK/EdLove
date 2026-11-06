import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type CedarAnswer = { type: 'success' | 'failure'; response?: { decision: 'allow' | 'deny' } };
interface CedarWasm {
  checkParseSchema(schema: string): CedarAnswer;
  isAuthorized(call: object): CedarAnswer;
}
const cedar = createRequire(import.meta.url)('@cedar-policy/cedar-wasm/nodejs') as CedarWasm;

const dir = fileURLToPath(new URL('../modules/', import.meta.url));
const fragments = readdirSync(dir)
  .filter((file) => file.endsWith('.cedarschema'))
  .map((file) => ({
    domain: file.replace('.cedarschema', ''),
    text: readFileSync(dir + file, 'utf8'),
  }));
const namespaceOf = (domain: string) => domain.charAt(0).toUpperCase() + domain.slice(1);

describe('domain Cedar namespaces', () => {
  it('has one fragment per domain plus the platform fragment', () => {
    expect(fragments.map((f) => f.domain).sort()).toEqual([
      'agents',
      'community',
      'family',
      'journey',
      'learning',
      'library',
      'ops',
      'platform',
      'rewards',
      'wellbeing',
    ]);
  });

  it.each(fragments)('$domain declares its own namespace and parses', ({ domain, text }) => {
    expect(text).toMatch(new RegExp(`^namespace ${namespaceOf(domain)} \\{`, 'm'));
    expect(cedar.checkParseSchema(text).type).toBe('success');
  });

  it('fragments assemble into one schema', () => {
    expect(cedar.checkParseSchema(fragments.map((f) => f.text).join('\n')).type).toBe('success');
  });

  it.each(fragments)('$domain denies by default', ({ domain }) => {
    const answer = cedar.isAuthorized({
      principal: { type: 'Account', id: 'a' },
      action: { type: `${namespaceOf(domain)}::Action`, id: 'any' },
      resource: { type: `${namespaceOf(domain)}::Fact`, id: 'f' },
      context: {},
      policies: { staticPolicies: '' },
      entities: [],
    });
    expect(answer).toMatchObject({ type: 'success', response: { decision: 'deny' } });
  });
});
