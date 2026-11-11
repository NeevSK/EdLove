#!/usr/bin/env node
/**
 * Re-point imports of named exports from one module to another, across all packages and apps.
 * Used to retire a duplicate contract: its owner keeps the declaration, every importer of the
 * copy is moved to the owner, then the copy's declaration can go.
 *
 *   node scripts/move-exports.mjs renames.json [--dry]
 *
 * renames.json: `[{ "name": "Student", "from": "packages/core/src/types/Student.ts",
 *                   "to": "packages/core/src/logic/schemas/student.schema.ts" }, ...]`
 *
 * Handles `import { A, type B as C } from`, `import type { ... } from`, and the same shapes of
 * `export { ... } from`. The moved names become a new declaration of the same kind (import or
 * export, type-only or not) whose specifier is written in the original style. Default and
 * namespace imports are reported, not rewritten.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const [renamesFile, ...flags] = process.argv.slice(2);
const DRY = flags.includes('--dry');
if (!renamesFile) throw new Error('usage: node scripts/move-exports.mjs renames.json [--dry]');
const renames = JSON.parse(fs.readFileSync(renamesFile, 'utf8'));

const ts6 = fs.readdirSync(path.join(ROOT, 'node_modules/.pnpm')).filter((d) => d.startsWith('@typescript+typescript6@')).sort().pop();
const ts = createRequire(path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'))('./lib/typescript.js');

const SKIP = new Set(['node_modules', 'dist', 'build', '.next', '.expo', 'coverage', 'android', 'ios', '.turbo']);
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return SKIP.has(d.name) || d.name.startsWith('.') ? [] : walk(p);
    return /\.(m?tsx?)$/.test(d.name) && !d.name.endsWith('.d.ts') ? [p] : [];
  });
}
const files = [...walk(path.join(ROOT, 'packages')), ...walk(path.join(ROOT, 'apps'))].map((p) => path.relative(ROOT, p).replace(/\\/g, '/'));
const fileSet = new Set(files);

const packageRoots = [];
for (const dir of ['packages', 'apps']) {
  for (const name of fs.readdirSync(dir)) {
    const manifest = path.join(dir, name, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    const src = fs.existsSync(path.join(dir, name, 'src')) ? `${dir}/${name}/src` : `${dir}/${name}`;
    if (pkg.name) packageRoots.push([pkg.name, src]);
  }
}
packageRoots.sort((a, b) => b[0].length - a[0].length);
const EXTS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
const find = (base) => EXTS.map((e) => base + e).find((p) => fileSet.has(p)) ?? null;
const appOf = (f) => f.split('/').slice(0, 2).join('/');
function resolve(spec, from) {
  if (spec.startsWith('.')) return find(path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)));
  if (spec.startsWith('@/')) return find(`${appOf(from)}/src/${spec.slice(2)}`) ?? find(`${appOf(from)}/${spec.slice(2)}`);
  for (const [name, src] of packageRoots) {
    if (spec === name) return find(`${src}/index`);
    if (spec.startsWith(`${name}/`)) return find(`${src}/${spec.slice(name.length + 1)}`);
  }
  return null;
}
function spell(styleSpec, importer, target) {
  const bare = (p) => p.replace(/\/index\.tsx?$/, '').replace(/\.tsx?$/, '');
  // Relative only within one package or app; across them, the package name.
  const home = (f) => f.split('/').slice(0, 2).join('/');
  if (styleSpec.startsWith('.') && home(importer) === home(target)) {
    const rel = path.posix.relative(path.posix.dirname(importer), target);
    return bare(rel.startsWith('.') ? rel : `./${rel}`);
  }
  // Inside the owning package, or from another one, the package name always works.
  for (const [name, src] of packageRoots) if (target.startsWith(`${src}/`)) return bare(`${name}/${target.slice(src.length + 1)}`);
  throw new Error(`no package owns ${target}`);
}

const byFrom = new Map();
for (const r of renames) {
  if (!byFrom.has(r.from)) byFrom.set(r.from, new Map());
  byFrom.get(r.from).set(r.name, r.to);
}

let edits = 0;
const reports = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const changes = [];
  for (const st of sf.statements) {
    const isImport = ts.isImportDeclaration(st);
    const isExport = ts.isExportDeclaration(st) && st.moduleSpecifier;
    if (!isImport && !isExport) continue;
    const spec = st.moduleSpecifier.text;
    const target = resolve(spec, file);
    const moved = target && byFrom.get(target);
    if (!moved) continue;
    const named = isImport ? st.importClause?.namedBindings : st.exportClause;
    if (isImport && (st.importClause?.name || (named && ts.isNamespaceImport(named)))) {
      const names = [...moved.keys()].filter((n) => new RegExp(`\\b${n}\\b`).test(text));
      if (names.length) reports.push(`${file}: default/namespace import of ${spec} uses ${names.join(', ')}`);
      if (!named || ts.isNamespaceImport(named)) continue;
    }
    if (!named || !(ts.isNamedImports(named) || ts.isNamedExports(named))) continue;
    const declTypeOnly = isImport ? st.importClause.isTypeOnly : st.isTypeOnly;
    const keep = [];
    const out = new Map();
    for (const el of named.elements) {
      const original = (el.propertyName ?? el.name).text;
      const to = moved.get(original);
      if (!to) keep.push(el.getText(sf));
      else {
        if (!out.has(to)) out.set(to, []);
        out.get(to).push(el.getText(sf));
      }
    }
    if (!out.size) continue;
    const kw = isImport ? 'import' : 'export';
    const typeKw = declTypeOnly ? ' type' : '';
    const lines = [];
    if (keep.length) lines.push(`${kw}${typeKw} { ${keep.join(', ')} } from '${spec}';`);
    for (const [to, els] of out) lines.push(`${kw}${typeKw} { ${els.join(', ')} } from '${spell(spec, file, to)}';`);
    changes.push({ start: st.getStart(sf), end: st.end, text: lines.join('\n') });
  }
  if (!changes.length) continue;
  let next = text;
  for (const c of changes.sort((a, b) => b.start - a.start)) next = next.slice(0, c.start) + c.text + next.slice(c.end);
  edits += changes.length;
  if (DRY) console.log(`${file}: ${changes.length}`);
  else fs.writeFileSync(file, next);
}
for (const r of reports) console.log(`REVIEW ${r}`);
console.log(`${DRY ? '[dry] ' : ''}${edits} declarations rewritten`);
