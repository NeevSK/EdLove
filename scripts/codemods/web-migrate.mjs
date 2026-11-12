#!/usr/bin/env node
/**
 * Next -> Vite/Astro migration codemod (decision: docs/decisions/2026-11-12-web-stack-astro-vite.md).
 *
 * Reads every page under apps/gurudevi-web/app and sorts it:
 *
 *   explore-ready   app/(sanctuary) page with an `if (isExplore) { ... return <jsx> }` block that only
 *                   uses imports, literals and route params. The block becomes a TanStack Router route
 *                   in spa/routes, exactly like the hand-written spa/routes/self.tsx.
 *   explore-review  has the block, but it awaits something or uses a local the codemod cannot map.
 *   client-wrap     no explore block and no server work: can be wrapped as a route as is (later segment).
 *   server-data     reads cookies/headers or fetches on the server: needs its data moved to the v1 API.
 *   astro-static    app/(marketing) page with no 'use client': Astro can render it at build, no JS.
 *   astro-island    app/(marketing) page marked 'use client': needs a client:* island in Astro.
 *
 *   node scripts/codemods/web-migrate.mjs                       dry run: report only, writes nothing
 *   node scripts/codemods/web-migrate.mjs --write --segment=explore   write explore-ready routes
 *   node scripts/codemods/web-migrate.mjs --json                machine-readable report
 *
 * Never overwrites an existing route file. Next keeps serving every page; nothing in app/ changes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = process.cwd();
// The TypeScript 6 compiler API, loaded the way the other repo scripts do (TypeScript 7 has no JS API yet).
const ts6 = fs
  .readdirSync(path.join(ROOT, 'node_modules/.pnpm'))
  .filter((d) => d.startsWith('@typescript+typescript6@'))
  .sort()
  .pop();
const ts = createRequire(
  path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'),
)('./lib/typescript.js');

const WEB = path.join(ROOT, 'apps/gurudevi-web');
const APP = path.join(WEB, 'app');
const ROUTES = path.join(WEB, 'spa/routes');
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const JSON_OUT = args.includes('--json');
const SEGMENT = (args.find((a) => a.startsWith('--segment=')) ?? '--segment=explore').split('=')[1];

const GLOBALS = new Set([
  'undefined',
  'true',
  'false',
  'null',
  'Math',
  'Date',
  'JSON',
  'Number',
  'String',
  'Boolean',
  'Array',
  'Object',
  'console',
  'React',
]);
const SERVER_SIGNS =
  /from ['"]next\/headers['"]|createServerSupabaseClient|resolveAuthorizedEntry|from ['"]server-only['"]/;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === 'node_modules' ? [] : walk(p);
    return d.name === 'page.tsx' ? [p] : [];
  });
}

/** URL segments of a page: route groups dropped, [x] -> $x, [...x] -> $. */
function urlSegments(file, base) {
  return path
    .relative(base, path.dirname(file))
    .split(path.sep)
    .filter((s) => s && !/^\(.*\)$/.test(s))
    .map((s) => (/^\[\.\.\..+\]$/.test(s) ? '$' : s.replace(/^\[(.+)\]$/, '$$$1')));
}

const sanctuaryPages = walk(path.join(APP, '(sanctuary)'));
const routeDirs = new Set(
  sanctuaryPages.map((f) => urlSegments(f, path.join(APP, '(sanctuary)')).join('/')),
);

function routeTarget(segs) {
  const key = segs.join('/');
  const hasChildren = [...routeDirs].some((d) => d !== key && d.startsWith(`${key}/`));
  if (segs.length === 0) return { file: path.join(ROUTES, 'index.tsx'), routePath: '/' };
  return hasChildren
    ? { file: path.join(ROUTES, ...segs, 'index.tsx'), routePath: `/${key}/` }
    : { file: path.join(ROUTES, ...segs.slice(0, -1), `${segs.at(-1)}.tsx`), routePath: `/${key}` };
}

function importsOf(sf) {
  const map = new Map(); // local name -> { spec, kind: 'default'|'named'|'ns', imported }
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause || st.importClause.isTypeOnly) continue;
    const spec = st.moduleSpecifier.text;
    const c = st.importClause;
    if (c.name) map.set(c.name.text, { spec, kind: 'default' });
    const nb = c.namedBindings;
    if (nb && ts.isNamespaceImport(nb)) map.set(nb.name.text, { spec, kind: 'ns' });
    if (nb && ts.isNamedImports(nb))
      for (const el of nb.elements) {
        if (el.isTypeOnly) continue;
        map.set(el.name.text, { spec, kind: 'named', imported: (el.propertyName ?? el.name).text });
      }
  }
  return map;
}

function declaredNames(node, out = new Set()) {
  const bind = (n) => {
    if (ts.isIdentifier(n)) out.add(n.text);
    else if (ts.isObjectBindingPattern(n) || ts.isArrayBindingPattern(n))
      for (const el of n.elements) if (!ts.isOmittedExpression(el)) bind(el.name);
  };
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) || ts.isParameter(n)) bind(n.name);
    if ((ts.isFunctionDeclaration(n) || ts.isClassDeclaration(n)) && n.name) out.add(n.name.text);
    ts.forEachChild(n, visit);
  };
  visit(node);
  return out;
}

/** Identifiers the block reads but does not declare. */
function freeNames(block) {
  const declared = declaredNames(block);
  const free = new Set();
  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const isKey =
        (ts.isPropertyAccessExpression(p) && p.name === n) ||
        (ts.isJsxAttribute(p) && p.name === n) ||
        (ts.isPropertyAssignment(p) && p.name === n) ||
        (ts.isBindingElement(p) && p.propertyName === n);
      const isIntrinsicTag =
        (ts.isJsxOpeningElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxClosingElement(p)) &&
        p.tagName === n &&
        /^[a-z]/.test(n.text);
      if (!isKey && !isIntrinsicTag && !declared.has(n.text)) free.add(n.text);
      if (ts.isShorthandPropertyAssignment(p) && !declared.has(n.text)) free.add(n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(block);
  return free;
}

function findExploreIf(fn) {
  let found = null;
  const visit = (n) => {
    if (found) return;
    if (ts.isIfStatement(n) && /^\s*isExplore(Mode)?\s*$/.test(n.expression.getText())) found = n;
    else ts.forEachChild(n, visit);
  };
  visit(fn);
  return found;
}

/** Locals outside the block whose value comes from the route params. */
function paramLocals(fn, sf) {
  const names = new Set();
  const visit = (n) => {
    if (
      ts.isVariableDeclaration(n) &&
      n.initializer &&
      /\bparams\b|resolvedParams/i.test(n.initializer.getText(sf)) &&
      !/searchParams/i.test(n.initializer.getText(sf))
    )
      for (const nm of declaredNames(n)) names.add(nm);
    ts.forEachChild(n, visit);
  };
  visit(fn);
  return names;
}

function relSpec(spec, fromFile, toFile) {
  if (!spec.startsWith('.')) return spec;
  const abs = path.resolve(path.dirname(fromFile), spec);
  let r = path.relative(path.dirname(toFile), abs).split(path.sep).join('/');
  if (!r.startsWith('.')) r = `./${r}`;
  return r;
}

function analyseSanctuary(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const segs = urlSegments(file, path.join(APP, '(sanctuary)'));
  const target = routeTarget(segs);
  const rel = path.relative(WEB, file);
  const fn = sf.statements.find(
    (s) =>
      ts.isFunctionDeclaration(s) &&
      s.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword),
  );
  const base = { file: rel, route: target.routePath, routeFile: path.relative(WEB, target.file) };
  if (!fn) return { ...base, kind: 'server-data', why: 'no default function' };
  const ifs = findExploreIf(fn);
  if (!ifs) {
    const server = SERVER_SIGNS.test(src) || /\bawait\b/.test(fn.getText(sf));
    return {
      ...base,
      kind: server ? 'server-data' : 'client-wrap',
      why: server ? 'server reads or fetches' : '',
    };
  }
  const block = ifs.thenStatement;
  const blockText = block.getText(sf);
  if (/\bawait\b/.test(blockText))
    return { ...base, kind: 'explore-review', why: 'awaits inside the explore branch' };
  const imports = importsOf(sf);
  const fromParams = paramLocals(fn, sf);
  const dynamic = segs.filter((s) => s.startsWith('$') && s !== '$').map((s) => s.slice(1));
  const needImports = new Map();
  const needParams = new Set();
  const unknown = [];
  for (const name of freeNames(block)) {
    if (GLOBALS.has(name)) continue;
    if (imports.has(name)) needImports.set(name, imports.get(name));
    else if (fromParams.has(name) && dynamic.includes(name)) needParams.add(name);
    else unknown.push(name);
  }
  if (unknown.length)
    return { ...base, kind: 'explore-review', why: `uses locals: ${unknown.join(', ')}` };
  if (fs.existsSync(target.file))
    return { ...base, kind: 'exists', why: 'route file already written' };
  return {
    ...base,
    kind: 'explore-ready',
    why: '',
    plan: { needImports, needParams, block, sf, target },
  };
}

function renderRoute(file, plan) {
  const { needImports, needParams, block, sf, target } = plan;
  const bySpec = new Map();
  for (const [local, imp] of needImports) {
    const spec = relSpec(imp.spec, file, target.file);
    if (!bySpec.has(spec)) bySpec.set(spec, { def: null, ns: null, named: [] });
    const e = bySpec.get(spec);
    if (imp.kind === 'default') e.def = local;
    else if (imp.kind === 'ns') e.ns = local;
    else e.named.push(imp.imported === local ? local : `${imp.imported} as ${local}`);
  }
  const lines = ["import { createFileRoute } from '@tanstack/react-router';"];
  for (const [spec, e] of [...bySpec].sort(([a], [b]) => a.localeCompare(b))) {
    const parts = [];
    if (e.def) parts.push(e.def);
    if (e.ns) parts.push(`* as ${e.ns}`);
    if (e.named.length) parts.push(`{ ${e.named.sort().join(', ')} }`);
    lines.push(`import ${parts.join(', ')} from '${spec}';`);
  }
  const bodyStatements = ts.isBlock(block) ? block.statements : [block];
  const body = bodyStatements.map((s) => s.getText(sf)).join('\n');
  const paramLine = needParams.size
    ? `  const { ${[...needParams].join(', ')} } = Route.useParams();\n`
    : '';
  const pageRel = path.relative(WEB, file).split(path.sep).join('/');
  return `${lines.join('\n')}

// Generated by scripts/codemods/web-migrate.mjs from the explore branch of ${pageRel},
// decided at build time instead of per request. Edit freely; the codemod never overwrites it.
export const Route = createFileRoute('${target.routePath}')({
  component: ExploreRoute,
});

function ExploreRoute() {
${paramLine}${body
  .split('\n')
  .map((l) => `  ${l}`)
  .join('\n')}
}
`;
}

function analyseMarketing(file) {
  const src = fs.readFileSync(file, 'utf8');
  const segs = urlSegments(file, path.join(APP, '(marketing)'));
  const client = /^\s*['"]use client['"]/.test(src);
  const server = SERVER_SIGNS.test(src);
  return {
    file: path.relative(WEB, file),
    route: `/${segs.join('/')}`,
    kind: server ? 'server-data' : client ? 'astro-island' : 'astro-static',
    why: server ? 'reads cookies/headers' : '',
  };
}

const sanctuary = sanctuaryPages.map(analyseSanctuary);
const marketing = walk(path.join(APP, '(marketing)')).map(analyseMarketing);

const written = [];
if (WRITE && SEGMENT === 'explore') {
  for (const r of sanctuary.filter((x) => x.kind === 'explore-ready')) {
    const abs = path.join(WEB, r.file);
    fs.mkdirSync(path.dirname(r.plan.target.file), { recursive: true });
    fs.writeFileSync(r.plan.target.file, renderRoute(abs, r.plan));
    written.push(r.routeFile);
  }
}

const strip = (r) => ({
  file: r.file,
  route: r.route,
  kind: r.kind,
  routeFile: r.routeFile,
  why: r.why,
});
if (JSON_OUT) {
  console.log(
    JSON.stringify(
      { sanctuary: sanctuary.map(strip), marketing: marketing.map(strip), written },
      null,
      2,
    ),
  );
} else {
  const count = (rows) =>
    Object.entries(rows.reduce((a, r) => ((a[r.kind] = (a[r.kind] ?? 0) + 1), a), {}))
      .map(([k, v]) => `${k} ${v}`)
      .join(', ');
  console.log(`${WRITE ? 'WRITE' : 'DRY RUN'}  segment=${SEGMENT}\n`);
  console.log(`Sanctuary/Explore pages (${sanctuary.length}): ${count(sanctuary)}`);
  for (const r of sanctuary.filter((x) => x.kind.startsWith('explore') || x.kind === 'exists'))
    console.log(
      `  ${r.kind.padEnd(15)} ${r.route.padEnd(34)} -> ${r.routeFile}${r.why ? `   (${r.why})` : ''}`,
    );
  console.log(`\nMarketing pages (${marketing.length}): ${count(marketing)}`);
  for (const r of marketing) console.log(`  ${r.kind.padEnd(15)} ${r.route}`);
  if (written.length)
    console.log(`\nWrote ${written.length} route files:\n  ${written.join('\n  ')}`);
}
