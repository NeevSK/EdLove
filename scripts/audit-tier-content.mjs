#!/usr/bin/env node
/**
 * Tier content audit: what each file actually contains, across every package and app.
 *
 * Folders say where a file sits; this says what it is. For each source file it records the kinds
 * of declarations (types, constants, schemas, functions, classes, side effects), its imports and
 * importers, and contracts defined more than once. Used bottom-up: settle Tier 0 (contracts)
 * everywhere, then Tier 1, and so on. Standard: tooling/architecture-tiers.mjs.
 *
 *   node scripts/audit-tier-content.mjs            # writes reports/tier-content.json and .md
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { tierOf } from '../tooling/architecture-tiers.mjs';

const ROOT = process.cwd();
// The TypeScript 6 compiler API (TypeScript 7 is native and has none). It's installed for the
// ESLint tooling as an alias, not hoisted, so find it in the pnpm store.
const ts6 = fs
  .readdirSync(path.join(ROOT, 'node_modules/.pnpm'))
  .filter((d) => d.startsWith('@typescript+typescript6@'))
  .sort()
  .pop();
const ts = createRequire(path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'))('./lib/typescript.js');

const SKIP_DIRS = new Set(['node_modules', '__tests__', 'dist', 'build', '.next', 'generated', '.expo', 'coverage', 'android', 'ios']);
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return SKIP_DIRS.has(d.name) || d.name.startsWith('.') ? [] : walk(p);
    return /\.tsx?$/.test(d.name) && !/\.(test|spec|stories)\.tsx?$/.test(d.name) && !d.name.endsWith('.d.ts') ? [p] : [];
  });
}
const dirsIn = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const roots = [...dirsIn('packages').map((p) => path.join('packages', p, 'src')), ...dirsIn('apps').map((a) => path.join('apps', a))];
const files = roots.flatMap((r) => walk(path.join(ROOT, r))).map((p) => path.relative(ROOT, p).replace(/\\/g, '/'));
const fileSet = new Set(files);

/** Workspace package name -> source root, from each package.json. */
const packageRoots = new Map();
for (const dir of ['packages', 'apps']) {
  for (const name of dirsIn(dir)) {
    const manifest = path.join(ROOT, dir, name, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    const src = fs.existsSync(path.join(ROOT, dir, name, 'src')) ? `${dir}/${name}/src` : `${dir}/${name}`;
    if (pkg.name) packageRoots.set(pkg.name, src);
  }
}

function resolve(spec, from) {
  let base = null;
  if (spec.startsWith('.')) base = path.relative(ROOT, path.resolve(ROOT, path.dirname(from), spec));
  else if (spec.startsWith('@/')) {
    const app = from.split('/').slice(0, 2).join('/');
    for (const prefix of [`${app}/src/`, `${app}/`]) {
      const candidate = prefix + spec.slice(2);
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) if (fileSet.has(candidate + ext)) return candidate + ext;
    }
    return null;
  } else {
    for (const [name, src] of packageRoots) {
      if (spec === name) base = `${src}/index`;
      else if (spec.startsWith(`${name}/`)) base = `${src}/${spec.slice(name.length + 1)}`;
    }
  }
  if (!base) return null;
  base = base.replace(/\\/g, '/');
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) if (fileSet.has(base + ext)) return base + ext;
  return null;
}

const SCHEMA_CALL = /^(z|Schema)\.|^(Data|Schema)\.(TaggedError|Class|TaggedClass|Struct)/;
const AMBIENT = /\bprocess\.env\b|\b__DEV__\b|\bDate\.now\(|\bMath\.random\(|\bglobalThis\.|\bwindow\.|\bdocument\.|\bnavigator\.|\blocalStorage\b/g;
/** Pure data builders that stay contracts: freezing, literal helpers, Effect/Context tags. */
const PURE_BUILDER = /^(\w+(\.\w+)*\.bind\(|create\w*SchemaFactory\(|Object\.(freeze|fromEntries|keys|values|entries)|Array\.from|new (Set|Map)\b|Context\.|Symbol\(|String\(|Number\()/;
/** A schema built from another schema (`Base.extend(...)`, `makeModelSchema('X')`) is still a schema. */
function isSchemaBuild(init, decl) {
  if (ts.isIdentifier(decl.name) && /Schema$/.test(decl.name.text)) return true;
  let e = init;
  while (e && (ts.isCallExpression(e) || ts.isPropertyAccessExpression(e) || ts.isAsExpression(e))) e = e.expression;
  return Boolean(e && ts.isIdentifier(e) && /^(z|zod|Schema|make\w*Schema)$|Schema$/.test(e.text));
}
function builds(init) {
  let e = init;
  while (e && (ts.isAsExpression(e) || ts.isSatisfiesExpression?.(e) || ts.isParenthesizedExpression(e) || ts.isTypeAssertionExpression?.(e))) e = e.expression;
  if (!e || !(ts.isCallExpression(e) || ts.isNewExpression(e) || ts.isTaggedTemplateExpression(e))) return false;
  return !PURE_BUILDER.test(e.getText());
}
const has = (node, kind) => node.modifiers?.some((m) => m.kind === kind);
const exported = (node) => has(node, ts.SyntaxKind.ExportKeyword);

function literalUnion(typeNode, sf) {
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  const parts = typeNode.types.map((t) => (ts.isLiteralTypeNode(t) ? t.getText(sf) : null));
  return parts.every(Boolean) && parts.length >= 2 ? [...parts].sort().join('|') : null;
}

function analyse(file) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const c = { types: 0, consts: 0, constructs: 0, ambient: 0, schemas: 0, functions: 0, functionLines: 0, classes: 0, errorClasses: 0, mutable: 0, sideEffects: 0, reexports: 0, jsx: /<[A-Z][\w.]*[\s/>]/.test(text) && file.endsWith('x') };
  const names = [];
  const unions = [];
  const imports = [];
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const spec = st.moduleSpecifier.text;
      const clause = st.importClause;
      const typeOnly = Boolean(clause?.isTypeOnly) ||
        Boolean(clause?.namedBindings && ts.isNamedImports(clause.namedBindings) && !clause.name &&
          clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every((e) => e.isTypeOnly));
      imports.push({ spec, typeOnly, target: resolve(spec, file) });
    } else if (ts.isExportDeclaration(st)) {
      c.reexports += 1;
      if (st.moduleSpecifier) imports.push({ spec: st.moduleSpecifier.text, typeOnly: st.isTypeOnly, target: resolve(st.moduleSpecifier.text, file), reexport: true });
    } else if (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isEnumDeclaration(st)) {
      c.types += 1;
      if (exported(st)) names.push(st.name.text);
      if (ts.isTypeAliasDeclaration(st)) {
        const u = literalUnion(st.type, sf);
        if (u) unions.push({ name: st.name.text, union: u });
      }
    } else if (ts.isVariableStatement(st)) {
      const isConst = (st.declarationList.flags & ts.NodeFlags.Const) !== 0;
      for (const d of st.declarationList.declarations) {
        if (exported(st) && ts.isIdentifier(d.name)) names.push(d.name.text);
        const init = d.initializer;
        if (!isConst) c.mutable += 1;
        else if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          c.functions += 1;
          c.functionLines += sf.getLineAndCharacterOfPosition(init.end).line - sf.getLineAndCharacterOfPosition(init.pos).line + 1;
        } else if (init && (SCHEMA_CALL.test(init.getText(sf)) || isSchemaBuild(init, d))) c.schemas += 1;
        else if (init && builds(init)) c.constructs += 1;
        else c.consts += 1;
      }
    } else if (ts.isFunctionDeclaration(st)) {
      c.functions += 1;
      c.functionLines += sf.getLineAndCharacterOfPosition(st.end).line - sf.getLineAndCharacterOfPosition(st.pos).line + 1;
      if (exported(st) && st.name) names.push(st.name.text);
    } else if (ts.isClassDeclaration(st)) {
      const heritage = st.heritageClauses?.map((h) => h.getText(sf)).join(' ') ?? '';
      if (/TaggedError|extends \w*Error\b|ErrorClass/.test(heritage)) c.errorClasses += 1;
      else if (/Schema\.(Class|TaggedClass)|Context\.(Service|Tag)/.test(heritage)) c.schemas += 1;
      else c.classes += 1;
      if (exported(st) && st.name) names.push(st.name.text);
    } else if (ts.isModuleDeclaration(st)) {
      c.types += 1;
    } else if (!ts.isEmptyStatement(st)) {
      c.sideEffects += 1;
    }
  }
  // Ambient reads make a module depend on where it runs, which a contract must not.
  c.ambient = (text.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '').match(AMBIENT) ?? []).length;
  return { c, names, unions, imports, lines: text.split('\n').length };
}

/** Contract: only types, constants, schemas and error classes, plus small pure helpers. */
function shape({ c }) {
  const contractish = c.types + c.consts + c.schemas + c.errorClasses;
  const runtime = c.classes + c.mutable + c.sideEffects + c.constructs + c.ambient + (c.jsx ? 1 : 0);
  if (contractish === 0 && c.functions === 0 && c.reexports > 0) return 'barrel';
  if (contractish === 0 && c.functions === 0 && runtime === 0) return 'empty';
  if (runtime === 0 && (c.functions === 0 || (c.functions <= 3 && c.functionLines <= 30 && contractish > 0))) return 'contract';
  if (runtime === 0 && contractish > 0 && c.functions > 0) return 'contract+logic';
  return 'runtime';
}

const analysed = new Map(files.map((f) => [f, analyse(f)]));
const importers = new Map(files.map((f) => [f, { prod: 0, tests: 0 }]));
for (const [f, a] of analysed) for (const i of a.imports) if (i.target && importers.has(i.target)) importers.get(i.target).prod += 1;
// Importers from tests count separately: a file only tests use is still a ghost to the product.
for (const root of roots) {
  const testFiles = [];
  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) { if (!['node_modules', 'dist', '.next', 'android', 'ios'].includes(d.name) && !d.name.startsWith('.')) visit(p); }
      else if (/\.(test|spec)\.tsx?$/.test(d.name) || p.includes('__tests__')) testFiles.push(p);
    }
  };
  visit(path.join(ROOT, root));
  for (const t of testFiles) {
    const rel = path.relative(ROOT, t).replace(/\\/g, '/');
    for (const m of fs.readFileSync(t, 'utf8').matchAll(/(?:from|import\(|vi\.mock\()\s*['"]([^'"]+)['"]/g)) {
      const target = resolve(m[1], rel);
      if (target && importers.has(target)) importers.get(target).tests += 1;
    }
  }
}

/** A file's tier by the standard; null where no rule covers its package yet. */
const tierFor = (f) => {
  const t = tierOf(f);
  return t === 'UNPLACED' && !f.startsWith('packages/core/src/') && !f.startsWith('packages/ui/src/') ? null : t;
};
const rows = files.map((f) => {
  const a = analysed.get(f);
  const tier = tierFor(f);
  return {
    file: f,
    package: f.split('/').slice(0, 2).join('/'),
    folderTier: tier,
    shape: shape(a),
    lines: a.lines,
    counts: a.c,
    exports: a.names,
    unions: a.unions,
    importers: importers.get(f),
    imports: a.imports.filter((i) => i.target).map((i) => ({ to: i.target, typeOnly: i.typeOnly, toShape: shape(analysed.get(i.target)), toTier: tierFor(i.target) })),
    outside: [...new Set(a.imports.filter((i) => !i.target && !i.spec.startsWith('.') && !i.typeOnly).map((i) => i.spec.split('/').slice(0, i.spec.startsWith('@') ? 2 : 1).join('/')))],
  };
});

// Duplicate contracts: the same exported name, or the same literal union, in more than one contract file.
const contracts = rows.filter((r) => r.shape === 'contract' || r.shape === 'contract+logic');
const byName = new Map();
for (const r of contracts) for (const n of r.exports) byName.set(n, [...(byName.get(n) ?? []), r.file]);
const byUnion = new Map();
for (const r of contracts) for (const u of r.unions) byUnion.set(u.union, [...(byUnion.get(u.union) ?? []), `${r.file}#${u.name}`]);
const duplicates = {
  names: [...byName].filter(([, fs2]) => new Set(fs2).size > 1).map(([name, where]) => ({ name, where: [...new Set(where)] })),
  unions: [...byUnion].filter(([, where]) => new Set(where.map((w) => w.split('#')[0])).size > 1).map(([union, where]) => ({ union, where })),
};

/**
 * What each low tier may contain. Tier 0 holds types, data, schemas, data-only error classes and
 * pure functions over them; Tier 1 holds port interfaces and their tags only. Anything that runs,
 * holds state or reads where it runs (process.env, __DEV__, clocks, globals) belongs higher up.
 */
const CONTENT_FORBIDDEN = {
  T0: ['classes', 'mutable', 'sideEffects', 'constructs', 'ambient', 'jsx'],
  T1: ['functions', 'consts', 'classes', 'mutable', 'sideEffects', 'constructs', 'ambient', 'jsx'],
};
const contentViolations = rows.flatMap((r) => {
  const banned = CONTENT_FORBIDDEN[r.folderTier];
  if (!banned) return [];
  const found = banned.filter((k) => Number(r.counts[k]) > 0).map((k) => `${k}=${Number(r.counts[k])}`);
  return found.length ? [{ file: r.file, tier: r.folderTier, found }] : [];
});
fs.writeFileSync(path.join(ROOT, 'reports/tier-content.json'), `${JSON.stringify({ rows, duplicates, contentViolations }, null, 1)}\n`);
if (process.argv.includes('--summary-json')) {
  console.log(JSON.stringify({ contentViolations: contentViolations.length }));
  process.exit(0);
}
const count = (pred) => rows.filter(pred).length;
console.log(`files ${rows.length}`);
for (const s of ['contract', 'contract+logic', 'runtime', 'barrel', 'empty']) console.log(`  ${s.padEnd(15)} ${count((r) => r.shape === s)}`);
console.log(`ghosts (no product importer, not an entry): ${count((r) => r.importers.prod === 0)}`);
for (const v of contentViolations) console.log(`  content ${v.tier} ${v.file}: ${v.found.join(' ')}`);
console.log(`tier content violations ${contentViolations.length}`);
console.log(`duplicate contract names ${duplicates.names.length}, duplicate literal unions ${duplicates.unions.length}`);
