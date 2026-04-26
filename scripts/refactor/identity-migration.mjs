/**
 * GuruDevi Identity Migration Codemod
 *
 * Automatically migrates legacy Supabase Auth usage to identityAPI.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const include = args[args.indexOf('--include') + 1] || '.';

const targetDir = path.resolve(process.cwd(), include);

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(rootDir, fullPath);

    if (
      relativePath.includes('node_modules') ||
      relativePath.includes('.git') ||
      relativePath.includes('scripts') ||
      relativePath.includes('packages/core/src/api') // Skip core API implementations
    ) {
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      migrateFile(fullPath);
    }
  }
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  let modified = false;

  // 1. Replace supabase.auth.getUser() patterns (async/await)
  const getUserPatterns = [
    {
      regex:
        /const\s+\{\s*data:\s*\{\s*user\s*\}\s*(?:,\s*error\s*)?\}\s*=\s*await\s+supabase\.auth\.getUser\(\);/g,
      replacement: 'const userId = await identityAPI.getMyInternalId();',
    },
    {
      regex: /const\s+user\s*=\s*\(await\s+supabase\.auth\.getUser\(\)\)\.data\.user;/g,
      replacement: 'const userId = await identityAPI.getMyInternalId();',
    },
  ];

  for (const p of getUserPatterns) {
    if (p.regex.test(content)) {
      content = content.replace(p.regex, p.replacement);
      content = content.replace(/\buser\.id\b/g, 'userId');

      // Phase 2: Handle user_metadata -> users table mappings
      // e.g. user?.user_metadata?.school_id -> user?.school_id
      content = content.replace(/user\??\.user_metadata\??\.(\w+)/g, (match, field) => {
        // If we've replaced 'user' with 'userId' via destructuring, we need to be careful.
        // However, most components still expect a 'user' object from useUserRole/useStore.
        // For direct table checks, we keep it simple.
        return `user?.${field}`;
      });

      modified = true;
    }
  }

  // 2. Replace .then() pattern
  const thenPattern =
    /supabase\.auth\.getUser\(\)\.then\(\(\{\s*data:\s*\{\s*user\s*\}\s*\}\)\s*=>\s*\{/g;
  if (thenPattern.test(content)) {
    content = content.replace(thenPattern, 'identityAPI.getMyInternalId().then((userId) => {');
    content = content.replace(/\buser\.id\b/g, 'userId');
    modified = true;
  }

  // 3. Replace authAPI.getUser() pattern
  const authApiRegex = /await\s+authAPI\.getUser\(\)/g;
  if (authApiRegex.test(content)) {
    content = content.replace(authApiRegex, 'await identityAPI.getMyInternalId()');
    modified = true;
  }

  if (modified) {
    const coreImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@repo\/core['"];/;
    const match = content.match(coreImportRegex);
    if (match) {
      let importsText = match[1];
      if (!importsText.includes('identityAPI')) {
        // Handle the case where there's already an extra comma or weird spacing
        importsText = importsText.replace(/,\s*,/g, ',').trim();
        if (importsText.endsWith(',')) importsText = importsText.slice(0, -1);

        const imports = importsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const newImport = `import { ${imports.join(', ')}, identityAPI } from '@repo/core';`;
        content = content.replace(coreImportRegex, newImport);
      } else {
        // Cleanup potentially messy imports from previous passes
        const cleanedImports = importsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const uniqueImports = [...new Set(cleanedImports)];
        const cleanedImportLine = `import { ${uniqueImports.join(', ')} } from '@repo/core';`;
        content = content.replace(coreImportRegex, cleanedImportLine);
      }
    } else {
      // If it's a file using relative lib imports or needs @repo/core for identityAPI
      if (content.includes('../lib/supabase') && !content.includes('@repo/core')) {
        content = "import { identityAPI } from '@repo/core';\n" + content;
      } else if (!content.includes('identityAPI')) {
        content = "import { identityAPI } from '@repo/core';\n" + content;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Migrated identity usage in ${path.relative(rootDir, filePath)}`);
    }
  }
}

console.log(`🚀 Starting intelligent identity migration (SURGICAL MODE) in ${targetDir}...`);
processDirectory(targetDir);
console.log('✨ Migration pass complete.');
