'use server';

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

export interface FileSourceResult {
  path: string;
  filename: string;
  loc: number;
  sizeBytes: number;
  content: string;
  error?: string;
}

export async function getFileSourceAction(filePath: string): Promise<FileSourceResult> {
  // CRITICAL GATE: Development tool only. Strictly disabled in production.
  if (process.env.NODE_ENV === 'production') {
    return {
      path: filePath || '',
      filename: '',
      loc: 0,
      sizeBytes: 0,
      content: '',
      error: 'Endpoint unavailable in production environment',
    };
  }

  if (!filePath || filePath.includes('..') || path.isAbsolute(filePath)) {
    return {
      path: filePath || '',
      filename: '',
      loc: 0,
      sizeBytes: 0,
      content: '',
      error: 'Invalid file path: directory traversal or absolute path rejected',
    };
  }

  // Security guard: Block sensitive files (env, keys, credentials)
  if (isForbiddenPath(filePath)) {
    return {
      path: filePath,
      filename: '',
      loc: 0,
      sizeBytes: 0,
      content: '',
      error: 'Access denied: protected file',
    };
  }

  const repoRoot = getRepoRoot();
  const absolutePath = path.resolve(repoRoot, filePath);

  if (!absolutePath.toLowerCase().startsWith(repoRoot.toLowerCase())) {
    return {
      path: filePath,
      filename: '',
      loc: 0,
      sizeBytes: 0,
      content: '',
      error: 'Access denied: outside workspace',
    };
  }

  if (!fs.existsSync(absolutePath)) {
    return {
      path: filePath,
      filename: path.basename(filePath),
      loc: 0,
      sizeBytes: 0,
      content: '',
      error: `File not found on substrate: ${filePath}`,
    };
  }

  try {
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      return {
        path: filePath,
        filename: path.basename(filePath),
        loc: 0,
        sizeBytes: 0,
        content: '',
        error: 'Target is a directory, not a file',
      };
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const lines = content.split('\n');

    return {
      path: filePath,
      filename: path.basename(filePath),
      loc: lines.length,
      sizeBytes: stat.size,
      content,
    };
  } catch (err: unknown) {
    return {
      path: filePath,
      filename: path.basename(filePath),
      loc: 0,
      sizeBytes: 0,
      content: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
