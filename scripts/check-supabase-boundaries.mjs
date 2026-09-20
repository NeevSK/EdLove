import fs from 'node:fs';
import path from 'node:path';

/**
 * Architectural Boundary Linter for Supabase Decoupling (Hexagonal Architecture).
 *
 * Rules enforced:
 * 1. `@supabase/supabase-js` or `@supabase/postgrest-js` must NEVER be imported outside of:
 *    - `packages/core/src/adapters/**`
 *    - `packages/core/src/logic/domains/factory.ts` (Composition root for service role / RLS clients)
 *    - `packages/core/src/webAuth.ts` (Browser runtime adapter)
 *    - Tests specifically testing adapters or runtime boundaries
 * 2. `@supabase/*` must NOT be imported in UI packages (`@repo/ui`, `@repo/self`, `@repo/library`, `@repo/profile`, etc.)
 * 3. State slices (`src/store/slices/**`), hooks (`src/hooks/**`), and providers (`src/providers/**`)
 *    must NEVER import directly from `@supabase/supabase-js` or `supabaseClient.ts`.
 */

const ALLOWED_SUPABASE_PATTERNS = [
  /packages[\\/]core[\\/]src[\\/]adapters[\\/]/,
  /packages[\\/]core[\\/]src[\\/]logic[\\/]domains[\\/]factory\.ts$/,
  /packages[\\/]core[\\/]src[\\/]webAuth\.ts$/,
  /packages[\\/]core[\\/]src[\\/]webAuth\.test\.ts$/,
  /packages[\\/]core[\\/]src[\\/]adapters[\\/].*\.test\.ts$/,
];

const BANNED_IMPORT_REGEX =
  /from\s+['"]@supabase\/(supabase-js|postgrest-js)['"]|require\(['"]@supabase\/(supabase-js|postgrest-js)['"]\)/;

const BANNED_SUPABASE_CLIENT_IN_STORE_OR_HOOKS =
  /from\s+['"].*adapters\/supabaseClient['"]|from\s+['"]@repo\/core\/adapters\/supabaseClient['"]/;

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');

let violationsCount = 0;

function checkFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check 1: Direct @supabase/supabase-js or @supabase/postgrest-js import
  if (BANNED_IMPORT_REGEX.test(content)) {
    const isAllowed = ALLOWED_SUPABASE_PATTERNS.some((pattern) => pattern.test(relativePath));
    if (!isAllowed) {
      console.error(
        `❌ [Boundary Violation] Direct @supabase import forbidden outside adapter boundaries: ${relativePath}`,
      );
      violationsCount++;
    }
  }

  // Check 2: Direct supabaseClient import in store slices, hooks, or providers
  if (
    /packages[\\/]core[\\/]src[\\/](store|hooks|providers)[\\/]/.test(relativePath) &&
    !filePath.includes('__tests__')
  ) {
    if (BANNED_SUPABASE_CLIENT_IN_STORE_OR_HOOKS.test(content)) {
      console.error(
        `❌ [Boundary Violation] Direct supabaseClient import forbidden in store/hooks/providers: ${relativePath}`,
      );
      violationsCount++;
    }
  }
}

function traverseDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.turbo') {
        traverseDirectory(fullPath);
      }
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Checking Supabase Architectural Boundaries across packages...');
traverseDirectory(PACKAGES_DIR);

if (violationsCount > 0) {
  console.error(`\n💥 Found ${violationsCount} architectural boundary violation(s)!`);
  process.exit(1);
} else {
  console.log('✅ All packages adhere strictly to Hexagonal Ports & Adapters boundaries.');
  process.exit(0);
}
