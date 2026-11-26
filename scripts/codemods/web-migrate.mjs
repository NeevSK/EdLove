#!/usr/bin/env node
/**
 * Next -> Vite codemod for the Gurudevi web app (decision: docs/decisions/2026-11-12-web-stack-astro-vite.md).
 *
 * Explore and sanctuary are one app. A Next page under app/(sanctuary) repeats a ladder (host, Explore,
 * dev preview, signed-in entry, state screens) around one screen. The ladder now lives once in
 * spa/routes/_app.tsx; this codemod keeps only the screen and writes it as a TanStack Router route:
 *
 *   - the ready branch's screen (the child of <SanctuaryShell>), with `entry.*` read from useSession();
 *   - props the Explore branch set and the ready branch did not (`isExplore={true}`, `mode="explore"`)
 *     become `surface === 'explore'` expressions, so the same route serves both surfaces;
 *   - route params come from Route.useParams().
 *
 * A page is `ready` when all of that maps cleanly, otherwise `review` with the reason, and never guessed.
 *
 *   node scripts/codemods/web-migrate.mjs                 dry run: report only
 *   node scripts/codemods/web-migrate.mjs --write         write every ready route (replaces generated ones)
 *   node scripts/codemods/web-migrate.mjs --json          machine-readable report
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const ts6 = fs
  .readdirSync(path.join(ROOT, 'node_modules/.pnpm'))
  .filter((d) => d.startsWith('@typescript+typescript6@'))
  .sort()
  .pop();
const ts = createRequire(
  path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'),
)('./lib/typescript.js');

const WEB = path.join(ROOT, 'apps/gurudevi-web');
const SANCTUARY = path.join(WEB, 'app/(sanctuary)');
const ROUTES = path.join(WEB, 'spa/routes/_app');
const args = new Set(process.argv.slice(2));

/** Pages with their own route outside the signed-in layout, or real server work: written by hand. */
const BY_HAND = new Set([
  'welcome', 'onboarding', 'sign-in', 'recovery', 'reset-password', 'account-recovery',
  'invitation-welcome', 'explore-intro', 'auth/callback', 'c/$code', 'community', 'school/$id',
  'school/$id/articles/$slug', 'support',
]);
const SESSION = {
  'entry.activeScope.bondId': 'activeScope?.bondId',
  'entry.activeScope.entityId': 'activeScope?.entityId',
  'entry.activeScope.entityType': 'activeScope?.entityType',
  'entry.activeScope.roles': 'activeScope?.roles',
  'entry.activeScope': 'activeScope',
  'entry.authSubjectId': 'authSubjectId',
  'entry.displayName': 'displayName',
  'entry.accountId': 'accountId',
  'entry.activeCapacity': 'capacity',
  'entry.primaryCapacity': 'primaryCapacity',
  'entry.primaryScopeRole': 'roleLabel',
};
const SHELL_PROPS = new Set([
  'displayName', 'navigationPrefix', 'activeCapacity', 'showAccountNavigation', 'isExploreMode',
  'previewCapacity', 'isDevPreview', 'unreadNotifications',
]);
const GLOBALS = new Set(['undefined', 'true', 'false', 'null', 'Math', 'Date', 'JSON', 'Number', 'String', 'Boolean', 'Array', 'Object', 'React']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === 'node_modules' ? [] : walk(p);
    return d.name === 'page.tsx' ? [p] : [];
  });
}

const segmentsOf = (file) =>
  path
    .relative(SANCTUARY, path.dirname(file))
    .split(path.sep)
    .filter((s) => s && !/^\(.*\)$/.test(s))
    .map((s) => (/^\[\.\.\..+\]$/.test(s) ? '$' : s.replace(/^\[(.+)\]$/, '$$$1')));

const pages = walk(SANCTUARY);
const routeKeys = new Set(pages.map((f) => segmentsOf(f).join('/')));

function target(segs) {
  const key = segs.join('/');
  const hasChildren = [...routeKeys].some((k) => k !== key && k.startsWith(`${key}/`));
  return hasChildren
    ? { file: path.join(ROUTES, ...segs, 'index.tsx'), routePath: `/${key}/` }
    : { file: path.join(ROUTES, ...segs.slice(0, -1), `${segs.at(-1)}.tsx`), routePath: `/${key}` };
}

function importsOf(sf) {
  const map = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause || st.importClause.isTypeOnly) continue;
    const spec = st.moduleSpecifier.text;
    const c = st.importClause;
    if (c.name) map.set(c.name.text, { spec, kind: 'default' });
    const nb = c.namedBindings;
    if (nb && ts.isNamespaceImport(nb)) map.set(nb.name.text, { spec, kind: 'ns' });
    if (nb && ts.isNamedImports(nb))
      for (const el of nb.elements)
        if (!el.isTypeOnly)
          map.set(el.name.text, { spec, kind: 'named', imported: (el.propertyName ?? el.name).text });
  }
  return map;
}

const jsxTag = (n) =>
  ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
const tagName = (n) => jsxTag(n)?.tagName.getText();

/** Every <SanctuaryShell> in the page function, marked when it sits in the Explore branch. */
function shells(fn) {
  const out = [];
  const visit = (n, explore) => {
    if (ts.isIfStatement(n)) {
      const isExplore = /^\s*isExplore(Mode)?\s*$/.test(n.expression.getText());
      visit(n.thenStatement, explore || isExplore);
      if (n.elseStatement) visit(n.elseStatement, explore);
      return;
    }
    if ((ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) && tagName(n) === 'SanctuaryShell') {
      out.push({ node: n, explore });
      return;
    }
    ts.forEachChild(n, (c) => visit(c, explore));
  };
  ts.forEachChild(fn.body, (c) => visit(c, false));
  return out;
}

const screenOf = (shell) =>
  ts.isJsxElement(shell) ? shell.children.filter((c) => !(ts.isJsxText(c) && !c.text.trim())) : [];

function attrs(el) {
  const map = new Map();
  for (const a of jsxTag(el)?.attributes.properties ?? [])
    if (ts.isJsxAttribute(a)) map.set(a.name.getText(), a);
  return map;
}

function freeNames(node) {
  const free = new Set();
  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const isKey =
        (ts.isPropertyAccessExpression(p) && p.name === n) ||
        (ts.isJsxAttribute(p) && p.name === n) ||
        (ts.isPropertyAssignment(p) && p.name === n);
      const intrinsic =
        (ts.isJsxOpeningElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxClosingElement(p)) &&
        p.tagName === n &&
        /^[a-z]/.test(n.text);
      if (!isKey && !intrinsic) free.add(n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return free;
}

function paramNames(fn, sf, dynamic) {
  const names = new Set();
  const bind = (b) => {
    if (ts.isIdentifier(b)) names.add(b.text);
    else if (ts.isObjectBindingPattern(b)) for (const e of b.elements) bind(e.name);
  };
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && n.initializer) {
      const init = n.initializer.getText(sf);
      if (/\bparams\b|resolvedParams/.test(init) && !/searchParams/i.test(init)) bind(n.name);
    }
    ts.forEachChild(n, visit);
  };
  visit(fn);
  return new Set([...names].filter((n) => dynamic.includes(n)));
}

function analyse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const segs = segmentsOf(file);
  const t = target(segs);
  const base = { page: path.relative(WEB, file), route: t.routePath, routeFile: path.relative(WEB, t.file) };
  if (BY_HAND.has(segs.join('/')))
    return { ...base, kind: 'by-hand', why: 'outside the signed-in layout, or real server work' };
  const fn = sf.statements.find(
    (s) =>
      ts.isFunctionDeclaration(s) && s.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword),
  );
  if (!fn?.body) return { ...base, kind: 'review', why: 'no default page function' };
  const all = shells(fn);
  const ready =
    all.filter((s) => !s.explore && /\bentry\./.test(s.node.getText(sf))).at(-1) ??
    all.filter((s) => !s.explore).at(-1) ??
    all.at(-1);
  if (!ready) {
    const body = fn.body.getText(sf);
    if (/\bredirect\(/.test(body)) return { ...base, kind: 'redirect', why: 'redirects only' };
    const ret = fn.body.statements.at(-1);
    const devOnly =
      fn.body.statements.length === 2 &&
      /process\.env\.NODE_ENV === 'production'[\s\S]*notFound\(\)/.test(fn.body.statements[0].getText(sf));
    if ((fn.body.statements.length === 1 || devOnly) && ret && ts.isReturnStatement(ret) && ret.expression && !/\bawait\b/.test(body)) {
      const el = ts.isParenthesizedExpression(ret.expression) ? ret.expression.expression : ret.expression;
      if (jsxTag(el)) return plain(base, sf, el, segs, devOnly ? '_dev' : '');
    }
    return { ...base, kind: 'review', why: 'no shell to lift' };
  }
  return plan(base, sf, fn, segs, ready, all.find((s) => s.explore) ?? null, t);
}

/** A page that renders one element and never reads the entry (labs, kits): the same on every surface. */
function plain(base, sf, el, segs, layout) {
  const t = { ...target(segs) };
  t.file = t.file.replace(`${path.sep}_app${path.sep}`, layout ? `${path.sep}${layout}${path.sep}` : path.sep);
  const imports = importsOf(sf);
  const needImports = new Map();
  const unknown = [];
  for (const name of freeNames(el)) {
    if (GLOBALS.has(name)) continue;
    if (imports.has(name)) needImports.set(name, imports.get(name));
    else unknown.push(name);
  }
  if (unknown.length) return { ...base, kind: 'review', why: `uses locals: ${unknown.join(', ')}` };
  return {
    ...base,
    routeFile: path.relative(WEB, t.file),
    kind: 'ready',
    why: '',
    render: { text: el.getText(sf), used: new Set(), needImports, params: [], t, file: sf.fileName, layout: layout ? `/${layout}` : '' },
  };
}

function plan(base, sf, fn, segs, ready, explore, t) {
  const extraShell = [...attrs(ready.node).keys()].filter((a) => !SHELL_PROPS.has(a));
  if (extraShell.length) return { ...base, kind: 'review', why: `shell props: ${extraShell.join(', ')}` };
  const screen = screenOf(ready.node);
  if (screen.length !== 1) return { ...base, kind: 'review', why: `${screen.length} children in the shell` };
  const el = screen[0];
  if (!jsxTag(el)) return { ...base, kind: 'review', why: 'the shell child is not an element' };
  const exploreEl = explore ? screenOf(explore.node).find((c) => tagName(c) === tagName(el)) : null;

  let text = el.getText(sf);
  const used = new Set();
  for (const [from, to] of Object.entries(SESSION))
    if (text.includes(from)) {
      text = text.split(from).join(to);
      used.add(to.split(/[?.]/)[0]);
    }
  if (/\bentry\./.test(text)) return { ...base, kind: 'review', why: 'uses other entry fields' };

  const readyAttrs = attrs(el);
  const additions = [];
  if (exploreEl)
    for (const [name, a] of attrs(exploreEl)) {
      const v = a.initializer?.getText(sf);
      const isExploreValue = v === undefined || v === '{true}' || v === '"explore"' || v === "'explore'";
      if (!isExploreValue) continue;
      const surfaceValue =
        v === '"explore"' || v === "'explore'"
          ? `surface === 'explore' ? 'explore' : ${readyAttrs.get(name)?.initializer?.getText(sf).replace(/^\{(.*)\}$/, '$1') ?? "'account'"}`
          : `surface === 'explore'${readyAttrs.has(name) ? ` || ${readyAttrs.get(name).initializer?.getText(sf).replace(/^\{(.*)\}$/, '$1') ?? 'true'}` : ''}`;
      used.add('surface');
      if (readyAttrs.has(name)) text = text.replace(readyAttrs.get(name).getText(sf), `${name}={${surfaceValue}}`);
      else additions.push(`${name}={${surfaceValue}}`);
    }
  if (additions.length) text = text.replace(/^(<[A-Za-z0-9.]+)/, `$1 ${additions.join(' ')}`);

  const dynamic = segs.filter((s) => s.startsWith('$') && s !== '$').map((s) => s.slice(1));
  const fromParams = paramNames(fn, sf, dynamic);
  const imports = importsOf(sf);
  const sessionNames = new Set([...Object.values(SESSION).map((v) => v.split(/[?.]/)[0]), 'surface']);
  const needImports = new Map();
  const unknown = [];
  const reparsed = ts.createSourceFile('x.tsx', `const x = (${text});`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const name of freeNames(reparsed.statements[0])) {
    if (name === 'x' || GLOBALS.has(name) || sessionNames.has(name) || fromParams.has(name)) continue;
    if (imports.has(name)) needImports.set(name, imports.get(name));
    else unknown.push(name);
  }
  if (unknown.length) return { ...base, kind: 'review', why: `uses locals: ${unknown.join(', ')}` };
  return {
    ...base,
    kind: 'ready',
    why: '',
    render: { text, used, needImports, params: [...fromParams], t, file: sf.fileName, layout: '/_app' },
  };
}

function relSpec(spec, fromFile, toFile) {
  if (!spec.startsWith('.')) return spec;
  let r = path
    .relative(path.dirname(toFile), path.resolve(path.dirname(fromFile), spec))
    .split(path.sep)
    .join('/');
  if (!r.startsWith('.')) r = `./${r}`;
  return r;
}

function render({ text, used, needImports, params, t, file, layout }) {
  const lines = ["import { createFileRoute } from '@tanstack/react-router';"];
  const bySpec = new Map();
  for (const [local, imp] of needImports) {
    const spec = relSpec(imp.spec, file, t.file);
    if (!bySpec.has(spec)) bySpec.set(spec, { def: null, ns: null, named: [] });
    const e = bySpec.get(spec);
    if (imp.kind === 'default') e.def = local;
    else if (imp.kind === 'ns') e.ns = local;
    else e.named.push(imp.imported === local ? local : `${imp.imported} as ${local}`);
  }
  for (const [spec, e] of bySpec) {
    const parts = [e.def, e.ns && `* as ${e.ns}`, e.named.length && `{ ${e.named.sort().join(', ')} }`].filter(Boolean);
    lines.push(`import ${parts.join(', ')} from '${spec}';`);
  }
  const fields = [...used].sort();
  if (fields.length)
    lines.push(`import { useSession } from '${relSpec('./spa/surface/session', path.join(WEB, 'x'), t.file)}';`);
  const name = `${
    t.routePath
      .split('/')
      .filter(Boolean)
      .map((s) => s.replace(/^\$/, '').replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase()))
      .join('') || 'Home'
  }Screen`;
  return `${lines.join('\n')}

export const Route = createFileRoute('${layout}${t.routePath}')({
  component: ${name},
});

function ${name}() {
${params.length ? `  const { ${params.join(', ')} } = Route.useParams();\n` : ''}${fields.length ? `  const { ${fields.join(', ')} } = useSession();\n` : ''}  return ${text};
}
`;
}

const report = pages.map(analyse).sort((a, b) => a.route.localeCompare(b.route));
const written = [];
if (args.has('--write'))
  for (const r of report.filter((x) => x.kind === 'ready')) {
    fs.mkdirSync(path.dirname(r.render.t.file), { recursive: true });
    fs.writeFileSync(r.render.t.file, render(r.render));
    written.push(r.routeFile);
  }

const strip = ({ render: _r, ...rest }) => rest;
if (args.has('--json')) console.log(JSON.stringify({ pages: report.map(strip), written }, null, 2));
else {
  const counts = report.reduce((a, r) => ((a[r.kind] = (a[r.kind] ?? 0) + 1), a), {});
  console.log(
    `${args.has('--write') ? 'WRITE' : 'DRY RUN'}  ${report.length} pages: ${Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}\n`,
  );
  for (const r of report.filter((x) => x.kind !== 'ready'))
    console.log(`  ${r.kind.padEnd(8)} ${r.route.padEnd(40)} ${r.why}`);
  if (written.length) console.log(`\nWrote ${written.length} routes.`);
}
