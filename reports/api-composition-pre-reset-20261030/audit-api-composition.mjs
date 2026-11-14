#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SyntaxKind } from 'typescript/ast';
import * as ts from 'typescript/ast/is';
import { API } from 'typescript/sync';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const paths = {
  app: 'apps/sanctuary-api/src/core/app.ts',
  route: 'apps/sanctuary-api/src/core/routes/orpc.ts',
  client: 'packages/core/src/api/orpcClient.ts',
  contract: 'packages/core/src/api/appContract.ts',
  router: 'apps/sanctuary-api/src/core/router.ts',
  adapter: 'apps/sanctuary-api/src/core/orpc.ts',
  health: 'apps/sanctuary-api/src/core/routes/health.ts',
  provider: 'apps/sanctuary-api/src/doors/omnichannel.ts',
};
const walk = (node, visit) => {
  visit(node);
  node.forEachChild((child) => {
    walk(child, visit);
  });
};
const textName = (node) =>
  node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined;
const prop = (object, key) =>
  object && ts.isObjectLiteralExpression(object)
    ? object.properties.find((p) => ts.isPropertyAssignment(p) && textName(p.name) === key)
    : undefined;
const propertyValue = (object, key) => prop(object, key)?.initializer;
const isCall = (node, name) =>
  ts.isCallExpression(node) &&
  (ts.isIdentifier(node.expression)
    ? node.expression.text === name
    : ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === name);
const isAny = (node) => node.kind === SyntaxKind.AnyKeyword;

/** Static source audit; input map contains repository-relative files. */
export function auditComposition(files) {
  const api = new API();
  const leases = [];
  try {
    const issues = [];
    const add = (code, file, detail) => {
      if (
        !issues.some(
          (issue) => issue.code === code && issue.file === file && issue.detail === detail,
        )
      )
        issues.push({ code, file, detail });
    };
    const trees = new Map(
      Object.entries(files).map(([file, text]) => {
        const lease = api.createSourceFile(file, text);
        leases.push(lease);
        return [file, lease.sourceFile];
      }),
    );
    const required = Object.values(paths);
    for (const file of required)
      if (!trees.has(file))
        add('missing-boundary', file, 'Required composition boundary is missing');
    const tree = (key) => trees.get(paths[key]);
    const contains = (rootNode, predicate) => {
      let found = false;
      if (rootNode)
        walk(rootNode, (node) => {
          if (predicate(node)) found = true;
        });
      return found;
    };
    const literal = (node) => (node && ts.isStringLiteral(node) ? node.text : undefined);

    const client = tree('client');
    const links = [];
    if (client)
      walk(client, (node) => {
        if (ts.isNewExpression(node) && textName(node.expression) === 'RPCLink') links.push(node);
      });
    if (links.length !== 1 || literal(propertyValue(links[0]?.arguments?.[0], 'url')) !== '/api/v1')
      add('rpc-client-base', paths.client, 'RPCLink must use the literal /api/v1 base');

    const route = tree('route');
    const handlePrefixes = [];
    let hasV1Mount = false;
    if (route)
      walk(route, (node) => {
        if (isCall(node, 'handle'))
          handlePrefixes.push(literal(propertyValue(node.arguments[1], 'prefix')));
        if (isCall(node, 'all') && literal(node.arguments[0]) === '/api/v1/*') hasV1Mount = true;
        if (
          isCall(node, 'all') &&
          literal(node.arguments[0])?.startsWith('/api/') &&
          literal(node.arguments[0]) !== '/api/v1/*'
        )
          add('legacy-rpc-mount', paths.route, `Non-v1 RPC mount ${literal(node.arguments[0])}`);
      });
    if (!hasV1Mount || handlePrefixes.length !== 1 || handlePrefixes[0] !== '/api/v1')
      add(
        'rpc-server-base',
        paths.route,
        'Native RPC mount and handler prefix must both be /api/v1',
      );

    // Only accept a traceable registrar -> callback -> handler.handle chain.
    let linkedRegistrar;
    if (route)
      for (const declaration of route.statements) {
        if (
          !ts.isFunctionDeclaration(declaration) ||
          !declaration.name ||
          declaration.parameters.length < 2 ||
          !declaration.body
        )
          continue;
        const handlerName = textName(declaration.parameters[1].name);
        if (!handlerName) continue;
        const helpers = new Set();
        let direct = false;
        walk(declaration.body, (node) => {
          if (!isCall(node, 'all') || literal(node.arguments[0]) !== '/api/v1/*') return;
          for (const callback of node.arguments.slice(1))
            walk(callback, (child) => {
              if (
                ts.isCallExpression(child) &&
                ts.isPropertyAccessExpression(child.expression) &&
                textName(child.expression.expression) === handlerName &&
                child.expression.name.text === 'handle' &&
                literal(propertyValue(child.arguments[1], 'prefix')) === '/api/v1'
              )
                direct = true;
              if (
                ts.isCallExpression(child) &&
                ts.isIdentifier(child.expression) &&
                textName(child.arguments[1]) === handlerName
              )
                helpers.add(child.expression.text);
            });
        });
        for (const helper of route.statements) {
          if (
            !ts.isFunctionDeclaration(helper) ||
            !helper.name ||
            !helpers.has(helper.name.text) ||
            helper.parameters.length < 2 ||
            !helper.body
          )
            continue;
          const helperHandler = textName(helper.parameters[1].name);
          if (
            contains(
              helper.body,
              (node) =>
                ts.isCallExpression(node) &&
                ts.isPropertyAccessExpression(node.expression) &&
                textName(node.expression.expression) === helperHandler &&
                node.expression.name.text === 'handle' &&
                literal(propertyValue(node.arguments[1], 'prefix')) === '/api/v1',
            )
          )
            direct = true;
        }
        if (direct) linkedRegistrar = declaration.name.text;
      }
    if (!linkedRegistrar)
      add(
        'unresolved-rpc-composition',
        paths.route,
        'Cannot trace the v1 mount callback to the registered handler and prefix',
      );

    const app = tree('app');
    const appDependencies = new Set();
    const rpcInstances = [];
    let rpcConstructorCount = 0;
    if (app)
      walk(app, (node) => {
        if (ts.isNewExpression(node) && textName(node.expression) === 'RPCHandler')
          rpcConstructorCount++;
        if (
          ts.isVariableDeclaration(node) &&
          ts.isIdentifier(node.name) &&
          node.initializer &&
          ts.isNewExpression(node.initializer) &&
          textName(node.initializer.expression) === 'RPCHandler'
        )
          rpcInstances.push(node.name.text);
        if (ts.isNewExpression(node) && textName(node.expression) === 'OpenAPIHandler')
          add(
            'alternate-openapi',
            paths.app,
            'OpenAPIHandler is composed at the first-party app boundary; remove or classify an explicitly external adapter',
          );
        if (
          ts.isNewExpression(node) &&
          ['RPCHandler', 'OpenAPIHandler'].includes(textName(node.expression)) &&
          contains(node.arguments?.[0], (n) => isAny(n))
        )
          add('type-escape', paths.app, 'Handler router is cast to any');
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          textName(node.expression.expression) === 'app' &&
          ['route', 'all', 'get', 'post', 'put', 'patch', 'delete'].includes(
            node.expression.name.text,
          )
        ) {
          const mount = literal(node.arguments[0]);
          if (!mount)
            add('unresolved-mount', paths.app, 'Dynamic app route cannot be classified statically');
          else if (
            mount.startsWith('/api/') &&
            !['/api/auth', '/api/mcp', '/api/ws', '/api/ai'].some(
              (allowed) => mount === allowed || mount.startsWith(`${allowed}/`),
            )
          )
            add('alternate-api-mount', paths.app, `Unclassified API route ${mount}`);
          else if (mount === '/api')
            add(
              'unresolved-mount',
              paths.app,
              'An /api subrouter requires explicit protocol classification',
            );
        }
      });
    if (app)
      for (const statement of app.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          !ts.isStringLiteral(statement.moduleSpecifier) ||
          !statement.moduleSpecifier.text.startsWith('.')
        )
          continue;
        const bindings = statement.importClause?.namedBindings;
        if (!bindings || !ts.isNamedImports(bindings)) continue;
        const base = path.posix.normalize(
          path.posix.join(path.posix.dirname(paths.app), statement.moduleSpecifier.text),
        );
        const imported = trees.get(`${base}.ts`) ?? trees.get(`${base}/index.ts`);
        if (!imported) continue;
        for (const binding of bindings.elements) {
          if (binding.name.text === linkedRegistrar) continue;
          if (!contains(app, (node) => isCall(node, binding.name.text))) continue;
          appDependencies.add(imported.fileName);
          if (
            contains(
              app,
              (node) =>
                isCall(node, binding.name.text) &&
                node.arguments.some((arg) => textName(arg) === 'app'),
            )
          )
            add(
              'unresolved-mount',
              imported.fileName,
              `App-passed registrar ${binding.name.text} needs explicit inspection`,
            );
          if (
            contains(
              imported,
              (node) => ts.isNewExpression(node) && textName(node.expression) === 'OpenAPIHandler',
            )
          )
            add(
              'alternate-openapi',
              imported.fileName,
              'App-called imported module constructs an OpenAPI handler',
            );
          if (
            contains(
              imported,
              (node) =>
                ts.isCallExpression(node) &&
                ts.isPropertyAccessExpression(node.expression) &&
                ['route', 'get', 'post', 'put', 'patch', 'delete', 'all'].includes(
                  node.expression.name.text,
                ) &&
                literal(node.arguments[0])?.startsWith('/api/'),
            )
          )
            add(
              'unresolved-mount',
              imported.fileName,
              'App-called imported module registers an API path; classify the mount',
            );
        }
      }
    if (
      app &&
      (rpcConstructorCount !== 1 ||
        rpcInstances.length !== 1 ||
        !linkedRegistrar ||
        !contains(
          app,
          (node) =>
            isCall(node, linkedRegistrar) &&
            textName(node.arguments[0]) === 'app' &&
            textName(node.arguments[1]) === rpcInstances[0],
        ) ||
        !contains(
          app,
          (node) =>
            ts.isImportSpecifier(node) &&
            node.name.text === linkedRegistrar &&
            ts.isImportDeclaration(node.parent.parent.parent) &&
            literal(node.parent.parent.parent.moduleSpecifier)?.endsWith('/routes/orpc'),
        ))
    )
      add(
        'unresolved-rpc-composition',
        paths.app,
        'Exactly one RPCHandler must be passed to the imported v1 registrar',
      );
    const mountedImport = (sf, moduleSuffix) => {
      const names = new Set();
      for (const statement of sf.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          !ts.isStringLiteral(statement.moduleSpecifier) ||
          !statement.moduleSpecifier.text.endsWith(moduleSuffix)
        )
          continue;
        const bindings = statement.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings))
          for (const item of bindings.elements) names.add(item.name.text);
        if (statement.importClause?.name) names.add(statement.importClause.name.text);
      }
      return contains(
        sf,
        (node) =>
          isCall(node, 'route') &&
          literal(node.arguments[0]) === '/' &&
          !!node.arguments[1] &&
          ((ts.isIdentifier(node.arguments[1]) && names.has(node.arguments[1].text)) ||
            (ts.isCallExpression(node.arguments[1]) &&
              ts.isIdentifier(node.arguments[1].expression) &&
              names.has(node.arguments[1].expression.text))),
      );
    };
    for (const [key, suffix] of [
      ['app', '/routes/health'],
      ['app', '/doors/omnichannel'],
      ['provider', '/routes/payhereWebhook'],
    ]) {
      if (tree(key) && !mountedImport(tree(key), suffix))
        add('missing-boundary', paths[key], `The ${suffix} boundary is not mounted`);
    }
    if (
      tree('health') &&
      !contains(
        tree('health'),
        (n) => isCall(n, 'get') && literal(n.arguments[0])?.startsWith('/health/'),
      )
    )
      add('missing-boundary', paths.health, 'No health endpoint is declared');

    for (const key of ['client', 'contract', 'route']) {
      if (tree(key))
        walk(tree(key), (node) => {
          if (
            isAny(node) ||
            (ts.isAsExpression(node) &&
              ts.isAsExpression(node.expression) &&
              node.expression.type.kind === SyntaxKind.UnknownKeyword)
          )
            add(
              'type-escape',
              paths[key],
              `Unsafe type escape at line ${tree(key).getLineAndCharacterOfPosition(node.pos).line + 1}`,
            );
        });
    }
    const contract = tree('contract');
    if (
      contract &&
      contains(
        contract,
        (n) =>
          ts.isIdentifier(n) &&
          ['InferDomainClient', 'InferRouteClient', 'InferRouteInput', 'InferRouteOutput'].includes(
            n.text,
          ),
      )
    )
      add('legacy-client-inference', paths.contract, 'Legacy declaration client inference remains');

    // Follow relative imports from the actual composition roots, not every dormant file.
    const pending = [paths.router, paths.contract];
    const seen = new Set();
    while (pending.length) {
      const file = pending.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      const sf = trees.get(file);
      if (!sf) continue;
      for (const statement of sf.statements) {
        if (
          !(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) ||
          !statement.moduleSpecifier ||
          !ts.isStringLiteral(statement.moduleSpecifier)
        )
          continue;
        const specifier = statement.moduleSpecifier.text;
        if (specifier.startsWith('.')) {
          const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
          const target = [base + '.ts', base + '/index.ts'].find((candidate) =>
            trees.has(candidate),
          );
          if (target) pending.push(target);
        }
        if (
          ts.isImportDeclaration(statement) &&
          /\/core\/handlers\//.test(file) &&
          /(^|\/)orpc$/.test(specifier) &&
          statement.importClause?.namedBindings &&
          ts.isNamedImports(statement.importClause.namedBindings) &&
          statement.importClause.namedBindings.elements.some(
            (e) => (e.propertyName ?? e.name).text === 'implement',
          )
        )
          add('legacy-converter', file, 'Handler imports the local legacy implement adapter');
      }
      if (file.startsWith('packages/core/src/api/') && /contract/i.test(file))
        walk(sf, (node) => {
          if (
            ts.isObjectLiteralExpression(node) &&
            propertyValue(node, 'method') &&
            propertyValue(node, 'path') &&
            propertyValue(node, 'responses')
          )
            add(
              'legacy-contract',
              file,
              'Reachable method/path declaration is not a native procedure contract',
            );
        });
    }

    const domainOwners = new Map();
    const domainNames = new Map();
    const rootRouters = [];
    for (const [file, sf] of trees) {
      if (
        file !== paths.router &&
        !/^apps\/sanctuary-api\/src\/domains\/(?:[^/]+\/)?index\.ts$/.test(file)
      )
        continue;
      const identities = new Map();
      for (const statement of sf.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
          continue;
        const bindings = statement.importClause?.namedBindings;
        if (!bindings || !ts.isNamedImports(bindings)) continue;
        const specifier = statement.moduleSpecifier.text;
        const module = specifier.startsWith('.')
          ? path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
          : specifier;
        for (const item of bindings.elements)
          identities.set(item.name.text, `${module}:${(item.propertyName ?? item.name).text}`);
      }
      walk(sf, (node) => {
        if (!isCall(node, 'router') || !ts.isObjectLiteralExpression(node.arguments[0])) return;
        const values = new Map();
        for (const entry of node.arguments[0].properties) {
          const value = ts.isPropertyAssignment(entry)
            ? entry.initializer
            : ts.isSpreadAssignment(entry)
              ? entry.expression
              : ts.isShorthandPropertyAssignment(entry)
                ? entry.name
                : undefined;
          if (
            !value ||
            !ts.isIdentifier(value) ||
            (!/Router$/.test(value.text) && !identities.has(value.text))
          )
            continue;
          const identity = identities.get(value.text) ?? value.text;
          if (values.has(identity))
            add(
              'duplicate-router',
              file,
              `${value.text} is mounted more than once in one composition`,
            );
          values.set(identity, true);
          if (file === paths.router)
            rootRouters.push({ identity, original: identity.split(':').at(-1), name: value.text });
          if (file.includes('/domains/') && file !== 'apps/sanctuary-api/src/domains/index.ts') {
            const previous = domainOwners.get(identity);
            if (previous && previous !== file)
              add('duplicate-router', file, `${value.text} also appears in ${previous}`);
            else domainOwners.set(identity, file);
            domainNames.set(identity.split(':').at(-1), file);
          }
        }
      });
    }
    for (const value of rootRouters)
      if (domainOwners.has(value.identity) || domainNames.has(value.original))
        add(
          'root-alias',
          paths.router,
          `${value.name} is also mounted inside ${domainOwners.get(value.identity) ?? domainNames.get(value.original)}`,
        );
    if (
      tree('adapter') &&
      contains(
        tree('adapter'),
        (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'toORPCContract',
      ) &&
      [...seen].some(
        (f) =>
          f.includes('/handlers/') &&
          issues.some((i) => i.file === f && i.code === 'legacy-converter'),
      )
    )
      add('legacy-converter', paths.adapter, 'Legacy converter is used by composed handlers');
    const auditedFiles = [
      ...new Set([
        ...required,
        ...seen,
        ...appDependencies,
        ...[...trees.keys()].filter((file) =>
          /^apps\/sanctuary-api\/src\/domains\/(?:[^/]+\/)?index\.ts$/.test(file),
        ),
      ]),
    ].filter((file) => trees.has(file));
    const absoluteFiles = Object.fromEntries(
      auditedFiles.map((file) => [path.resolve(root, file).replaceAll('\\', '/'), files[file]]),
    );
    const snapshot = api.createSnapshot({
      fileSystem: { kind: 'layer', files: absoluteFiles },
      createPrograms: [
        {
          rootFiles: Object.keys(absoluteFiles),
          compilerOptions: { noLib: true, noResolve: true },
        },
      ],
    });
    try {
      const diagnostics = snapshot.operation.createdPrograms[0].getSyntacticDiagnostics();
      for (const diagnostic of diagnostics)
        add(
          'syntax-error',
          diagnostic.fileName ?? '<unknown>',
          `Parse diagnostic ${diagnostic.code}`,
        );
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
        'G0 static source inspection; no runtime, authorization, deployment or reachability proof',
      issues,
    };
  } finally {
    for (const lease of leases) lease.dispose();
    api.close();
  }
}

function collect(dir, files) {
  if (!fs.existsSync(path.join(root, dir))) return;
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) collect(relative, files);
    else if (entry.isFile() && relative.endsWith('.ts'))
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
