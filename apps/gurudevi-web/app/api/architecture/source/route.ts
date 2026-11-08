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

// The explorer shows source code. Anything else stays unreadable, whatever the denylist misses.
const ALLOWED_SOURCE = /^(apps|packages)\/[^?#]+\.(tsx?|jsx?|mjs|cjs|css|md)$/;
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'sanctuary.localhost']);

function isLoopback(request: NextRequest): boolean {
  const host = (request.headers.get('host') ?? request.nextUrl.host).replace(/:\d+$/, '').toLowerCase();
  // Checked on the Host header, so a rebound DNS name pointing at this machine is refused.
  return Boolean(host && LOOPBACK_HOSTS.has(host));
}

export async function GET(request: NextRequest) {
  // CRITICAL GATE: Development tool only. Strictly disabled in production.
  if (process.env.NODE_ENV === 'production' || !isLoopback(request)) {
    return NextResponse.json({ error: 'Endpoint unavailable' }, { status: 404 });
  }

  const filePath = request.nextUrl.searchParams.get('path')?.replace(/\\/g, '/');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  // Prevent directory traversal
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    return NextResponse.json({ error: 'Invalid path: traversal not allowed' }, { status: 400 });
  }

  // Security guard: Block sensitive files (env, keys, credentials)
  if (isForbiddenPath(filePath) || !ALLOWED_SOURCE.test(filePath)) {
    return NextResponse.json({ error: 'Access denied: protected file' }, { status: 403 });
  }

  const repoRoot = fs.realpathSync(getRepoRoot());
  const candidate = path.resolve(repoRoot, filePath);
  if (!fs.existsSync(candidate)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    // Resolve links first, then require the real file to sit inside the repository.
    const absolutePath = fs.realpathSync(candidate);
    if (!absolutePath.toLowerCase().startsWith(repoRoot.toLowerCase() + path.sep)) {
      return NextResponse.json({ error: 'Access denied: outside workspace' }, { status: 403 });
    }
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
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
