/**
 * Finds every XState machine definition and what it declares, from the AST (TypeScript 6 API).
 * Used by the ratchet: every machine declares `schemas.events` (on `setup()` or on `createMachine`;
 * XState 6 checks both the same way), and none passes the deprecated second `options` argument.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RG_REFERENCE_ARGS } from '../../tooling/reference-only.mjs';

const REPO_ROOT = resolve(import.meta.dirname, '../..');
const { default: ts } = await import(
  resolve(REPO_ROOT, 'node_modules/.pnpm/@typescript+typescript6@6.0.2/node_modules/@typescript/typescript6/lib/typescript.js')
);

function machineFiles() {
  try {
    return execFileSync(
      'rg',
      ['-l', 'createMachine\\(', 'packages', 'apps', '-g', '*.ts', '-g', '*.tsx', '-g', '!**/__tests__/**',
        '-g', '!**/*.test.*', '-g', '!**/node_modules/**', '-g', '!**/dist/**', ...RG_REFERENCE_ARGS],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    ).trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const property = (object, key) =>
  object && ts.isObjectLiteralExpression(object)
    ? object.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === key)?.initializer
    : undefined;

export function machineDefinitions() {
  const found = [];
  for (const file of machineFiles()) {
    const source = ts.createSourceFile(file, readFileSync(resolve(REPO_ROOT, file), 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) ? node.expression.text === 'createMachine'
        : ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'createMachine') {
        const receiver = ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : undefined;
        const setupConfig = receiver && ts.isCallExpression(receiver) && receiver.expression.getText() === 'setup' ? receiver.arguments[0] : undefined;
        const config = node.arguments[0];
        const schemas = property(config, 'schemas') ?? property(setupConfig, 'schemas');
        found.push({
          file,
          line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          declaresEvents: Boolean(property(schemas, 'events')),
          deprecatedOptions: node.arguments.length > 1,
        });
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const m of machineDefinitions())
    console.log(`${m.file}:${m.line} events=${m.declaresEvents} deprecatedOptions=${m.deprecatedOptions}`);
}
