import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { auditComposition } from '../audit-api-composition.mjs';

const app = 'apps/sanctuary-api/src/core/app.ts';
const route = 'apps/sanctuary-api/src/core/routes/orpc.ts';
const client = 'packages/core/src/api/orpcClient.ts';
const contract = 'packages/core/src/api/appContract.ts';
const router = 'apps/sanctuary-api/src/core/router.ts';
const domain = 'apps/sanctuary-api/src/domains/self/index.ts';
const handler = 'apps/sanctuary-api/src/core/handlers/self.ts';
const legacy = 'packages/core/src/api/self.contract.ts';

function clean() {
  return {
    [app]: `import { healthRoutes } from './routes/health'; import { createOmnichannelDoor } from '../doors/omnichannel'; import { registerRPC } from './routes/orpc'; const handler = new RPCHandler(router); registerRPC(app, handler); app.route('/', healthRoutes); app.route('/', createOmnichannelDoor());`,
    [route]: `export function registerRPC(app, handler) { app.all('/api/v1/*', c => handler.handle(c.req, { prefix: '/api/v1' })); }`,
    [client]: `const link = new RPCLink({ url: '/api/v1' });`,
    [contract]: `import { selfContract } from './self.contract'; export const appContract = { self: selfContract };`,
    [legacy]: `export const selfContract = { read: oc.output(schema) };`,
    [router]: `import { selfDomainRouter } from '../domains/self'; export const router = o.router({ self: selfDomainRouter });`,
    [domain]: `import { selfRouter } from '../../core/handlers/self'; export const selfDomainRouter = o.router({ self: selfRouter });`,
    [handler]: `import { implement } from '@orpc/server'; export const selfRouter = implement(contract);`,
    'apps/sanctuary-api/src/core/orpc.ts': `export const o = os;`,
    'apps/sanctuary-api/src/core/routes/health.ts': `health.get('/health/live', handler);`,
    'apps/sanctuary-api/src/doors/omnichannel.ts': `import { createPayhereWebhookRoutes } from '../core/routes/payhereWebhook'; door.route('/', createPayhereWebhookRoutes());`,
  };
}
const codes = (files) => auditComposition(files).issues.map((issue) => issue.code);

test('accepts clean native composition and ignores comments and strings', () => {
  const files = clean();
  files[client] +=
    `\n// new RPCLink({url:'/api'}); as any\nconst message = 'OpenAPIHandler as any';`;
  assert.deepEqual(codes(files), []);
});

test('rejects wrong native bases and OpenAPI first-party mounts', () => {
  const files = clean();
  files[client] = `new RPCLink({ url: '/api' });`;
  files[route] = `app.all('/api/*', handler); handler.handle(req, { prefix: '/api' });`;
  files[app] += `new OpenAPIHandler(router);`;
  assert.ok(
    ['rpc-client-base', 'rpc-server-base', 'legacy-rpc-mount', 'alternate-openapi'].every((code) =>
      codes(files).includes(code),
    ),
  );
});

test('detects reachable legacy contracts, adapter, any and duplicate aliases', () => {
  const files = clean();
  files[legacy] =
    `export const selfContract = { read: { method:'get', path:'/a', responses:{} } };`;
  files[handler] =
    `import { implement } from '../orpc'; export const selfRouter = implement(contract);`;
  files['apps/sanctuary-api/src/core/orpc.ts'] =
    `export function toORPCContract(value: unknown) { return value; }`;
  files[contract] += ` type Client = Record<string, any>;`;
  files[domain] =
    `import { selfRouter } from '../../core/handlers/self'; export const selfDomainRouter = o.router({ ...selfRouter, wellbeing: selfRouter });`;
  files[router] =
    `import { selfDomainRouter } from '../domains/self'; import { selfRouter } from './handlers/self'; export const router = o.router({ self: selfDomainRouter, alias: selfRouter });`;
  assert.ok(
    ['legacy-contract', 'legacy-converter', 'type-escape', 'duplicate-router', 'root-alias'].every(
      (code) => codes(files).includes(code),
    ),
  );
});

test('requires health and provider boundaries', () => {
  const files = clean();
  files['apps/sanctuary-api/src/core/routes/health.ts'] = `// health.get('/health/live')`;
  delete files['apps/sanctuary-api/src/doors/omnichannel.ts'];
  assert.ok(
    auditComposition(files).issues.filter((issue) => issue.code === 'missing-boundary').length >= 2,
  );
});

test('recognizes two import aliases for the same router', () => {
  const files = clean();
  files[domain] =
    `import { selfRouter as first, selfRouter as second } from '../../core/handlers/self'; export const domain = o.router({ first, second });`;
  assert.ok(codes(files).includes('duplicate-router'));
});

test('rejects malformed source, disconnected handlers, and misplaced boundaries', () => {
  const files = clean();
  files[client] += '\nconst malformed = ;';
  files[app] = files[app]
    .replace('registerRPC(app, handler)', 'registerRPC(app, other)')
    .replace("app.route('/', healthRoutes)", "app.route('/wrong', healthRoutes)");
  files[route] =
    `export function registerRPC(app, handler) { app.all('/api/v1/*', c => other(c)); handler.handle(req, { prefix: '/api/v1' }); }`;
  const result = codes(files);
  for (const code of ['syntax-error', 'unresolved-rpc-composition', 'missing-boundary'])
    assert.ok(result.includes(code), code);
});

test('rejects imported alternate transports and legacy mounts', () => {
  const files = clean();
  files[app] +=
    `\nimport { installOld } from './old'; installOld(app); app.route('/api/v0', oldDoor);`;
  files['apps/sanctuary-api/src/core/old.ts'] =
    `export function installOld(app) { const h = new OpenAPIHandler(router); app.post('/api/old', h); }`;
  assert.ok(codes(files).includes('alternate-openapi'));
  assert.ok(codes(files).includes('alternate-api-mount'));
});

test('rejects renamed root aliases and unknown CLI flags', () => {
  const files = clean();
  files[router] =
    `import { selfDomainRouter } from '../domains/self'; import { selfRouter as old } from './handlers/self'; export const router = o.router({ self: selfDomainRouter, old });`;
  assert.ok(codes(files).includes('root-alias'));
  const result = spawnSync(process.execPath, ['scripts/audit-api-composition.mjs', '--bogus'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown argument/);
});
