#!/usr/bin/env node
/**
 * stack-map.mjs — Stack Map generator for the Polymath monorepo.
 *
 * Usage:
 *   node scripts/stack-map.mjs            -> generate docs/stack-map/landscape/stack-map.md + catalog/*.md
 *   node scripts/stack-map.mjs bootstrap  -> append draft annotation entries for un-curated packages
 *
 * Ownership:
 *   - package.json manifests              -> hand-written (name, version, description, deps)
 *   - stack-map-annotations.yaml          -> curated by humans/agents
 *   - generated markdown                  -> disposable, always regenerated
 *
 * The annotation YAML is an intentionally strict subset so this script needs no
 * external parser: `#` comments, 2-space indent, nested maps, scalar values only.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const docsDir = path.join(repoRoot, 'docs', 'stack-map', 'landscape');
const annotationsPath = path.join(docsDir, 'stack-map-annotations.yaml');
const masterPath = path.join(docsDir, 'stack-map.md');
const catalogDir = path.join(docsDir, 'catalog');

const LAYER_LEGEND = {
  core: 'Shared core infrastructure (types, configs, data access)',
  ui: 'Shared UI / design surface',
  domain: 'Domain capability package (functionality, not product shell)',
  tooling: 'Dev / AI tooling (CLI, MCP, IDE helpers)',
  'app (mobile)': 'End-user mobile application',
  'app (web)': 'End-user web application',
  'app (api)': 'Backend / API application',
};

const STOP_TOKENS = new Set([
  'repo',
  'rn',
  'ter',
  'typescript',
  'config',
  'eslint',
  'ui',
  'kit',
  'app',
  'apps',
  'lib',
  'builder',
  'js',
  'terrain',
]);

const IGNORABLE_EXTERNS = [
  /^@types\//,
  /^typescript$/,
  /^tsx$/,
  /^ts-node$/,
  /^@typescript-eslint/,
  /^eslint/,
  /^prettier/,
  /^@biomejs/,
  /^biome$/,
  /^vitest$/,
  /^jest/,
  /^@testing-library\//,
  /^expo/,
  /^react-native/,
  /^@expo\//,
  /^@shopify\/react-native-/,
  /^react$/,
  /^react-dom$/,
  /^react-native$/,
  /^nativewind/,
  /^next$/,
  /^vite/,
  /^tailwindcss/,
  /^postcss$/,
  /^@rn-terrain\//,
  /^@repo\//,
];

function fail(msg) {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function loadWorkspace() {
  const wsPath = path.join(repoRoot, 'pnpm-workspace.yaml');
  const excludedDirs = new Set();
  if (fs.existsSync(wsPath)) {
    for (const line of fs.readFileSync(wsPath, 'utf8').split('\n')) {
      const t = line.trim();
      if (t.startsWith('!')) excludedDirs.add(t.slice(1).replace(/\/\*$/, ''));
    }
  }
  const entries = [];
  for (const kind of ['packages', 'apps']) {
    const base = path.join(repoRoot, kind);
    if (!fs.existsSync(base)) continue;
    for (const dir of fs.readdirSync(base, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const manifest = readJson(path.join(base, dir.name, 'package.json'));
      if (!manifest) continue;
      entries.push({
        kind,
        dir: dir.name,
        manifest,
        excluded: excludedDirs.has(`${kind}/${dir.name}`),
      });
    }
  }
  return entries;
}

/** Tiny YAML-subset parser: nested maps with scalar values. */
function parseMiniYaml(source) {
  const root = {};
  const stack = [{ indent: -1, node: root }];
  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const content = raw.replace(/^[ \t]*#.*$/, '').replace(/[ \t]#.*$/, '');
    if (!content.trim()) continue;
    const indent = content.match(/^ */)[0].length;
    const line = content.trim();
    if (!line.includes(':')) fail('stack-map: expected "key: value" in annotation YAML');
    const key = line.slice(0, line.indexOf(':')).trim().replace(/^"|"$/g, '');
    const value = line.slice(line.indexOf(':') + 1).trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    if (value === '') {
      const child = {};
      stack[stack.length - 1].node[key] = child;
      stack.push({ indent, node: child });
    } else {
      stack[stack.length - 1].node[key] = toScalar(value);
    }
  }
  return root;
}

function toScalar(raw) {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2)
    return v.slice(1, -1).replace(/\\"/g, '"');
  return v;
}

function anchorOf(name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]+/g, '');
}

function escMd(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function yamlKey(k) {
  return /^[A-Za-z0-9_.@/-]+$/.test(k) ? k : `"${k}"`;
}

function yamlValue(v) {
  const s = String(v);
  if (/^[A-Za-z0-9_+./-]+$/.test(s) && !s.endsWith(':') && !/^[?!-]/.test(s)) return s;
  return `"${s.replace(/"/g, '\\"')}"`;
}

function tokenize(name) {
  return name
    .replace(/^@/, '')
    .split(/\W+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 1 && !STOP_TOKENS.has(t));
}

function readFirstParagraph(dir) {
  const readme = path.join(dir, 'README.md');
  if (!fs.existsSync(readme)) return null;
  const lines = fs.readFileSync(readme, 'utf8').split(/\r?\n/);
  const words = [];
  for (const line of lines) {
    const t = line.trim();
    if (
      t.startsWith('#') ||
      t.startsWith('---') ||
      t.startsWith('>') ||
      t.startsWith('|') ||
      /^https?:\/\//.test(t) ||
      /^\[!\[/.test(t)
    )
      continue;
    if (t === '' && words.length > 0) break;
    words.push(t);
    if (words.join(' ').length > 400) break;
  }
  const out = words.join(' ').replace(/\s+/g, ' ').trim();
  return out.length > 20 ? out.slice(0, 400) : null;
}

function guessLayer(entry) {
  const n = entry.manifest.name.toLowerCase();
  if (entry.kind === 'apps') {
    if (n.includes('mobile')) return 'app (mobile)';
    if (n.includes('api')) return 'app (api)';
    return 'app (web)';
  }
  if (n.includes('rn-terrain') || n.includes('mcp') || n.includes('cli')) return 'tooling';
  if (
    n.includes('eslint-config') ||
    n.includes('typescript-config') ||
    n.includes('types-shim') ||
    n.includes('database') ||
    n.includes('schema')
  )
    return 'core';
  if (n.includes('graphics')) return 'ui';
  return 'domain';
}

function buildIndex(workspace) {
  const dependents = new Map();
  for (const e of workspace) dependents.set(e.manifest.name, []);
  for (const e of workspace) {
    const all = { ...e.manifest.dependencies, ...e.manifest.devDependencies };
    for (const dep of Object.keys(all)) {
      if (dependents.has(dep) && dep !== e.manifest.name) dependents.get(dep).push(e.manifest.name);
    }
  }
  return dependents;
}

function computeOverlapHints(workspace) {
  const hints = [];
  const seen = new Set();

  // 1) Naming-similarity pairs — shared-token ratio, stable per-pair ids
  const tokenized = workspace.map((e) => ({ ...e, tokens: tokenize(e.manifest.name) }));
  for (let i = 0; i < tokenized.length; i++) {
    for (let j = i + 1; j < tokenized.length; j++) {
      const a = tokenized[i];
      const b = tokenized[j];
      if (!a.tokens.length || !b.tokens.length) continue;
      const setA = new Set(a.tokens);
      const setB = new Set(b.tokens);
      const inter = [...setA].filter((t) => setB.has(t)).length;
      const union = new Set([...setA, ...setB]).size;
      // identical single-token names (e.g. "core" vs "core") are not overlap signals
      if (inter === 0) continue;
      if (inter === union && inter === 1) continue;
      const ratio = inter / Math.min(a.tokens.length, b.tokens.length);
      if (ratio < 0.6) continue;
      const [left, right] = [a.manifest.name, b.manifest.name].sort();
      hints.push({
        id: `naming-${anchorOf(left)}-vs-${anchorOf(right)}`,
        type: 'naming',
        title: `${left} vs ${right}`,
        evidence: `shared ${inter} token(s) of ${union}`,
        parties: [left, right],
      });
    }
  }

  // 2) External deps shared by >= 3 workspace members
  const depUsers = new Map();
  for (const e of workspace) {
    for (const dep of Object.keys(e.manifest.dependencies ?? {})) {
      if (IGNORABLE_EXTERNS.some((re) => re.test(dep))) continue;
      if (!depUsers.has(dep)) depUsers.set(dep, []);
      depUsers.get(dep).push(e.manifest.name);
    }
  }
  for (const [dep, users] of [...depUsers.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (users.length < 3) break;
    hints.push({
      id: `shared-${anchorOf(dep)}`,
      type: 'shared-dep',
      title: dep,
      evidence: `used by ${users.length} workspace members`,
      parties: users,
    });
  }
  return hints;
}

function formatYaml(annotations) {
  const lines = [];
  lines.push('# Stack Map annotations — curated. Docs are generated: pnpm run stack-map');
  lines.push('# Update this file (or agents add entries), then regenerate.');
  lines.push('');
  const meta = annotations.metadata ?? {};
  lines.push('metadata:');
  for (const [k, v] of Object.entries(meta)) lines.push(`  ${k}: ${yamlValue(v)}`);
  lines.push('');
  lines.push('package_entries:');
  for (const [name, fields] of Object.entries(annotations.package_entries ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`  ${yamlKey(name)}:`);
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined || value === '') continue;
      lines.push(`    ${field}: ${yamlValue(value)}`);
    }
  }
  lines.push('');
  lines.push('overlap_verdicts:');
  for (const [id, fields] of Object.entries(annotations.overlap_verdicts ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`  ${yamlKey(id)}:`);
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      lines.push(`    ${field}: ${yamlValue(value)}`);
    }
  }
  lines.push('');
  lines.push('usecase_notes:');
  for (const [name, fields] of Object.entries(annotations.usecase_notes ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`  ${yamlKey(name)}:`);
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      lines.push(`    ${field}: ${yamlValue(value)}`);
    }
  }
  return lines.join('\n') + '\n';
}

const CATEGORY_ORDER = [
  'native',
  'navigation',
  'animation',
  'styling',
  'ui-kit',
  'icons',
  'graphics',
  'types',
  'data-sync',
  'orm-db',
  'validation',
  'state',
  'ai',
  'api',
  'auth',
  'flags',
  'payments',
  'observability',
  'workflows',
  'i18n',
  'utility',
  'media',
  'maps',
  'crypto',
  'storage',
  'scanning',
  'testing',
  'lint',
  'build',
  'tooling',
  'mcp',
  'unclassified',
];

/** Heuristic category for an external npm package (curated overrides win). */
function guessDepCategory(name) {
  const n = name.toLowerCase();
  const scoped = (prefix) => n.startsWith(`${prefix}/`) || n.startsWith(prefix);
  const oneOf = (word) =>
    n === word || n.startsWith(`${word}-`) || n.startsWith(`${word}/`) || n.startsWith(`${word}@`);

  if (name.startsWith('@types/')) return 'types';
  if (name === 'ai' || scoped('@ai-sdk')) return 'ai';
  if (/^(openai|anthropic|gemini)$/.test(n) || scoped('@anthropic-ai') || scoped('@google'))
    return 'ai';
  if (scoped('@tanstack')) return n.includes('ai') ? 'ai' : 'state';
  if (
    scoped('@zenstackhq') ||
    scoped('@prisma') ||
    oneOf('prisma') ||
    oneOf('drizzle-orm') ||
    oneOf('kysely') ||
    n === 'pg' ||
    oneOf('better-sqlite3') ||
    n === 'decimal.js'
  )
    return 'orm-db';
  if (oneOf('zod') || oneOf('valibot') || oneOf('joi') || oneOf('superstruct')) return 'validation';
  if (oneOf('zustand') || oneOf('xstate') || oneOf('valtio') || oneOf('jotai') || oneOf('zustand-'))
    return 'state';
  if (oneOf('inngest') || scoped('@inngest')) return 'workflows';
  if (scoped('@growthbook')) return 'flags';
  if (
    scoped('@supabase') ||
    scoped('@powersync') ||
    scoped('@journeyapps') ||
    scoped('@op-engineering')
  )
    return 'data-sync';
  if (scoped('@react-navigation')) return 'navigation';
  if (
    n === 'react' ||
    n === 'react-dom' ||
    n === 'react-native' ||
    n === 'react-test-renderer' ||
    n === 'scheduler' ||
    n === 'react-freeze' ||
    n === 'react-is' ||
    n === 'use-sync-external-store' ||
    n === 'use-latest-callback' ||
    n === 'hoist-non-react-statics' ||
    n === 'styleq' ||
    n === 'inline-style-prefixer'
  )
    return 'native';
  if (n.startsWith('react-native-')) {
    if (/(mmkv|async-storage|secure|url-polyfill|get-random)/.test(n)) return 'storage';
    if (/(maps|vision)/.test(n)) return 'maps';
    if (/(camera|image|media|video|qr|qrcode)/.test(n)) return 'media';
    if (/(ml-kit|barcode|text-recognition)/.test(n)) return 'scanning';
    if (
      /(reanimated|worklets|fast-shimmer|skeleton|carousel|ease|shared-hero|streamdown|motion)/.test(
        n,
      )
    )
      return 'animation';
    if (/(svg|css-interop|linear-gradient|masked|style)$|^react-native-css/.test(n))
      return 'styling';
    if (
      /(pager|bottom|segmented|slider|picker|datetime|keyboard|pull|blur|glass|sheet|flash|custom)/.test(
        n,
      )
    )
      return 'ui-kit';
    return 'native';
  }
  if (
    scoped('@shopify') ||
    scoped('@swmansion') ||
    scoped('@legendapp') ||
    scoped('@react-native')
  ) {
    if (n.includes('flash') || n.includes('masked')) return 'ui-kit';
    return 'native';
  }
  if (scoped('@maplibre') || scoped('@mapbox')) return 'maps';
  if (
    oneOf('nativewind') ||
    scoped('@tailwindcss') ||
    oneOf('tailwindcss') ||
    oneOf('postcss') ||
    oneOf('sass')
  )
    return 'styling';
  if (scoped('@expo-google-fonts')) return 'media';
  if (scoped('@babel') || oneOf('babel-plugin-transform-imports') || oneOf('core-js'))
    return 'build';
  if (n === 'hono') return 'api';
  if (
    n === 'jsqr' ||
    n === 'qrcode' ||
    n === 'voltra' ||
    oneOf('@azure/core-asynciterator-polyfill')
  )
    return 'utility';
  if (scoped('@nishansanjuka')) return 'maps';
  if (scoped('@next/eslint')) return 'lint';
  if (/^expo|^@expo\//.test(n)) {
    if (/^expo-(crypto|secure-store|local-authentication)/.test(n)) return 'crypto';
    if (
      /^expo-(camera|image|video|audio|media|print|document|mail|sharing|sensors|location|blob)/.test(
        n,
      )
    )
      return 'media';
    if (scoped('@expo-google-fonts')) return 'media';
    if (/^expo-(sqlite|file-system|clipboard|blob)/.test(n)) return 'storage';
    return 'native';
  }
  if (scoped('@astrojs') || scoped('@sveltejs') || oneOf('astro') || oneOf('svelte'))
    return 'build';
  if (
    oneOf('vite') ||
    scoped('@vitejs') ||
    oneOf('esbuild') ||
    scoped('@esbuild') ||
    oneOf('tsdown') ||
    oneOf('tsup')
  )
    return 'build';
  if (scoped('@orpc') || scoped('@hono') || scoped('@ts-rest') || scoped('@scalar')) return 'api';
  if (n.includes('i18next') || n.includes('lingui') || n === 'i18next') return 'i18n';
  if (
    oneOf('date-fns') ||
    oneOf('dayjs') ||
    oneOf('luxon') ||
    oneOf('moment') ||
    oneOf('uuid') ||
    oneOf('semver') ||
    oneOf('dotenv') ||
    oneOf('qs') ||
    oneOf('nanoid') ||
    oneOf('clsx') ||
    oneOf('cuid2') ||
    scoped('@paralleldrive') ||
    oneOf('fast-deep-equal') ||
    oneOf('fast-json-patch') ||
    oneOf('invariant') ||
    oneOf('culori') ||
    oneOf('color-name') ||
    oneOf('apca-w3') ||
    oneOf('jpeg-js') ||
    oneOf('xlsx') ||
    oneOf('glob') ||
    oneOf('rimraf') ||
    oneOf('cross-env') ||
    oneOf('effect') ||
    oneOf('scheduler')
  )
    return 'utility';
  if (oneOf('stripe') || scoped('@stripe')) return 'payments';
  if (
    scoped('@sentry') ||
    scoped('@posthog') ||
    oneOf('posthog') ||
    oneOf('pino') ||
    oneOf('winston') ||
    scoped('@opentelemetry')
  )
    return 'observability';
  if (
    oneOf('lucide-react') ||
    oneOf('lucide-react-native') ||
    oneOf('phosphor-react-native') ||
    scoped('@expo/vector-icons')
  )
    return 'icons';
  if (
    scoped('@testing-library') ||
    oneOf('jest') ||
    oneOf('vitest') ||
    scoped('@jest') ||
    scoped('@vitest') ||
    oneOf('playwright') ||
    scoped('@playwright') ||
    oneOf('reassure') ||
    oneOf('tsx')
  )
    return 'testing';
  if (
    scoped('@typescript-eslint') ||
    scoped('@eslint') ||
    oneOf('eslint') ||
    scoped('eslint-plugin') ||
    scoped('@eslint-react') ||
    scoped('@rnx-kit') ||
    oneOf('oxlint') ||
    scoped('@biomejs') ||
    oneOf('prettier')
  )
    return 'lint';
  if (
    oneOf('typescript') ||
    oneOf('turbo') ||
    oneOf('knip') ||
    oneOf('dependency-cruiser') ||
    oneOf('madge') ||
    oneOf('syncpack') ||
    oneOf('size-limit') ||
    scoped('@size-limit') ||
    scoped('@changesets') ||
    oneOf('husky') ||
    oneOf('lint-staged') ||
    oneOf('commitlint') ||
    scoped('@commitlint') ||
    oneOf('jscpd') ||
    oneOf('gitleaks') ||
    oneOf('promptfoo') ||
    oneOf('supabase') ||
    oneOf('cac') ||
    oneOf('chalk') ||
    oneOf('consola') ||
    scoped('@rozenite') ||
    oneOf('foglamp') ||
    oneOf('globals') ||
    oneOf('three-devtools')
  )
    return 'tooling';
  if (scoped('@modelcontextprotocol') || oneOf('mcp-remote')) return 'mcp';
  if (
    scoped('@noble') ||
    oneOf('base64-js') ||
    oneOf('buffer') ||
    oneOf('ieee754') ||
    oneOf('isomorphic-webcrypto')
  )
    return 'crypto';
  if (oneOf('three') || scoped('@webgpu') || oneOf('typegpu') || oneOf('gsap') || oneOf('d3'))
    return 'graphics';
  if (oneOf('gluestack-ui')) return 'ui-kit';
  if (scoped('@cedar-policy')) return 'auth';
  return 'unclassified';
}

/** Normalize a version spec to major.minor for drift comparison. */
function versionGroup(spec) {
  const m = String(spec)
    .replace(/^(~|\^|>=?|<=?|=|npm:[^@]+@)/, '')
    .match(/\d+\.\d+/);
  if (!m) return 'any';
  return m[0];
}

function collectExternalDeps(workspace) {
  const info = new Map();
  const record = (name, spec, member, scope) => {
    if (name.startsWith('@repo/') || name.startsWith('@rn-terrain/') || spec === 'workspace:*')
      return;
    if (!info.has(name)) {
      info.set(name, { name, specs: new Map(), consumers: [], scope: new Set() });
    }
    const entry = info.get(name);
    entry.scope.add(scope);
    if (!entry.specs.has(spec)) entry.specs.set(spec, []);
    entry.specs.get(spec).push(member);
    entry.consumers.push(member);
  };
  for (const e of workspace) {
    const m = e.manifest;
    for (const [name, spec] of Object.entries(m.dependencies ?? {}))
      record(name, spec, m.name, 'prod');
    for (const [name, spec] of Object.entries(m.devDependencies ?? {}))
      record(name, spec, m.name, 'dev');
  }
  const out = [];
  for (const [name, entry] of info) {
    const specs = [...entry.specs.keys()];
    const groups = new Set(specs.map(versionGroup));
    out.push({
      name,
      specs,
      groups: [...groups],
      drift: groups.size > 1,
      consumers: [...new Set(entry.consumers)],
      prod: entry.scope.has('prod'),
      dev: entry.scope.has('dev'),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function renderDependencyCatalog(workspace) {
  const depsAnnotationsPath = path.join(docsDir, 'dependency-annotations.yaml');
  let ann = {};
  if (fs.existsSync(depsAnnotationsPath))
    ann = parseMiniYaml(fs.readFileSync(depsAnnotationsPath, 'utf8'));
  const entries = ann.dependency_entries ?? {};
  const tools = ann.global_tools ?? {};

  const deps = collectExternalDeps(workspace);
  const sacred = deps.filter((d) => entries[d.name]?.sacred);
  const drift = deps.filter((d) => d.drift);

  const categories = new Map();
  const classified = deps.map((d) => {
    const cat = entries[d.name]?.category ?? guessDepCategory(d.name);
    return Object.assign({}, d, { category: cat });
  });
  for (const d of classified) {
    if (!categories.has(d.category)) categories.set(d.category, []);
    categories.get(d.category).push(d);
  }

  const consumersCell = (d) => {
    const names = d.consumers.slice(0, 8).join(', ');
    return names + (d.consumers.length > 8 ? ` …(+${d.consumers.length - 8})` : '');
  };
  const purposeOf = (d) => entries[d.name]?.purpose ?? '—';
  const notesOf = (d) => entries[d.name]?.notes ?? '';

  const rows = [];
  rows.push('# Dependency Catalog — external ecosystem');
  rows.push('');
  rows.push(
    `> Generated by \`pnpm run stack-map:deps\`. **Do not hand-edit.** Curated source: [dependency-annotations.yaml](./dependency-annotations.yaml).`,
  );
  rows.push('');
  rows.push(
    `_Snapshot: ${new Date().toISOString().slice(0, 10)} — ${deps.length} unique external deps · ${drift.length} version-drift · ${sacred.length} sacred pins_`,
  );
  rows.push('');
  rows.push(
    'The external counterpart of [stack-map.md](./stack-map.md): every npm package/SDK/CLI this monorepo stands on. Internal packages live in the stack map.',
  );
  rows.push('');
  rows.push('## Sacred pins (do not upgrade without approval)');
  rows.push('');
  rows.push('| Package | Pin | Why pinned |');
  rows.push('| :--- | :--- | :--- |');
  for (const d of sacred) {
    const e = entries[d.name];
    rows.push(
      `| ${escMd(d.name)} | \`${escMd(e.sacred)}\` | ${escMd(e.notes ?? e.purpose ?? 'new-arch compatibility')} |`,
    );
  }
  rows.push('');
  rows.push(`## Version drift (${drift.length})`);
  rows.push('');
  rows.push(
    'Same package with differing major.minor groups across the workspace — syncpack territory, cataloged for visibility.',
  );
  rows.push('');
  rows.push('| Package | Versions | Consumers |');
  rows.push('| :--- | :--- | :--- |');
  for (const d of drift) {
    rows.push(`| ${escMd(d.name)} | ${escMd(d.groups.join(', '))} | ${escMd(consumersCell(d))} |`);
  }
  if (drift.length === 0) rows.push('| _(no drift)_ | | |');
  rows.push('');
  rows.push('## Global tooling (not npm-managed)');
  rows.push('');
  rows.push('| Tool | Category | Purpose | Notes |');
  rows.push('| :--- | :--- | :--- | :--- |');
  for (const [name, t] of Object.entries(tools)) {
    rows.push(
      `| ${escMd(name)} | ${escMd(t.category ?? '—')} | ${escMd(t.purpose ?? '—')} | ${escMd(t.notes ?? '—')} |`,
    );
  }
  rows.push('');
  rows.push('## Catalog by category');
  rows.push('');
  for (const cat of CATEGORY_ORDER) {
    const list = categories.get(cat);
    if (!list || list.length === 0) continue;
    rows.push(`### ${cat} (${list.length})`);
    rows.push('');
    rows.push('| Package | Versions | Consumers | Purpose | Notes |');
    rows.push('| :--- | :--- | :--- | :--- | :--- |');
    for (const d of list) {
      rows.push(
        `| ${escMd(d.name)} | ${escMd(d.groups.join(' / '))} | ${escMd(consumersCell(d))} | ${escMd(purposeOf(d))} | ${escMd(notesOf(d))} |`,
      );
    }
    rows.push('');
  }
  rows.push('---');
  rows.push('');
  rows.push('## Full alphabetical index');
  rows.push('');
  rows.push('| Package | Category | Consumers |');
  rows.push('| :--- | :--- | :--- |');
  for (const d of classified) {
    rows.push(`| ${escMd(d.name)} | ${d.category} | ${d.consumers.length} |`);
  }
  rows.push('');
  rows.push('## Convention');
  rows.push('');
  rows.push('- Every workspace package.json dependency lands here automatically on regenerate.');
  rows.push(
    '- Curate purpose/category/notes/sacred in `dependency-annotations.yaml`, never the generated file.',
  );
  rows.push('- After adding a dep: `pnpm run stack-map:deps` to refresh.');
  return rows.join('\n') + '\n';
}

function renderMaster(workspace, dependents, annotations, hints) {
  const pkgEntries = annotations.package_entries ?? {};
  const verdicts = annotations.overlap_verdicts ?? {};
  const packages = workspace.filter((e) => e.kind === 'packages');
  const apps = workspace.filter((e) => e.kind === 'apps');
  const uncurated = packages.filter((e) => !pkgEntries[e.manifest.name]);

  const rows = [];
  rows.push(`# Stack Catalog — Polymath Monorepo`);
  rows.push('');
  rows.push(
    `> Generated by \`pnpm run stack-map\`. **Do not hand-edit.** Curated source: [stack-map-annotations.yaml](./stack-map-annotations.yaml).`,
  );
  rows.push('');
  rows.push(
    `> Snapshot: ${new Date().toISOString().slice(0, 10)} — ${packages.length} packages · ${apps.length} apps · ${uncurated.length} uncurated`,
  );
  rows.push('');
  rows.push(
    'This is the **compressed master catalog**. Thin per-app footprint sheets link back into it: [./catalog/](./catalog/).',
  );
  rows.push('');
  rows.push('## Layer legend');
  rows.push('');
  rows.push('| Layer | Meaning |');
  rows.push('| :--- | :--- |');
  for (const [key, desc] of Object.entries(LAYER_LEGEND)) rows.push(`| ${key} | ${desc} |`);
  rows.push('');
  rows.push(`## Packages — at a glance (${packages.length})`);
  rows.push('');
  rows.push('| Package | Layer | Version | Consumers | Purpose |');
  rows.push('| :--- | :--- | :--- | :---: | :--- |');
  for (const e of packages) {
    const ann = pkgEntries[e.manifest.name] ?? {};
    const layer = ann.layer ?? '⚠ uncurated';
    const purpose =
      ann.summary ??
      e.manifest.description ??
      (uncurated.some((u) => u.manifest.name === e.manifest.name)
        ? '⚠ run `stack-map:bootstrap`'
        : '—');
    const consumers = (dependents.get(e.manifest.name) ?? []).length;
    rows.push(
      `| [${escMd(e.manifest.name)}](#${anchorOf(e.manifest.name)})${e.excluded ? ' ⛔' : ''} | ${escMd(layer)} | ${e.manifest.version ?? '—'} | ${consumers} | ${escMd(purpose).slice(0, 110)} |`,
    );
  }
  rows.push('');
  rows.push(`> ⛔ exists on disk but is excluded from the pnpm workspace.`);
  rows.push('');
  rows.push(`## Apps — at a glance (${apps.length})`);
  rows.push('');
  rows.push('| App | Layer | Workspace deps | Footprint sheet |');
  rows.push('| :--- | :--- | :---: | :--- |');
  for (const e of apps) {
    const ann = pkgEntries[e.manifest.name] ?? {};
    const layer = ann.layer ?? 'app';
    const wsDeps = Object.keys({
      ...e.manifest.dependencies,
      ...e.manifest.devDependencies,
    }).filter((d) => d.startsWith('@repo/')).length;
    rows.push(
      `| [${escMd(e.manifest.name)}](#${anchorOf(e.manifest.name)}) | ${escMd(layer)} | ${wsDeps} | [catalog/${escMd(e.dir)}.md](./catalog/${escMd(e.dir)}.md) |`,
    );
  }
  rows.push('');
  rows.push('## Overlap watchlist');
  rows.push('');
  rows.push(
    'Auto-detected hints (naming similarity, shared external deps). Verdicts are curated in the annotations file.',
  );
  rows.push('');
  rows.push('| ID | Kind | Subject | Evidence | Parties | Verdict | Note |');
  rows.push('| :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const h of hints) {
    const v = verdicts[h.id] ?? {};
    rows.push(
      `| ${h.id} | ${h.type} | ${escMd(h.title)} | ${escMd(h.evidence)} | ${escMd(h.parties.join(', '))} | ${escMd(v.verdict ?? 'undecided')} | ${escMd(v.note ?? '')} |`,
    );
  }
  rows.push('');
  rows.push(`## Floating packages (zero consumers)`);
  rows.push('');
  rows.push('| Package | Layer | Verdict |');
  rows.push('| :--- | :--- | :--- |');
  const floating = packages.filter((e) => (dependents.get(e.manifest.name) ?? []).length === 0);
  for (const e of floating) {
    const ann = pkgEntries[e.manifest.name] ?? {};
    rows.push(
      `| ${escMd(e.manifest.name)} | ${escMd(ann.layer ?? '?')} | ${escMd(ann.floating ?? 'undecided')} |`,
    );
  }
  if (floating.length === 0) rows.push('| _(none)_ | | |');
  rows.push('');
  rows.push('---');
  rows.push('');
  rows.push('## Recurring convention');
  rows.push('');
  rows.push(
    '- New dependency or package **added**? Run `pnpm run stack-map:bootstrap` (drafts a sheet entry), review it, then `pnpm run stack-map`.',
  );
  rows.push('- Annotations file is the only hand-edited input besides package.json manifests.');
  return rows.join('\n') + '\n';
}

function renderAppSheet(app, annotations) {
  const pkgEntries = annotations.package_entries ?? {};
  const usecase = annotations.usecase_notes?.[app.manifest.name] ?? {};
  const wpDeps = Object.keys(app.manifest.dependencies ?? {}).filter(
    (d) => d.startsWith('@repo/') || d.startsWith('@rn-terrain/'),
  );
  const external = Object.keys(app.manifest.dependencies ?? {}).filter(
    (d) => !d.startsWith('@repo/') && !d.startsWith('@rn-terrain/'),
  );
  const devDeps = Object.keys(app.manifest.devDependencies ?? {});

  const rows = [];
  rows.push(`# ${escMd(app.manifest.name)} — dependency footprint`);
  rows.push('');
  rows.push(
    `> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master`,
  );
  rows.push('');
  rows.push(
    String(
      usecase.summary ?? pkgEntries[app.manifest.name]?.summary ?? app.manifest.description ?? '—',
    ),
  );
  rows.push('');
  rows.push('## Workspace packages used');
  rows.push('');
  if (wpDeps.length === 0) {
    rows.push('_None (no workspace deps)._');
  } else {
    rows.push('| Package | Layer | Purpose |');
    rows.push('| :--- | :--- | :--- |');
    for (const dep of wpDeps) {
      const ann = pkgEntries[dep] ?? {};
      rows.push(
        `| [${escMd(dep)}](../stack-map.md#${anchorOf(dep)}) | ${escMd(ann.layer ?? '?')} | ${escMd(ann.summary ?? '—')} |`,
      );
    }
  }
  rows.push('');
  rows.push(`## External deps (${external.length} direct)`);
  rows.push('');
  if (external.length === 0) {
    rows.push('_(none)_');
  } else {
    rows.push('```text');
    for (const d of external.sort()) rows.push(d);
    rows.push('```');
  }
  rows.push('');
  rows.push(`## Dev tooling (${devDeps.length})`);
  rows.push('');
  if (devDeps.length === 0) {
    rows.push('_(none)_');
  } else {
    rows.push('```text');
    for (const d of devDeps.sort()) rows.push(d);
    rows.push('```');
  }
  rows.push('');
  rows.push('## Coupling notes');
  rows.push('');
  rows.push(String(usecase.coupling ?? '—'));
  rows.push('');
  return rows.join('\n') + '\n';
}

function renderRnTerrainSheet(workspace, annotations) {
  const pkgEntries = annotations.package_entries ?? {};
  const suite = workspace.filter((e) => e.manifest.name.startsWith('@rn-terrain/'));
  const rows = [];
  rows.push(`# RN Terrain suite — dependency footprint`);
  rows.push('');
  rows.push(
    `> Part of the [Stack Catalog](../stack-map.md) · ${suite.length} members in this monorepo`,
  );
  rows.push('');
  rows.push(
    'RN Terrain is the orientation layer: maps the ecosystem (external landscape) and this monorepo (stack-map).',
  );
  rows.push('');
  rows.push('## Suite members');
  rows.push('');
  rows.push('| Package | Purpose | External deps |');
  rows.push('| :--- | :--- | :--- |');
  for (const e of suite) {
    const ann = pkgEntries[e.manifest.name] ?? {};
    const ext = Object.keys(e.manifest.dependencies ?? {}).filter(
      (d) => !d.startsWith('@repo/') && !d.startsWith('@rn-terrain/'),
    );
    rows.push(
      `| [${escMd(e.manifest.name)}](../stack-map.md#${anchorOf(e.manifest.name)}) | ${escMd(ann.summary ?? '—')} | ${ext.join(', ') || '—'} |`,
    );
  }
  rows.push('');
  rows.push('## Related documents');
  rows.push('');
  rows.push('- `landscape/` — ecosystem giants this project stands on (external map)');
  rows.push('- `stack-map.md` — this monorepo (internal map)');
  rows.push('- `catalog/*.md` — per-app dependency footprints');
  rows.push('');
  return rows.join('\n') + '\n';
}

function main() {
  const mode = process.argv[2] ?? 'generate';
  const workspace = loadWorkspace();
  if (workspace.length === 0) fail('no workspace members found');

  for (const dir of [docsDir, catalogDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  let annotations = {};
  if (fs.existsSync(annotationsPath)) {
    annotations = parseMiniYaml(fs.readFileSync(annotationsPath, 'utf8'));
  }
  annotations.metadata ??= {};
  annotations.package_entries ??= {};
  annotations.overlap_verdicts ??= {};
  annotations.usecase_notes ??= {};

  if (mode === 'bootstrap') {
    let drafted = 0;
    for (const e of workspace) {
      const name = e.manifest.name;
      if (annotations.package_entries[name]) continue;
      const summary =
        readFirstParagraph(path.join(repoRoot, e.kind, e.dir)) ??
        e.manifest.description ??
        `${name} — awaiting curation`;
      annotations.package_entries[name] = {
        layer: guessLayer(e),
        summary,
        floating: 'undecided',
      };
      drafted++;
    }
    annotations.metadata.updated = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(annotationsPath, formatYaml(annotations), 'utf8');
    console.log(
      `✅ bootstrap drafted ${drafted} entries → ${path.relative(repoRoot, annotationsPath)} (existing entries untouched).`,
    );
    return;
  }

  if (mode === 'deps') {
    const catalogPath = path.join(docsDir, 'dependency-catalog.md');
    fs.writeFileSync(catalogPath, renderDependencyCatalog(workspace), 'utf8');
    console.log(`✅ dependency catalog regenerated → ${path.relative(repoRoot, catalogPath)}`);
    return;
  }

  if (mode !== 'generate') fail(`unknown mode "${mode}" (expected: generate | bootstrap | deps)`);

  const dependents = buildIndex(workspace);
  const hints = computeOverlapHints(workspace);
  fs.writeFileSync(masterPath, renderMaster(workspace, dependents, annotations, hints), 'utf8');

  for (const e of workspace.filter((x) => x.kind === 'apps')) {
    fs.writeFileSync(path.join(catalogDir, `${e.dir}.md`), renderAppSheet(e, annotations), 'utf8');
  }
  fs.writeFileSync(
    path.join(catalogDir, 'rn-terrain.md'),
    renderRnTerrainSheet(workspace, annotations),
    'utf8',
  );

  const expected = new Set([
    ...workspace.filter((x) => x.kind === 'apps').map((x) => `${x.dir}.md`),
    'rn-terrain.md',
  ]);
  let pruned = 0;
  for (const f of fs.readdirSync(catalogDir)) {
    if (f.endsWith('.md') && !expected.has(f)) {
      fs.unlinkSync(path.join(catalogDir, f));
      pruned++;
      console.log(`🧹 pruned orphaned catalog sheet: catalog/${f}`);
    }
  }

  const sheets = 1 + workspace.filter((x) => x.kind === 'apps').length + 1;
  console.log(
    `✅ stack-map regenerated: stack-map.md + ${sheets - 1} catalog sheets (${sheets} files total).`,
  );
}

main();
