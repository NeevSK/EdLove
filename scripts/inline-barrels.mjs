#!/usr/bin/env node
/**
 * Retire pass-through files: point every importer at the module that declares each name, then
 * remove the pass-through once nothing imports it. A move, not a deletion: no name is lost.
 *
 *   node scripts/inline-barrels.mjs <passthrough.ts>... [--dry]
 *
 * Writes /tmp/inline-barrels.json for scripts/move-exports.mjs and runs it. A file still imported
 * afterwards (namespace or default imports, vi.mock, `export *` of it) is reported and kept.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

/** git grep -l, empty when nothing matches. */
const grepFiles = (pattern) => {
  try {
    return execFileSync('git', ['grep', '-l', '-E', pattern, '--', 'packages', 'apps'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

const ROOT = process.cwd();
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const barrels = args.filter((a) => !a.startsWith('--'));
const ts6 = fs.readdirSync(path.join(ROOT, 'node_modules/.pnpm')).filter((d) => d.startsWith('@typescript+typescript6@')).sort().pop();
const ts = createRequire(path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'))('./lib/typescript.js');

const packageRoots = [];
for (const dir of ['packages', 'apps'])
  for (const name of fs.readdirSync(dir)) {
    const manifest = path.join(dir, name, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    const src = fs.existsSync(path.join(dir, name, 'src')) ? `${dir}/${name}/src` : `${dir}/${name}`;
    if (pkg.name) packageRoots.push([pkg.name, src]);
  }
packageRoots.sort((a, b) => b[0].length - a[0].length);
const EXTS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
const find = (base) => EXTS.map((e) => base + e).find((p) => fs.existsSync(p) && fs.statSync(p).isFile()) ?? null;
function resolve(spec, from) {
  if (spec.startsWith('.')) return find(path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)));
  for (const [name, src] of packageRoots) {
    if (spec === name) return find(`${src}/index`);
    if (spec.startsWith(`${name}/`)) return find(`${src}/${spec.slice(name.length + 1)}`);
  }
  return `pkg:${spec}`;
}
const parse = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
const has = (node, kind) => node.modifiers?.some((m) => m.kind === kind);

/** Every name a module exports, mapped to the file (or pkg:) that declares it and its name there. */
function exportsOf(file, seen = new Set()) {
  const out = new Map();
  if (file.startsWith('pkg:') || seen.has(file)) return out;
  seen.add(file);
  for (const st of parse(file).statements) {
    if (ts.isExportDeclaration(st)) {
      const target = st.moduleSpecifier ? resolve(st.moduleSpecifier.text, file) : null;
      if (!st.exportClause) {
        if (target.startsWith('pkg:')) out.set('*', { to: target });
        else for (const [n, v] of exportsOf(target, seen)) if (!out.has(n)) out.set(n, v);
      } else if (ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) {
          const local = (el.propertyName ?? el.name).text;
          if (!target) { out.set(el.name.text, { to: file, source: local }); continue; }
          const deeper = target.startsWith('pkg:') ? null : exportsOf(target, new Set(seen)).get(local);
          out.set(el.name.text, deeper ?? { to: target, source: local });
        }
      } else out.set(st.exportClause.name.text, { to: file, source: st.exportClause.name.text });
    } else if (has(st, ts.SyntaxKind.ExportKeyword)) {
      if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) out.set(d.name.getText(), { to: file, source: d.name.getText() });
      else if (st.name) out.set(st.name.text, { to: file, source: st.name.text });
    }
  }
  return out;
}

function spell(styleSpec, importer, target) {
  if (target.startsWith('pkg:')) return target.slice(4);
  const bare = (p) => p.replace(/\/index\.tsx?$/, '').replace(/\.tsx?$/, '');
  const home = (f) => f.split('/').slice(0, 2).join('/');
  if (styleSpec.startsWith('.') && home(importer) === home(target)) {
    const rel = path.posix.relative(path.posix.dirname(importer), target);
    return bare(rel.startsWith('.') ? rel : `./${rel}`);
  }
  for (const [name, src] of packageRoots) if (target.startsWith(`${src}/`)) return bare(`${name}/${target.slice(src.length + 1)}`);
  throw new Error(`no package owns ${target}`);
}

/**
 * `export * from '<pass-through>'` in a file that stays: replace it with the pass-through's own
 * export statements, re-spelled for that file, until no retired pass-through is named. The
 * staying file exports exactly the same names as before.
 */
const retired = new Set(barrels);
function flattenStars() {
  let changed = 0;
  const all = execFileSync('git', ['ls-files', 'packages', 'apps'], { encoding: 'utf8' }).split('\n').filter((f) => /\.tsx?$/.test(f) && !retired.has(f) && fs.existsSync(f));
  for (let pass = 0; pass < 10; pass++) {
    let round = 0;
    for (const f of all) {
      const text = fs.readFileSync(f, 'utf8');
      if (!text.includes('export')) continue;
      const sf = parse(f);
      const edits = [];
      for (const st of sf.statements) {
        if (!ts.isExportDeclaration(st) || st.exportClause || !st.moduleSpecifier) continue;
        const target = resolve(st.moduleSpecifier.text, f);
        if (!retired.has(target)) continue;
        const lines = [];
        const bsf = parse(target);
        for (const b of bsf.statements) {
          if (!ts.isExportDeclaration(b) || !b.moduleSpecifier) continue;
          const to = resolve(b.moduleSpecifier.text, target);
          const spec = spell(st.moduleSpecifier.text, f, to);
          const typeOnly = st.isTypeOnly || b.isTypeOnly;
          const clause = b.exportClause ? ` ${b.exportClause.getText(bsf)}` : ' *';
          lines.push(`export${typeOnly ? ' type' : ''}${clause} from '${spec}';`);
        }
        edits.push({ start: st.getStart(sf), end: st.end, text: lines.join('\n') });
      }
      if (!edits.length) continue;
      let next = text;
      for (const e of edits.sort((a, b) => b.start - a.start)) next = next.slice(0, e.start) + e.text + next.slice(e.end);
      if (!DRY) fs.writeFileSync(f, next);
      round += edits.length;
      if (DRY) console.log(`${f}: flattens ${edits.length}`);
    }
    changed += round;
    if (!round || DRY) break;
  }
  return changed;
}
console.log(`${flattenStars()} export-star statements flattened`);

const renames = [];
const unresolved = [];
for (const barrel of barrels) {
  for (const [name, { to, source }] of exportsOf(barrel)) {
    if (name === '*') { unresolved.push(`${barrel}: export * from ${to.slice(4)} (outside package; importers keep their names)`); continue; }
    if (to === barrel) continue;
    renames.push({ name, from: barrel, to, ...(source && source !== name ? { source } : {}) });
  }
  // `export * from 'pkg'`: re-point every name an importer actually uses.
  const star = exportsOf(barrel).get('*');
  if (star) renames.push(...usedNames(barrel).filter((n) => !renames.some((r) => r.from === barrel && r.name === n)).map((name) => ({ name, from: barrel, to: star.to })));
}
function usedNames(barrel) {
  const names = new Set();
  const grep = grepFiles(path.basename(barrel).replace(/\.tsx?$/, ''));
  for (const f of grep) {
    if (!/\.tsx?$/.test(f)) continue;
    for (const st of parse(f).statements)
      if (ts.isImportDeclaration(st) && resolve(st.moduleSpecifier.text, f) === barrel && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings))
        for (const el of st.importClause.namedBindings.elements) names.add((el.propertyName ?? el.name).text);
  }
  return [...names];
}
fs.writeFileSync('/tmp/inline-barrels.json', JSON.stringify(renames, null, 1));
console.log(`${renames.length} names across ${barrels.length} pass-throughs`);
unresolved.forEach((u) => console.log(`NOTE ${u}`));
execFileSync('node', ['scripts/move-exports.mjs', '/tmp/inline-barrels.json', ...(DRY ? ['--dry'] : [])], { stdio: 'inherit' });
if (DRY) process.exit(0);

// Remove each pass-through nothing resolves to any more; repeat, as removing one frees another.
const pending = new Set(barrels);
for (let removed = true; removed; ) {
  removed = false;
  for (const barrel of [...pending]) {
  const stem = path.basename(barrel).replace(/\.tsx?$/, '');
  const candidates = grepFiles(stem === 'index' ? path.basename(path.dirname(barrel)) : stem).filter((f) => /\.(m?[jt]sx?)$/.test(f) && f !== barrel);
  const still = [];
  for (const f of candidates) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/(?:from|import\(|require\(|mock\(|importActual\()\s*['"]([^'"]+)['"]/g))
      if (resolve(m[1], f) === barrel) still.push(`${f} (${m[1]})`);
  }
  if (still.length) continue;
  execFileSync('git', ['rm', '-q', '-f', barrel]);
  console.log(`REMOVED ${barrel}`);
  pending.delete(barrel);
  removed = true;
  }
}
for (const barrel of pending) console.log(`KEEP ${barrel}: still imported (namespace/default import, mock, or a staying export *)`);
