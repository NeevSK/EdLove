#!/usr/bin/env node
/**
 * Tier import audit: checks every import against the tier standard in
 * tooling/architecture-tiers.mjs (rules: docs/architecture/2026-11-01-architectural-hierarchy-and-archetypes.md).
 *
 *   node scripts/audit-archetype-violations.mjs                 # the sanctuary-feature tree
 *   node scripts/audit-archetype-violations.mjs --scope packages/core/src
 *
 * Writes reports/tier-audit.json and reports/tier-audit.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ALLOWED,
  FORBIDDEN_PACKAGES,
  PARSE_ALLOWED_IN,
  PLACEMENTS,
  TIERS,
  tierOf,
} from '../tooling/architecture-tiers.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const scopeIndex = args.indexOf('--scope');
const scope = scopeIndex >= 0 ? args[scopeIndex + 1] : null;
/** --summary-json: print the summary as JSON and write no reports (used by scripts/ratchet.mjs). */
const summaryOnly = args.includes('--summary-json');

const ALIASES = [
  ['@repo/core/', 'packages/core/src/'],
  ['@repo/ui/', 'packages/ui/src/'],
];
const EXTS = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
/** Entry points a package declares in package.json `exports` may re-export; nothing else may. */
function declaredEntries() {
  const entries = new Set();
  for (const pkg of ['packages/core', 'packages/ui']) {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, pkg, 'package.json'), 'utf8'));
    const visit = (v) => {
      if (typeof v === 'string' && /\.tsx?$/.test(v) && !v.includes('*'))
        entries.add(path.join(pkg, v).replace(/\\/g, '/'));
      else if (v && typeof v === 'object') Object.values(v).forEach(visit);
    };
    visit(manifest.exports ?? {});
  }
  return entries;
}
const ENTRY_BARRELS = declaredEntries();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory())
      return ['node_modules', '__tests__', 'generated', 'dist'].includes(d.name) ? [] : walk(p);
    return /\.tsx?$/.test(d.name) &&
      !/\.(test|spec)\.tsx?$/.test(d.name) &&
      !d.name.endsWith('.d.ts')
      ? [p]
      : [];
  });
}

function scopeFiles() {
  if (scope) return walk(path.join(ROOT, scope)).map((p) => path.relative(ROOT, p));
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'reports/topological-layer-analysis.json'), 'utf8'),
  );
  return [...new Set(data.edges.flatMap((e) => [e.from, e.to]))];
}

function resolve(spec, from) {
  let base = null;
  for (const [alias, dir] of ALIASES)
    if (spec.startsWith(alias)) base = dir + spec.slice(alias.length);
  if (spec.startsWith('.'))
    base = path.relative(ROOT, path.resolve(ROOT, path.dirname(from), spec));
  if (!base) return null;
  for (const ext of ['', ...EXTS]) {
    const candidate = base + ext;
    if (
      fs.existsSync(path.join(ROOT, candidate)) &&
      fs.statSync(path.join(ROOT, candidate)).isFile()
    )
      return candidate;
  }
  return null;
}

const IMPORT = /^\s*(import|export)\s+(type\s+)?([\s\S]*?)\s*from\s*['"]([^'"]+)['"]/gm;

function parse(file) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const imports = [];
  for (const m of source.matchAll(IMPORT)) {
    const clause = m[3] ?? '';
    // `import { type A, type B }` is type-only too.
    const inline =
      /^\{([^}]*)\}$/.test(clause.trim()) &&
      clause
        .replace(/[{}]/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .every((s) => s.startsWith('type '));
    imports.push({ kind: m[1], typeOnly: Boolean(m[2]) || inline, spec: m[4] });
  }
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const statements = code
    .split(/;\s*\n|\n(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const passThrough =
    statements.length > 0 &&
    statements.every(
      (s) =>
        /^(export\s+(\*|type\s+\*|\{[\s\S]*\}|type\s+\{[\s\S]*\})\s+from\s+['"]|import\s)/.test(
          s,
        ) ||
        /^export\s+(const|let)\s+\w+\s*=\s*[\w.]+;?$/.test(s) ||
        /^export\s+(default\s+)?\w+;?$/.test(s),
    ) &&
    statements.some((s) => s.startsWith('export'));
  // Schema decoding only; JSON.parse and Date.parse aren't validation.
  const parses = [
    ...code.matchAll(
      /(?<!JSON|Date)\.(safeParse|parse|safeParseAsync|parseAsync)\(|Schema\.decodeUnknown\w*\(/g,
    ),
  ].length;
  return { imports, passThrough, parses };
}

const files = scopeFiles().filter((f) => fs.existsSync(path.join(ROOT, f)));
const inScope = new Set(files);
const findings = [];
const add = (rule, file, detail) => findings.push({ rule, file, tier: tierOf(file), ...detail });

for (const file of files) {
  const tier = tierOf(file);
  const { imports, passThrough, parses } = parse(file);
  if (tier === 'UNPLACED')
    add('unplaced', file, { reason: 'Its folder states no tier and it has no placement' });
  const placed = PLACEMENTS[file];
  if (placed) add('misplaced', file, { reason: `${placed.why}; belongs in ${placed.home}` });
  if (passThrough && !ENTRY_BARRELS.has(file))
    add('pass-through', file, { reason: 'Only re-exports or renames; import the source instead' });
  if (parses > 0 && tier !== 'UNPLACED' && !PARSE_ALLOWED_IN.includes(tier))
    add('parse-above-boundary', file, {
      reason: `${parses} schema parse call(s); decode at the adapter and pass typed data up`,
    });

  for (const imp of imports) {
    const target = resolve(imp.spec, file);
    if (!target) {
      if (
        !imp.spec.startsWith('.') &&
        !imp.spec.startsWith('@repo/') &&
        tier !== 'UNPLACED' &&
        !imp.typeOnly
      ) {
        const banned = (FORBIDDEN_PACKAGES[tier] ?? []).find((re) => re.test(imp.spec));
        if (banned)
          add('forbidden-package', file, {
            to: imp.spec,
            reason: `${TIERS[tier].name} may not use ${imp.spec}`,
          });
      }
      continue;
    }
    if (!scope && !inScope.has(target)) continue;
    const to = tierOf(target);
    if (tier === 'UNPLACED' || to === 'UNPLACED') continue;
    if (imp.typeOnly && TIERS[to].rank <= TIERS[tier].rank) continue; // types are erased; downward type imports are fine
    if (ALLOWED[tier].includes(to)) continue;
    // A store is assembled from its own slices; other stores are separate state.
    if (tier === 'T4' && to === 'T4' && target.includes('/store/slices/')) continue;
    const upward = TIERS[to].rank > TIERS[tier].rank;
    add(upward ? 'upward-import' : 'tier-import', file, {
      to: target,
      toTier: to,
      reason: upward
        ? `${TIERS[tier].name} imports ${TIERS[to].name}, which sits above it`
        : `${TIERS[tier].name} may import only ${ALLOWED[tier].map((t) => TIERS[t].name).join(', ')}`,
    });
  }
}

const byRule = Object.groupBy(findings, (f) => f.rule);
const byTier = Object.groupBy(files, (f) => tierOf(f));
const summary = {
  scope: scope ?? 'sanctuary-feature tree (reports/topological-layer-analysis.json)',
  files: files.length,
  tiers: Object.fromEntries(Object.keys(TIERS).map((t) => [t, (byTier[t] ?? []).length])),
  findings: Object.fromEntries(Object.entries(byRule).map(([r, list]) => [r, list.length])),
};
if (summaryOnly) {
  process.stdout.write(`${JSON.stringify(summary)}\n`);
  process.exit(0);
}
fs.writeFileSync(
  path.join(ROOT, 'reports/tier-audit.json'),
  `${JSON.stringify({ summary, findings, placement: Object.fromEntries(files.map((f) => [f, tierOf(f)])) }, null, 2)}\n`,
);

const rel = (p) => p.replace('packages/core/src/', 'core/').replace('packages/ui/src/', 'ui/');
const md = [
  `# Tier audit: ${summary.scope}`,
  '',
  `${summary.files} files. Rules: tooling/architecture-tiers.mjs.`,
  '',
  '| Tier | Files |',
  '| --- | --- |',
  ...Object.entries(summary.tiers)
    .filter(([, n]) => n)
    .map(([t, n]) => `| ${TIERS[t].name} | ${n} |`),
  '',
  ...Object.entries(byRule).flatMap(([rule, list]) => [
    `## ${rule} (${list.length})`,
    '',
    ...list.map(
      (f) =>
        `- \`${rel(f.file)}\` (${TIERS[f.tier].name})${f.to ? ` → \`${rel(f.to)}\`${f.toTier ? ` (${TIERS[f.toTier].name})` : ''}` : ''}: ${f.reason}`,
    ),
    '',
  ]),
].join('\n');
fs.writeFileSync(path.join(ROOT, 'reports/tier-audit.md'), md);

console.log(`Tier audit, ${summary.scope}: ${summary.files} files`);
for (const [t, n] of Object.entries(summary.tiers))
  if (n) console.log(`  ${TIERS[t].name.padEnd(28)} ${n}`);
console.log('Findings:');
for (const [r, n] of Object.entries(summary.findings)) console.log(`  ${r.padEnd(22)} ${n}`);
console.log('Report: reports/tier-audit.md');
