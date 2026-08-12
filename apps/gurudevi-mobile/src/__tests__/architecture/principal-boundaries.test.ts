import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const PRINCIPAL_VIEWS_DIR = path.join(
  WORKSPACE_ROOT,
  'packages',
  'admin',
  'src',
  'screens',
  'principal',
);
const PRINCIPAL_ROOT_VIEW = path.join(
  WORKSPACE_ROOT,
  'packages',
  'admin',
  'src',
  'screens',
  'PrincipalDashboard.web.tsx',
);
const CLASSROOM_PRINCIPAL_COMPONENTS_DIR = path.join(
  WORKSPACE_ROOT,
  'packages',
  'admin',
  'src',
  'components',
  'principal',
);
const CLASSROOM_PRINCIPAL_SCREEN = path.join(
  WORKSPACE_ROOT,
  'packages',
  'admin',
  'src',
  'screens',
  'PrincipalDashboard.tsx',
);

function collectPrincipalViewFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectPrincipalViewFiles(fullPath));
      continue;
    }
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function getImportStatements(source: string): string[] {
  return source.match(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?/gm) ?? [];
}

function hasDirectSupabaseImport(importLine: string): boolean {
  if (/from\s+['"]@repo\/core\/adapters\/supabaseClient['"]/.test(importLine)) {
    return false;
  }
  return (
    /from\s+['"]@supabase\/supabase-js['"]/.test(importLine) ||
    (/from\s+['"]@repo\/core['"]/.test(importLine) && /\bsupabase\b/.test(importLine)) ||
    /from\s+['"][^'"]*supabase[^'"]*['"]/.test(importLine)
  );
}

describe('Principal view architecture boundaries', () => {
  const filesUnderTest = [
    PRINCIPAL_ROOT_VIEW,
    CLASSROOM_PRINCIPAL_SCREEN,
    ...collectPrincipalViewFiles(PRINCIPAL_VIEWS_DIR),
    ...collectPrincipalViewFiles(CLASSROOM_PRINCIPAL_COMPONENTS_DIR),
  ].filter(fs.existsSync);

  it('tracks at least one principal view file', () => {
    expect(filesUnderTest.length).toBeGreaterThan(0);
  });

  it.each(filesUnderTest)('%s does not import supabase directly', (filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    const imports = getImportStatements(source);
    const violatingImport = imports.find(hasDirectSupabaseImport);
    expect(violatingImport).toBeUndefined();
  });
});
