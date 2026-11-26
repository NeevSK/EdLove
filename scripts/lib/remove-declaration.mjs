#!/usr/bin/env node
/**
 * Remove named top-level declarations (with their JSDoc) from a TypeScript file, using the parser
 * rather than a pattern, so neighbouring declarations are never touched.
 *
 *   node scripts/lib/remove-declaration.mjs <file.ts> Name [Name ...]
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const [file, ...names] = process.argv.slice(2);
const ts6 = fs.readdirSync(path.join(ROOT, 'node_modules/.pnpm')).filter((d) => d.startsWith('@typescript+typescript6@')).sort().pop();
const ts = createRequire(path.join(ROOT, 'node_modules/.pnpm', ts6, 'node_modules/@typescript/typescript6/package.json'))('./lib/typescript.js');
let text = fs.readFileSync(file, 'utf8');
const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
const cuts = [];
for (const st of sf.statements) {
  const declared = ts.isVariableStatement(st) ? st.declarationList.declarations.map((d) => d.name.getText(sf)) : st.name ? [st.name.text] : [];
  if (declared.length && declared.every((n) => names.includes(n))) cuts.push([st.getFullStart(), st.end]);
}
const missing = names.filter((n) => !sf.statements.some((st) => (st.name?.text ?? '') === n || (ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => d.name.getText(sf) === n))));
if (missing.length) throw new Error(`${file}: not declared here: ${missing.join(', ')}`);
for (const [a, b] of cuts.sort((x, y) => y[0] - x[0])) text = text.slice(0, a) + text.slice(b);
fs.writeFileSync(file, text.replace(/\n{3,}/g, '\n\n'));
console.log(`${file}: removed ${names.join(', ')}`);
