#!/usr/bin/env node
import fs from 'node:fs';
import { isReferenceOnly } from '../tooling/reference-only.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SyntaxKind } from 'typescript/ast';
import * as ts from 'typescript/ast/is';
import { API } from 'typescript/sync';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appFile = 'apps/sanctuary-api/src/core/app.ts';
const routerFile = 'apps/sanctuary-api/src/core/router.ts';
const contractFile = 'packages/core/src/api/v1/contract.ts';
const clientFile = 'packages/core/src/api/v1/client.ts';
const contextFile = 'apps/sanctuary-api/src/core/context.ts';
const required = [appFile, routerFile, contractFile, clientFile, contextFile];
const admittedHostFiles = new Set([
  'apps/sanctuary-api/src/consent/grants.ts',
  'apps/sanctuary-api/src/records/records.ts',
  appFile,
  routerFile,
  contextFile,
  'apps/sanctuary-api/src/config.ts',
  'apps/sanctuary-api/src/index.ts',
  'apps/sanctuary-api/src/entry-node.ts',
  'apps/sanctuary-api/src/node-server.ts',
  'apps/sanctuary-api/src/platform.ts',
  'apps/sanctuary-api/src/security/security.ts',
  // The short-lived PowerSync token (identity.syncGrant).
  'apps/sanctuary-api/src/security/syncGrant.ts',
  // The account's own deletion request (identity.deletion), moved from the retired Next server.
  'apps/sanctuary-api/src/security/accountDeletion.ts',
  'apps/sanctuary-api/src/operations/store.ts',
  'apps/sanctuary-api/src/operations/dispatcher.ts',
  'apps/sanctuary-api/src/modules/catalog.ts',
]);
const visit = (node, fn) => {
  fn(node);
  node.forEachChild((child) => {
    visit(child, fn);
  });
};
const name = (node) =>
  node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined;
const call = (node, method) =>
  ts.isCallExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  node.expression.name.text === method;
const imported = (sf, moduleName, symbol) =>
  sf.statements.some(
    (s) =>
      ts.isImportDeclaration(s) &&
      name(s.moduleSpecifier) === moduleName &&
      s.importClause?.namedBindings &&
      ts.isNamedImports(s.importClause.namedBindings) &&
      s.importClause.namedBindings.elements.some((e) => (e.propertyName ?? e.name).text === symbol),
  );
const variable = (sf, identifier) => {
  let value;
  visit(sf, (node) => {
    if (ts.isVariableDeclaration(node) && name(node.name) === identifier) value = node.initializer;
  });
  return value;
};
const property = (node, key) =>
  node && ts.isObjectLiteralExpression(node)
    ? node.properties.find((p) => ts.isPropertyAssignment(p) && name(p.name) === key)?.initializer
    : undefined;
const keys = (node) =>
  node && ts.isObjectLiteralExpression(node)
    ? node.properties.map((p) => (ts.isPropertyAssignment(p) ? name(p.name) : undefined))
    : [];
const accessPath = (node) => {
  if (!node) return undefined;
  if (ts.isIdentifier(node)) return [node.text];
  if (ts.isPropertyAccessExpression(node)) {
    const parent = accessPath(node.expression);
    return parent ? [...parent, node.name.text] : undefined;
  }
  return undefined;
};
const exactTree = (node, shape) => {
  if (!node || !ts.isObjectLiteralExpression(node)) return false;
  const actual = keys(node);
  const expected = Object.keys(shape);
  return (
    actual.length === expected.length &&
    expected.every((key) => {
      const value = property(node, key);
      return Array.isArray(shape[key])
        ? exactTree(value, Object.fromEntries(shape[key].map((leaf) => [leaf, true])))
        : shape[key] === true
          ? true
          : typeof shape[key] === 'function'
            ? shape[key](value)
            : exactTree(value, shape[key]);
    })
  );
};
const nativeProcedure = (node) => {
  if (
    !node ||
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression) ||
    node.expression.name.text !== 'output' ||
    node.arguments.length !== 1
  )
    return false;
  const input = node.expression.expression;
  return (
    ts.isCallExpression(input) &&
    ts.isPropertyAccessExpression(input.expression) &&
    input.expression.name.text === 'input' &&
    input.arguments.length === 1 &&
    accessPath(input.expression.expression)?.join('.') === 'foundation'
  );
};
const nativeHandler = (node, procedurePath) =>
  node &&
  ts.isCallExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  node.expression.name.text === 'handler' &&
  node.arguments.length === 1 &&
  accessPath(node.expression.expression)?.join('.') === `api.${procedurePath}`;
const has = (node, predicate) => {
  let result = false;
  if (node)
    visit(node, (child) => {
      if (predicate(child)) result = true;
    });
  return result;
};

/** Checks the explicitly admitted native foundation; not business capability coverage. */
export function auditComposition(files) {
  const api = new API();
  const leases = [];
  const issues = [];
  const add = (code, file, detail) => {
    if (!issues.some((i) => i.code === code && i.file === file && i.detail === detail))
      issues.push({ code, file, detail });
  };
  try {
    const trees = new Map();
    for (const file of required) {
      if (!(file in files)) {
        add('missing-file', file, 'Foundation source is missing');
        continue;
      }
      const lease = api.createSourceFile(file, files[file]);
      leases.push(lease);
      trees.set(file, lease.sourceFile);
    }
    for (const file of Object.keys(files)) {
      const isTest = file.includes('/__tests__/') || /\.(?:test|integration)\.ts$/.test(file);
      if (file.startsWith('apps/sanctuary-api/src/') && !isTest && !admittedHostFiles.has(file))
        add('unexpected-source', file, 'Source is outside the admitted horizontal foundation');
      if (
        file.startsWith('apps/sanctuary-api/scripts/') &&
        ![
          'apps/sanctuary-api/scripts/audit-contracts.ts',
          'apps/sanctuary-api/scripts/test-foundation-database.ts',
        ].includes(file)
      )
        add('unexpected-source', file, 'API tool is outside the admitted horizontal foundation');
      if (!isTest && !trees.has(file)) {
        const lease = api.createSourceFile(file, files[file]);
        leases.push(lease);
        trees.set(file, lease.sourceFile);
      }
      if (
        file.startsWith('packages/core/src/api/') &&
        !file.startsWith('packages/core/src/api/v1/')
      )
        add('legacy-source', file, 'Legacy shared API source exists outside v1');
      if (/^apps\/sanctuary-api\/src\/(?:domains|doors|core\/handlers)\//.test(file))
        add('legacy-source', file, 'Retired API source directory is populated');
      if (
        /^apps\/sanctuary-api\/src\/core\/(?:orpc|canonicalV1Registry|routes\/orpc|routes\/canonicalV1)\.[cm]?[jt]sx?$/.test(
          file,
        )
      )
        add('legacy-source', file, 'Retired API adapter or registry is present');
      if (
        file.startsWith('packages/core/src/api/v1/') &&
        file !== contractFile &&
        file !== clientFile &&
        !file.startsWith('packages/core/src/api/v1/__tests__/')
      )
        add('unexpected-source', file, 'Unadmitted v1 source requires explicit foundation review');
    }
    for (const [file, sf] of trees)
      visit(sf, (node) => {
        if (
          node.kind === SyntaxKind.AnyKeyword ||
          (ts.isAsExpression(node) &&
            ts.isAsExpression(node.expression) &&
            node.expression.type.kind === SyntaxKind.UnknownKeyword)
        )
          add('type-escape', file, 'Unsafe type escape in foundation');
        if (ts.isImportDeclaration(node) && name(node.moduleSpecifier)?.startsWith('@orpc/openapi'))
          add('alternate-transport', file, 'OpenAPI transport is not a first-party RPC boundary');
        if (
          ts.isIdentifier(node) &&
          ['toORPCContract', 'InferDomainClient', 'InferRouteClient'].includes(node.text)
        )
          add('legacy-converter', file, 'Legacy contract conversion or inference remains');
      });
    const contract = trees.get(contractFile);
    if (contract) {
      const value = variable(contract, 'appContract');
      const object = value && ts.isSatisfiesExpression(value) ? value.expression : undefined;
      if (
        !exactTree(object, {
          identity: {
            session: nativeProcedure,
            scopes: nativeProcedure,
            entry: nativeProcedure,
            createInitialBond: nativeProcedure,
            syncGrant: nativeProcedure,
            deletion: {
              status: nativeProcedure,
              request: nativeProcedure,
              cancel: nativeProcedure,
            },
          },
          authority: { refreshSnapshot: nativeProcedure },
        }) ||
        !imported(contract, '@orpc/contract', 'RouterContract') ||
        !imported(contract, '@orpc/contract', 'oc') ||
        !has(
          variable(contract, 'foundation'),
          (node) => call(node, 'errors') && name(node.expression.expression) === 'oc',
        )
      )
        add(
          'contract',
          contractFile,
          'Foundation must declare only the admitted native identity and authority procedures',
        );
    }
    const client = trees.get(clientFile);
    if (client) {
      const prefix = variable(client, 'API_V1_PREFIX');
      let links = 0;
      visit(client, (node) => {
        if (ts.isNewExpression(node) && name(node.expression) === 'RPCLink') {
          links++;
          if (name(property(node.arguments?.[0], 'url')) !== 'API_V1_PREFIX')
            add('client-base', clientFile, 'RPCLink must use API_V1_PREFIX');
        }
      });
      if (
        name(prefix) !== '/api/v1' ||
        links !== 1 ||
        !imported(client, '@orpc/client/fetch', 'RPCLink') ||
        !imported(client, '@orpc/client', 'createORPCClient')
      )
        add('client-base', clientFile, 'One native RPCLink and the /api/v1 prefix are required');
    }
    const router = trees.get(routerFile);
    const rootRouter = router && variable(router, 'router');
    const builder = router && variable(router, 'api');
    if (
      router &&
      (!imported(router, '@orpc/server', 'implement') ||
        !imported(router, '@repo/core/api/v1/contract', 'appContract') ||
        !has(
          builder,
          (node) =>
            ts.isCallExpression(node) &&
            name(node.expression) === 'implement' &&
            name(node.arguments[0]) === 'appContract',
        ) ||
        !rootRouter ||
        !call(rootRouter, 'router') ||
        name(rootRouter.expression.expression) !== 'api' ||
        rootRouter.arguments.length !== 1 ||
        !exactTree(rootRouter.arguments[0], {
          identity: {
            session: (node) => nativeHandler(node, 'identity.session'),
            scopes: (node) => nativeHandler(node, 'identity.scopes'),
            entry: (node) => nativeHandler(node, 'identity.entry'),
            createInitialBond: (node) => nativeHandler(node, 'identity.createInitialBond'),
            syncGrant: (node) => nativeHandler(node, 'identity.syncGrant'),
            deletion: {
              status: (node) => nativeHandler(node, 'identity.deletion.status'),
              request: (node) => nativeHandler(node, 'identity.deletion.request'),
              cancel: (node) => nativeHandler(node, 'identity.deletion.cancel'),
            },
          },
          authority: {
            refreshSnapshot: (node) => nativeHandler(node, 'authority.refreshSnapshot'),
          },
        }))
    )
      add(
        'router',
        routerFile,
        'Server router must implement the admitted native identity and authority procedures',
      );
    const app = trees.get(appFile);
    if (app) {
      if (
        !imported(app, '@orpc/server/fetch', 'RPCHandler') ||
        !imported(app, '@repo/core/api/v1/client', 'API_V1_PREFIX') ||
        !imported(app, './router', 'router')
      )
        add(
          'rpc-composition',
          appFile,
          'Native handler, router and shared prefix imports are required',
        );
      const handlers = [];
      const mounts = [];
      let constructorCount = 0;
      visit(app, (node) => {
        if (ts.isNewExpression(node) && name(node.expression) === 'RPCHandler') constructorCount++;
        if (
          ts.isVariableDeclaration(node) &&
          node.initializer &&
          ts.isNewExpression(node.initializer) &&
          name(node.initializer.expression) === 'RPCHandler'
        )
          handlers.push(name(node.name));
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          name(node.expression.expression) === 'app' &&
          ['all', 'get', 'post', 'put', 'patch', 'delete', 'route'].includes(
            node.expression.name.text,
          )
        )
          mounts.push(node);
      });
      const rpcMount = mounts.filter(
        (node) => node.expression.name.text === 'all' && name(node.arguments[0]) === '/api/v1/*',
      );
      const nativeCalls = [];
      if (rpcMount.length === 1)
        visit(rpcMount[0], (node) => {
          if (call(node, 'handle') && name(node.expression.expression) === handlers[0])
            nativeCalls.push(node);
        });
      const context = property(nativeCalls[0]?.arguments[1], 'context');
      const platform = property(context, 'platform');
      const projection =
        context &&
        ts.isObjectLiteralExpression(context) &&
        context.properties.filter((entry) => name(entry.name) === 'platform').length === 1 &&
        !context.properties.some((entry) => ts.isSpreadAssignment(entry)) &&
        platform &&
        ts.isBinaryExpression(platform) &&
        platform.operatorToken.kind === SyntaxKind.AmpersandAmpersandToken &&
        accessPath(platform.left)?.join('.') === 'options.platform' &&
        exactTree(platform.right, {
          security: (node) => accessPath(node)?.join('.') === 'options.platform.security',
          executeAccountCommand: (node) =>
            accessPath(node)?.join('.') === 'options.platform.executeAccountCommand',
          syncGrants: (node) => accessPath(node)?.join('.') === 'options.platform.syncGrants',
          withAccountData: (node) =>
            accessPath(node)?.join('.') === 'options.platform.withAccountData',
        });
      if (nativeCalls.length !== 1 || !projection)
        add(
          'request-authority',
          appFile,
          'Native request context must project only admitted platform services',
        );
      if (
        constructorCount !== 1 ||
        handlers.length !== 1 ||
        rpcMount.length !== 1 ||
        !has(
          rpcMount[0],
          (node) =>
            call(node, 'handle') &&
            name(node.expression.expression) === handlers[0] &&
            name(property(node.arguments[1], 'prefix')) === 'API_V1_PREFIX',
        )
      )
        add(
          'rpc-composition',
          appFile,
          'One /api/v1/* mount must invoke the native handler with the shared prefix',
        );
      for (const node of mounts) {
        const method = node.expression.name.text;
        const mount = name(node.arguments[0]);
        if (
          !(
            (method === 'all' && mount === '/api/v1/*') ||
            (method === 'get' && (mount === '/health/live' || mount === '/health/ready'))
          )
        )
          add('unexpected-mount', appFile, `Unclassified ${method} mount ${mount ?? '<dynamic>'}`);
      }
      for (const health of ['/health/live', '/health/ready'])
        if (
          !mounts.some(
            (node) => node.expression.name.text === 'get' && name(node.arguments[0]) === health,
          )
        )
          add('health', appFile, `Missing ${health}`);
    }
    const absolute = Object.fromEntries(
      Object.entries(files)
        .filter(([file]) => trees.has(file))
        .map(([file, text]) => [path.resolve(root, file).replaceAll('\\', '/'), text]),
    );
    const snapshot = api.createSnapshot({
      fileSystem: { kind: 'layer', files: absolute },
      createPrograms: [
        { rootFiles: Object.keys(absolute), compilerOptions: { noLib: true, noResolve: true } },
      ],
    });
    try {
      for (const d of snapshot.operation.createdPrograms[0].getSyntacticDiagnostics())
        add('syntax-error', d.fileName ?? '<unknown>', `Parse diagnostic ${d.code}`);
    } finally {
      snapshot.dispose();
    }
    issues.sort(
      (a, b) =>
        a.file.localeCompare(b.file) ||
        a.code.localeCompare(b.code) ||
        a.detail.localeCompare(b.detail),
    );
    return {
      scope:
        'G0 static source inspection of admitted identity and authority foundation; no business feature coverage, runtime, authorization or deployment proof',
      issues,
    };
  } finally {
    for (const lease of leases) lease.dispose();
    api.close();
  }
}

function collect(dir, files) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return;
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) collect(relative, files);
    else if (entry.isFile() && /\.(?:ts|tsx|js|mjs)$/.test(entry.name) && !isReferenceOnly(relative))
      files[relative] = fs.readFileSync(path.join(root, relative), 'utf8');
  }
}
function main() {
  const unknown = process.argv.slice(2).filter((arg) => arg !== '--json');
  if (unknown.length) {
    console.error(`Unknown argument(s): ${unknown.join(', ')}`);
    process.exitCode = 2;
    return;
  }
  const files = {};
  collect('apps/sanctuary-api/src', files);
  collect('apps/sanctuary-api/scripts', files);
  collect('packages/core/src/api', files);
  const result = auditComposition(files);
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(
      `API composition audit: ${result.issues.length ? 'FAILED' : 'passed'} (${result.scope})`,
    );
    for (const issue of result.issues)
      console.log(`- ${issue.code}: ${issue.file}: ${issue.detail}`);
  }
  if (result.issues.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
