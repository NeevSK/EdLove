#!/usr/bin/env node
/**
 * Sorts every "effect that sets state" (oxlint react/set-state-in-effect and
 * no-deriving-state-in-effects, from .oxlintrc.react.json) by what the effect body does, so
 * the right replacement can be chosen per bucket:
 *
 *   fetch          awaits or .then()s, then sets state      → useQuery / local query
 *   mirror         sets state to exactly its useState initializer when a dependency changes
 *                  → read it during render (or a local query when it reads storage)
 *   reset          sets constants when a dependency changes → reset during render or a `key`
 *   subscription   subscribes and returns cleanup           → keep, or useSyncExternalStore
 *   timer          setTimeout / setInterval                 → keep with cleanup, or Pacer
 *   derive         sets a value computed from props/state   → compute during render (useMemo)
 *   loader         only calls a local load function (`void refreshData()`) → useQuery
 *   controlled     `if (prop !== undefined) setInternal(prop)` → `const value = prop ?? internal`
 *   mount-read     reads localStorage / window / document once on mount
 *                  → useSyncExternalStore with a server snapshot
 *   other          needs reading
 *
 * Dry run only: prints the buckets (and `--json` for tooling). It changes no file.
 * See docs/architecture/2026-11-12-state-effects-hooks-and-capabilities.md (the effect rule).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);
const ts = require(
  path.join(ROOT, 'node_modules/.pnpm/@typescript+typescript6@6.0.2/node_modules/@typescript/typescript6'),
);

const CODES = new Set(['react(set-state-in-effect)', 'react(no-deriving-state-in-effects)']);

function diagnostics() {
  let out = '';
  try {
    out = execFileSync('node_modules/.bin/oxlint', ['-c', '.oxlintrc.react.json', '-f', 'json', 'packages', 'apps'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    out = error.stdout ?? '';
  }
  return JSON.parse(out).diagnostics.filter((d) => CODES.has(d.code));
}

const isCall = (node, name) =>
  ts.isCallExpression(node) &&
  (ts.isIdentifier(node.expression) ? node.expression.text === name : node.expression.name?.text === name);

function enclosingEffect(sourceFile, offset) {
  let found;
  const visit = (node) => {
    if (offset < node.getStart(sourceFile) || offset > node.getEnd()) return;
    if (isCall(node, 'useEffect') || isCall(node, 'useLayoutEffect')) found = node;
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/** `const [x, setX] = useState(init)` in the file, by setter name. */
function stateInitializers(sourceFile) {
  const initial = new Map();
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isArrayBindingPattern(node.name) &&
      node.initializer &&
      isCall(node.initializer, 'useState')
    ) {
      const setter = node.name.elements[1];
      const arg = node.initializer.arguments[0];
      if (setter && ts.isBindingElement(setter) && ts.isIdentifier(setter.name) && arg) {
        const text = ts.isArrowFunction(arg) && !ts.isBlock(arg.body) ? arg.body.getText(sourceFile) : arg.getText(sourceFile);
        initial.set(setter.name.text, text.replace(/\s+/g, ''));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return initial;
}

/** An if/else whose branches only call setters (and return). */
function onlySets(node, sourceFile) {
  let ok = true;
  const check = (branch) => {
    if (!branch) return;
    const statements = ts.isBlock(branch) ? branch.statements : [branch];
    for (const st of statements) {
      if (ts.isReturnStatement(st) && !st.expression) continue;
      if (ts.isIfStatement(st)) {
        if (!onlySets(st, sourceFile)) ok = false;
        continue;
      }
      if (!(ts.isExpressionStatement(st) && ts.isCallExpression(st.expression) && ts.isIdentifier(st.expression.expression) && /^set[A-Z]/.test(st.expression.expression.text))) ok = false;
    }
  };
  check(node.thenStatement);
  check(node.elseStatement);
  return ok;
}

function collectSets(node) {
  const out = [];
  const visit = (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && /^set[A-Z]/.test(n.expression.text)) out.push(n);
    ts.forEachChild(n, visit);
  };
  visit(node);
  return out;
}

function classify(sourceFile, effect, initial) {
  const callback = effect.arguments[0];
  if (!callback || !(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) return 'other';
  const text = callback.getText(sourceFile);
  if (/\bawait\b|\.then\(/.test(text)) return 'fetch';
  const statements = ts.isBlock(callback.body) ? callback.body.statements : [];
  // `void load()`, `load()`, `load().catch(...)`: fetching through a local function.
  if (statements.length === 1 && ts.isExpressionStatement(statements[0])) {
    let expr = statements[0].expression;
    if (ts.isVoidExpression(expr)) expr = expr.expression;
    if (ts.isCallExpression(expr) && ts.isPropertyAccessExpression(expr.expression) && expr.expression.name.text === 'catch') {
      expr = expr.expression.expression;
    }
    if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) && !/^set[A-Z]/.test(expr.expression.text)) {
      return 'loader';
    }
  }
  // `if (prop !== undefined) setInternal(prop)`: a controlled value mirrored into state.
  if (
    statements.length === 1 &&
    ts.isIfStatement(statements[0]) &&
    !statements[0].elseStatement &&
    /!==\s*undefined|!=\s*null/.test(statements[0].expression.getText(sourceFile)) &&
    /^\{?\s*set[A-Z]\w*\([^;]*\);?\s*\}?$/.test(statements[0].thenStatement.getText(sourceFile).trim())
  ) {
    return 'controlled';
  }
  const deps = effect.arguments[1];
  if (deps && ts.isArrayLiteralExpression(deps) && deps.elements.length === 0 && /localStorage|sessionStorage|window\.|document\.|Notification|navigator\./.test(text)) {
    return 'mount-read';
  }
  if (/\.subscribe\(|addEventListener\(|\.on\(|\.addListener\(|new (Mutation|Resize|Intersection)Observer/.test(text)) {
    return 'subscription';
  }
  if (/\bset(Timeout|Interval)\(|requestAnimationFrame\(/.test(text)) return 'timer';

  const body = ts.isBlock(callback.body) ? callback.body.statements : [ts.factory.createExpressionStatement(callback.body)];
  const sets = [];
  for (const statement of body) {
    if (ts.isIfStatement(statement) && /return/.test(statement.thenStatement.getText(sourceFile)) && !statement.elseStatement) {
      continue; // an early-return guard
    }
    if (ts.isIfStatement(statement) && onlySets(statement, sourceFile)) {
      sets.push(...collectSets(statement));
      continue;
    }
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) return 'other';
    const call = statement.expression;
    if (!ts.isIdentifier(call.expression) || !/^set[A-Z]/.test(call.expression.text)) return 'other';
    sets.push(call);
  }
  if (sets.length === 0) return 'other';
  const mirrors = sets.every((call) => {
    const arg = call.arguments[0];
    return arg && initial.get(call.expression.text) === arg.getText(sourceFile).replace(/\s+/g, '');
  });
  if (mirrors) return 'mirror';
  const constants = sets.every((call) => {
    const arg = call.arguments[0];
    return arg && (ts.isLiteralExpression(arg) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(arg.kind) || arg.getText(sourceFile) === 'undefined' || /^\[\]$|^\{\}$/.test(arg.getText(sourceFile)));
  });
  return constants ? 'reset' : 'derive';
}

const buckets = new Map();
const seen = new Set();
const sources = new Map();
for (const d of diagnostics()) {
  const file = d.filename;
  const label = d.labels?.[0];
  if (!label) continue;
  if (!sources.has(file)) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    sources.set(file, { sf, initial: stateInitializers(sf) });
  }
  const { sf, initial } = sources.get(file);
  const effect = enclosingEffect(sf, label.span.offset);
  const kind = effect ? classify(sf, effect, initial) : 'other';
  const line = sf.getLineAndCharacterOfPosition((effect ?? { getStart: () => label.span.offset }).getStart(sf)).line + 1;
  const key = `${file}:${line}`;
  if (seen.has(key)) continue; // several setters in one effect count once
  seen.add(key);
  if (!buckets.has(kind)) buckets.set(kind, []);
  buckets.get(kind).push(key);
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(Object.fromEntries(buckets), null, 2));
} else {
  const order = ['fetch', 'loader', 'mirror', 'controlled', 'reset', 'derive', 'mount-read', 'subscription', 'timer', 'other'];
  const total = [...buckets.values()].reduce((n, list) => n + list.length, 0);
  console.log(`${total} effects that set state (one per effect)\n`);
  for (const kind of order) {
    const list = buckets.get(kind) ?? [];
    console.log(`${kind.padEnd(13)} ${String(list.length).padStart(3)}`);
    if (process.argv.includes('--list')) for (const key of list) console.log(`    ${key}`);
  }
}
