import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * The Architecture explorer's source panel, for local development only: the dev server answers
 * `/api/architecture/source?path=…` from the repository on disk. A built site has no such
 * endpoint (and must never expose source), so there the panel shows only the content embedded
 * in the explorer's data.
 */
export interface FileSourceResult {
  path: string;
  filename: string;
  loc: number;
  sizeBytes: number;
  content: string;
  error?: string;
}

// Never readable through the explorer, even on a developer's machine.
const FORBIDDEN_FILE_PATTERNS = [
  /^\.env/i,
  /\/\.env/i,
  /\\\.env/i,
  /\.gitleaks/i,
  /\.git[/\\]/i,
  /\.(pem|key|cert|crt|pfx|p12)$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /credentials/i,
  /secret/i,
];

export function findRepoRoot(start = process.cwd()): string {
  let current = start;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return start;
}

export type SourceAnswer =
  | { status: 200; body: FileSourceResult }
  | { status: 400 | 403 | 404 | 500; body: { error: string } };

export function readArchitectureSource(filePath: string | null, repoRoot: string): SourceAnswer {
  if (!filePath) return { status: 400, body: { error: 'Missing path parameter' } };
  if (filePath.includes('..') || path.isAbsolute(filePath))
    return { status: 400, body: { error: 'Invalid path: traversal not allowed' } };
  if (FORBIDDEN_FILE_PATTERNS.some((pattern) => pattern.test(filePath)))
    return { status: 403, body: { error: 'Access denied: protected file' } };

  const absolutePath = path.resolve(repoRoot, filePath);
  if (!absolutePath.toLowerCase().startsWith(repoRoot.toLowerCase()))
    return { status: 403, body: { error: 'Access denied: outside workspace' } };
  if (!fs.existsSync(absolutePath))
    return { status: 404, body: { error: `File not found: ${filePath}` } };

  try {
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) return { status: 400, body: { error: 'Target is not a file' } };
    const content = fs.readFileSync(absolutePath, 'utf-8');
    return {
      status: 200,
      body: {
        path: filePath,
        filename: path.basename(filePath),
        loc: content.split('\n').length,
        sizeBytes: stat.size,
        content,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: 500, body: { error: `Failed to read file: ${message}` } };
  }
}

/** Serves the source panel from the dev server only; `apply: 'serve'` keeps it out of every build. */
export function architectureSourcePlugin(): Plugin {
  const repoRoot = findRepoRoot();
  return {
    name: 'gurudevi-architecture-source',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/architecture/source', (request, response) => {
        const url = new URL(request.url ?? '', 'http://localhost');
        const answer = readArchitectureSource(url.searchParams.get('path'), repoRoot);
        response.statusCode = answer.status;
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store');
        response.end(JSON.stringify(answer.body));
      });
    },
  };
}
