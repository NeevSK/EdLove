// Shim for `mcp__platform__.audit_package_architecture`.
// The MCP tool runs from `packages/`, so `scripts/...` resolves to `packages/scripts/...`.
//
// It also passes an absolute package path; the underlying script expects a repo-root-relative path.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const targetArgIndex = 2;
const maybeTarget = process.argv[targetArgIndex];

if (maybeTarget && path.isAbsolute(maybeTarget)) {
  const rel = path.relative(repoRoot, maybeTarget);
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
    process.argv[targetArgIndex] = rel;
  }
}

await import('../../scripts/audit-package-architecture.mjs');
