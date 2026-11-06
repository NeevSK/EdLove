import { type NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

function getRepoRoot(): string {
  let cur = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(cur, 'pnpm-workspace.yaml'))) {
      return cur;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return process.cwd();
}

/**
 * Patterns of sensitive files that must NEVER be readable through the architecture explorer,
 * even in local development mode.
 */
const FORBIDDEN_FILE_PATTERNS = [
  /^\.env/i,
  /\/\.env/i,
  /\\\.env/i,
  /\.gitleaks/i,
  /\.git[\/\\]/i,
  /\.(pem|key|cert|crt|pfx|p12)$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /credentials/i,
  /secret/i,
];

function isForbiddenPath(filePath: string): boolean {
  return FORBIDDEN_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

export async function GET(request: NextRequest) {
  // CRITICAL GATE: Development tool only. Strictly disabled in production.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint unavailable' }, { status: 404 });
  }

  const filePath = request.nextUrl.searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  // Prevent directory traversal
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    return NextResponse.json({ error: 'Invalid path: traversal not allowed' }, { status: 400 });
  }

  // Security guard: Block sensitive files (env, keys, credentials)
  if (isForbiddenPath(filePath)) {
    return NextResponse.json({ error: 'Access denied: protected file' }, { status: 403 });
  }

  const repoRoot = getRepoRoot();
  const absolutePath = path.resolve(repoRoot, filePath);

  // Security guard: Ensure path remains inside repository root
  if (!absolutePath.toLowerCase().startsWith(repoRoot.toLowerCase())) {
    return NextResponse.json({ error: 'Access denied: outside workspace' }, { status: 403 });
  }

  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: `File not found: ${filePath}` }, { status: 404 });
  }

  try {
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'Target is not a file' }, { status: 400 });
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const lines = content.split('\n');

    return NextResponse.json({
      path: filePath,
      filename: path.basename(filePath),
      loc: lines.length,
      sizeBytes: stat.size,
      content,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to read file: ${message}` }, { status: 500 });
  }
}
