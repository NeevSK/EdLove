import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { auditComposition } from '../audit-api-composition.mjs';

const app = 'apps/sanctuary-api/src/core/app.ts';
const router = 'apps/sanctuary-api/src/core/router.ts';
const contract = 'packages/core/src/api/v1/contract.ts';
const client = 'packages/core/src/api/v1/client.ts';
function fixture() {
  return {
    [app]: `import { RPCHandler } from '@orpc/server/fetch'; import { API_V1_PREFIX } from '@repo/core/api/v1/client'; import { router } from './router'; const handler = new RPCHandler(router); app.get('/health/live', f); app.get('/health/ready', f); app.all('/api/v1/*', c => handler.handle(c.req, { prefix: API_V1_PREFIX, context: { platform: options.platform && { security: options.platform.security, executeAccountCommand: options.platform.executeAccountCommand, syncGrants: options.platform.syncGrants, withAccountData: options.platform.withAccountData } } }));`,
    [router]: `import { implement } from '@orpc/server'; import { appContract } from '@repo/core/api/v1/contract'; const api = implement(appContract).$context(); const router = api.router({ identity: { session: api.identity.session.handler(f), scopes: api.identity.scopes.handler(f), entry: api.identity.entry.handler(f), createInitialBond: api.identity.createInitialBond.handler(f), syncGrant: api.identity.syncGrant.handler(f), deletion: { status: api.identity.deletion.status.handler(f), request: api.identity.deletion.request.handler(f), cancel: api.identity.deletion.cancel.handler(f) } }, authority: { refreshSnapshot: api.authority.refreshSnapshot.handler(f) } });`,
    [contract]: `import { oc, type RouterContract } from '@orpc/contract'; const foundation = oc.errors({}); export const appContract = { identity: { session: foundation.input(s).output(s), scopes: foundation.input(s).output(s), entry: foundation.input(s).output(s), createInitialBond: foundation.input(s).output(s), syncGrant: foundation.input(s).output(s), deletion: { status: foundation.input(s).output(s), request: foundation.input(s).output(s), cancel: foundation.input(s).output(s) } }, authority: { refreshSnapshot: foundation.input(s).output(s) } } satisfies RouterContract;`,
    [client]: `import { RPCLink } from '@orpc/client/fetch'; import { createORPCClient } from '@orpc/client'; export const API_V1_PREFIX = '/api/v1'; const link = new RPCLink({ url: API_V1_PREFIX });`,
    'apps/sanctuary-api/src/core/context.ts': `export interface APIContext { requestId: string }`,
  };
}
const codes = (files) => auditComposition(files).issues.map((issue) => issue.code);

test('admitted identity foundation passes without claiming business features', () => {
  const files = fixture();
  files[app] += `\n// app.get('/api/old', f); as any`;
  const result = auditComposition(files);
  assert.deepEqual(result.issues, []);
  assert.match(result.scope, /no business feature coverage/);
});
test('rejects exposing the full platform or extra services to native handlers', () => {
  for (const replacement of [
    [
      'options.platform && { security: options.platform.security, executeAccountCommand: options.platform.executeAccountCommand, syncGrants: options.platform.syncGrants, withAccountData: options.platform.withAccountData }',
      'options.platform',
    ],
    [
      'executeAccountCommand: options.platform.executeAccountCommand',
      'executeAccountCommand: options.platform.executeAccountCommand, operations: options.platform.operations',
    ],
    ['security: options.platform.security', 'security: options.platform.operations'],
    ['context: { platform:', 'context: { ...other, platform:'],
    ['context: { platform:', 'context: { platform: options.platform, platform:'],
  ]) {
    const files = fixture();
    files[app] = files[app].replace(...replacement);
    assert.ok(codes(files).includes('request-authority'));
  }
});
test('rejects feature declarations, old sources, converters and type escapes', () => {
  const files = fixture();
  files[contract] = files[contract].replace('identity: {', 'fake: old, identity: {');
  files[router] += `\nconst old = toORPCContract(value as any);`;
  files['apps/sanctuary-api/src/core/handlers/old.ts'] = '';
  files['apps/sanctuary-api/src/core/orpc.ts'] = '';
  files['packages/core/src/api/old.ts'] = '';
  files['packages/core/src/api/v1/hidden.ts'] = '';
  for (const code of [
    'contract',
    'legacy-source',
    'legacy-converter',
    'type-escape',
    'unexpected-source',
  ])
    assert.ok(codes(files).includes(code), code);
});
test('rejects wrong and disconnected RPC mounts and old transports', () => {
  const files = fixture();
  files[client] = files[client].replace("'/api/v1'", "'/api'");
  files[app] =
    files[app].replace('handler.handle', 'other.handle') +
    `\napp.route('/api/old', old); import { OpenAPIHandler } from '@orpc/openapi/fetch';`;
  for (const code of ['client-base', 'rpc-composition', 'unexpected-mount', 'alternate-transport'])
    assert.ok(codes(files).includes(code), code);
});
test('rejects malformed and missing boundaries', () => {
  const files = fixture();
  files[client] += '\nconst x = ;';
  delete files[router];
  assert.ok(codes(files).includes('syntax-error'));
  assert.ok(codes(files).includes('missing-file'));
});
test('inspects extra modules instead of accepting a clean central file as proof', () => {
  const files = fixture();
  files['apps/sanctuary-api/src/unreviewed.ts'] =
    `import { OpenAPIHandler } from '@orpc/openapi/fetch'; const bypass: any = ;`;
  for (const code of ['unexpected-source', 'alternate-transport', 'type-escape', 'syntax-error'])
    assert.ok(codes(files).includes(code), code);
});
test('rejects retired tools outside src as well as their stale compiled artifacts', () => {
  const files = fixture();
  files['apps/sanctuary-api/scripts/generate-openapi-spec.js'] =
    `import { OpenAPIGenerator } from '@orpc/openapi';`;
  assert.ok(codes(files).includes('unexpected-source'));
  assert.ok(codes(files).includes('alternate-transport'));
});
test('rejects unknown command options', () => {
  const result = spawnSync(process.execPath, ['scripts/audit-api-composition.mjs', '--bogus'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown argument/);
});

test('rejects missing, extra and disconnected identity handlers', () => {
  for (const replacement of [
    ['scopes: api.identity.scopes.handler(f)', 'scopes: api.identity.session.handler(f)'],
    ['scopes: api.identity.scopes.handler(f)', 'scopes: other'],
    [
      'scopes: api.identity.scopes.handler(f)',
      'scopes: api.identity.scopes.handler(f), extra: other',
    ],
  ]) {
    const files = fixture();
    files[router] = files[router].replace(...replacement);
    assert.ok(codes(files).includes('router'));
  }
});
test('rejects missing, extra and non-native identity procedures', () => {
  for (const replacement of [
    ['scopes: foundation.input(s).output(s)', 'scopes: other'],
    ['scopes: foundation.input(s).output(s)', 'extra: foundation.input(s).output(s)'],
    [
      'scopes: foundation.input(s).output(s)',
      'scopes: foundation.input(s).output(s), extra: other',
    ],
  ]) {
    const files = fixture();
    files[contract] = files[contract].replace(...replacement);
    assert.ok(codes(files).includes('contract'));
  }
});
