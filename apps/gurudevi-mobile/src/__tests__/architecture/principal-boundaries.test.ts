const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');
const PRINCIPAL_VIEWS_DIR = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'principal',
);
const PRINCIPAL_ROOT_VIEW = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'PrincipalDashboard.web.tsx',
);
const CLASSROOM_PRINCIPAL_COMPONENTS_DIR = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'components',
  'principal',
);
const CLASSROOM_PRINCIPAL_SCREEN = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'PrincipalDashboard.tsx',
);

function collectPrincipalViewFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

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

function getImportStatements(source) {
  return source.match(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?/gm) ?? [];
}

function hasDirectSupabaseImport(importLine) {
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
  ];

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
