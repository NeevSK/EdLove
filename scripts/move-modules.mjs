#!/usr/bin/env node
/**
 * Move source files and rewrite every import of them, across all packages and apps.
 *
 *   node scripts/move-modules.mjs moves.json [--dry]
 *
 * moves.json is `{ "packages/core/src/old/file.ts": "packages/core/src/new/file.ts", ... }`.
 *
 * Every module specifier in every source and test file is resolved against the layout before the
 * move: `from '...'`, `export ... from`, `import('...')`, `require('...')`, `vi.mock('...')`,
 * `vi.importActual('...')` and `jest.mock('...')`. A specifier that points at a moved file, or any
 * relative specifier inside a moved file, is rewritten in the same style it was written in
 * (relative, `@/`, or a workspace package name), so nothing else in the file changes.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const [movesFile, ...flags] = process.argv.slice(2);
const DRY = flags.includes('--dry');
if (!movesFile) throw new Error('usage: node scripts/move-modules.mjs moves.json [--dry]');
const moves = new Map(Object.entries(JSON.parse(fs.readFileSync(movesFile, 'utf8'))));

const SKIP = new Set(['node_modules', 'dist', 'build', '.next', '.expo', 'coverage', 'android', 'ios', '.turbo']);
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return SKIP.has(d.name) || d.name.startsWith('.') ? [] : walk(p);
    return /\.(m?tsx?|m?jsx?)$/.test(d.name) && !d.name.endsWith('.d.ts') ? [p] : [];
  });
}
const files = [...walk(path.join(ROOT, 'packages')), ...walk(path.join(ROOT, 'apps')), ...walk(path.join(ROOT, 'scripts')), ...walk(path.join(ROOT, 'tooling'))]
  .map((p) => path.relative(ROOT, p).replace(/\\/g, '/'));
const fileSet = new Set(files);
for (const [from, to] of moves) {
  if (!fileSet.has(from)) throw new Error(`not a source file: ${from}`);
  if (fs.existsSync(to)) throw new Error(`destination exists: ${to}`);
}

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

const EXTS = ['', '.ts', '.tsx', '.mts', '.js', '/index.ts', '/index.tsx'];
const find = (base) => {
  for (const ext of EXTS) if (fileSet.has(base + ext)) return base + ext;
  return null;
};
function appOf(file) {
  return file.split('/').slice(0, 2).join('/');
}
function resolve(spec, from) {
  if (spec.startsWith('.')) return find(path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)));
  if (spec.startsWith('@/')) {
    const app = appOf(from);
    return find(`${app}/src/${spec.slice(2)}`) ?? find(`${app}/${spec.slice(2)}`);
  }
  for (const [name, src] of packageRoots) {
    if (spec === name) return find(`${src}/index`);
    if (spec.startsWith(`${name}/`)) return find(`${src}/${spec.slice(name.length + 1)}`);
  }
  return null;
}

const stripExt = (p, original) => {
  // Keep an explicit extension only if the original specifier had one.
  if (/\.(m?[jt]sx?)$/.test(original)) return p.replace(/\.(m?tsx?)$/, original.match(/\.(m?[jt]sx?)$/)[0]);
  return p.replace(/\/index\.(tsx?)$/, original.endsWith('/index') ? '/index' : '').replace(/\.(m?tsx?)$/, '');
};
function respell(spec, importer, target) {
  const home = (f) => f.split('/').slice(0, 2).join('/');
  if (spec.startsWith('.') && home(importer) === home(target)) {
    let rel = path.posix.relative(path.posix.dirname(importer), target);
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return stripExt(rel, spec);
  }
  if (spec.startsWith('@/')) {
    const app = appOf(importer);
    const prefix = target.startsWith(`${app}/src/`) ? `${app}/src/` : `${app}/`;
    if (!target.startsWith(prefix)) throw new Error(`${importer}: ${spec} would leave the app`);
    return stripExt(`@/${target.slice(prefix.length)}`, spec);
  }
  for (const [name, src] of packageRoots) {
    if (target.startsWith(`${src}/`)) return stripExt(`${name}/${target.slice(src.length + 1)}`, spec);
  }
  throw new Error(`${importer}: no package owns ${target}`);
}

const SPEC = /((?:\bfrom|\bimport|\brequire|\bvi\.mock|\bvi\.doMock|\bvi\.importActual(?:<[^>]*>)?|\bjest\.mock|\bjest\.requireActual)\s*\(?\s*)(['"])([^'"\n]+)\2/g;
let changedFiles = 0;
let changedSpecs = 0;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const newHome = moves.get(file) ?? file;
  let count = 0;
  const next = text.replace(SPEC, (all, lead, q, spec) => {
    const target = resolve(spec, file);
    if (!target) return all;
    const movedTarget = moves.get(target);
    if (!movedTarget && !(moves.has(file) && spec.startsWith('.'))) return all;
    const out = respell(spec, newHome, movedTarget ?? target);
    if (out === spec) return all;
    count += 1;
    return `${lead}${q}${out}${q}`;
  });
  if (count) {
    changedFiles += 1;
    changedSpecs += count;
    if (DRY) console.log(`${file}: ${count}`);
    else fs.writeFileSync(file, next);
  }
}
if (!DRY) {
  for (const [from, to] of moves) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    execFileSync('git', ['mv', from, to]);
  }
}
console.log(`${DRY ? '[dry] ' : ''}${moves.size} moves, ${changedSpecs} specifiers in ${changedFiles} files`);
