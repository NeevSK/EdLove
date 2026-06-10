// Shim for `mcp__platform__.check_classroom_boundaries`.
// The MCP tool runs from `packages/`, so `scripts/...` resolves to `packages/scripts/...`.
//
// The underlying script assumes it runs from the repo root (uses `process.cwd()`).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(repoRoot);

await import('../../scripts/check-classroom-boundaries.mjs');
