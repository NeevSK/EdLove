#!/usr/bin/env node
/**
 * Hand a package's copy of contracts to their owner in @repo/core, then remove the copy.
 *
 *   node scripts/adopt-contracts.mjs <copy.ts> <core-owner.ts> [--into <core/types/X.ts>] [--via <entry.ts> ...] [--dry]
 *
 * - A name the owner declares keeps the owner's declaration. A name another Tier 0 file in core
 *   already declares keeps that one. Any other name moves verbatim (with its comments) into
 *   `--into` (default: the owner), created if needed.
 * - Every importer of any of the copy's names, through the copy itself or through each `--via`
 *   entry that re-exports it, is re-pointed to the owner (scripts/move-exports.mjs).
 * - The copy is deleted.
 *
 * The owner's imports are not touched: a moved declaration that needs a type the owner doesn't
 * import fails the type check, which is the signal to add it. Run the type check after.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const [copy, owner] = args;
const via = [];
let into = null;
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--via') via.push(args[++i]);
  else if (args[i] === '--into') into = args[++i];
}
into ??= owner;
const DRY = args.includes('--dry');
if (!copy || !owner) throw new Error('usage: adopt-contracts.mjs <copy.ts> <core-owner.ts> [--via entry.ts] [--dry]');

const ts6 = fs.readdirSync(path.join(ROOT, 'node_modules/.pnpm')).filter((d) => d.startsWith('@typescript+typescript6@')).sort().pop();
const ts = createRequire(path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'))('./lib/typescript.js');

function declarations(file) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const out = new Map();
  for (const st of sf.statements) {
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    const names = ts.isVariableStatement(st)
      ? st.declarationList.declarations.map((d) => d.name.getText(sf))
      : st.name
        ? [st.name.text]
        : [];
    // Full text including leading JSDoc.
    for (const n of names) out.set(n, text.slice(st.getFullStart(), st.end).replace(/^\n+/, ''));
  }
  return out;
}

const fromCopy = declarations(copy);
const inOwner = fs.existsSync(owner) ? declarations(owner) : new Map();
const inInto = fs.existsSync(into) ? declarations(into) : new Map();
// Where core already declares each name in Tier 0 (types/, logic/schemas/, constants/).
const T0_DIRS = ['packages/core/src/types', 'packages/core/src/logic/schemas', 'packages/core/src/constants'];
const elsewhere = new Map();
for (const dir of T0_DIRS) {
  for (const f of fs.readdirSync(dir)) {
    const file = `${dir}/${f}`;
    if (!/\.tsx?$/.test(f) || /\.test\./.test(f) || file === owner || file === into || f === 'index.ts') continue;
    for (const n of declarations(file).keys()) if (!elsewhere.has(n)) elsewhere.set(n, file);
  }
}
const target = new Map();
const moving = [];
for (const n of fromCopy.keys()) {
  if (inOwner.has(n)) target.set(n, owner);
  else if (inInto.has(n)) target.set(n, into);
  else if (elsewhere.has(n)) target.set(n, elsewhere.get(n));
  else {
    target.set(n, into);
    moving.push(n);
  }
}
console.log(`${copy}: ${fromCopy.size} names`);
for (const [n, t] of target) if (!moving.includes(n)) console.log(`  ${n} -> core keeps ${t}`);
if (moving.length) console.log(`  moved into ${into}: ${moving.join(', ')}`);
if (DRY) process.exit(0);

if (moving.length) {
  const body = moving.map((n) => fromCopy.get(n).trimEnd()).join('\n\n');
  const note = `// Moved from ${copy} (${new Date().toISOString().slice(0, 10)}): @repo/core owns every contract.\n\n`;
  // Carry the copy's imports from core and outside packages (never its own package's files), as
  // type-only imports, for the declarations to resolve; the type check then flags any not needed.
  const copyText = fs.readFileSync(copy, 'utf8');
  const ownPkg = copy.split('/').slice(0, 2).join('/');
  const carried = [...copyText.matchAll(/^import[^;]*?from\s+['"]([^'"]+)['"];?$/gms)]
    .filter((m) => !m[1].startsWith('.') && !m[1].startsWith('@/') && !(ownPkg !== 'packages/core' && m[1].startsWith(`@repo/${ownPkg.split('/')[1]}`)))
    .map((m) => m[0].replace(/^import(?!\s+type)\s+/, 'import type '));
  const prior = fs.existsSync(into) ? `${fs.readFileSync(into, 'utf8').trimEnd()}\n\n` : `${carried.join('\n')}${carried.length ? '\n\n' : ''}`;
  if (fs.existsSync(into) && carried.length) console.log(`  check imports in ${into}: the copy imported\n    ${carried.join('\n    ')}`);
  fs.writeFileSync(into, `${prior}${note}${body}\n`);
}
const renames = [...fromCopy.keys()].flatMap((name) => [copy, ...via].map((from) => ({ name, from, to: target.get(name) })));
const tmp = path.join(ROOT, 'node_modules/.cache-adopt-renames.json');
fs.writeFileSync(tmp, JSON.stringify(renames));
execFileSync('node', ['scripts/move-exports.mjs', tmp], { stdio: 'inherit' });
fs.rmSync(tmp);
execFileSync('git', ['rm', '-qf', copy]);
console.log(`removed ${copy}`);
