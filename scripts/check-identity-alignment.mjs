/**
 * GuruDevi Identity Alignment Checker
 *
 * This script scans the codebase for direct usage of Supabase Auth IDs
 * and recommends migration to the new Sovereign Identity Architecture (identityAPI).
 *
 * Usage: node scripts/check-identity-alignment.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const PATTERNS = [
  {
    id: 'DIRECT_SUPABASE_GET_USER',
    regex: /supabase\.auth\.getUser\(\)/g,
    message:
      'Direct usage of supabase.auth.getUser() found. Use identityAPI.getMyInternalId() if you need the application user ID.',
    priority: 'HIGH',
  },
  {
    id: 'DIRECT_SUPABASE_GET_SESSION',
    regex: /supabase\.auth\.getSession\(\)/g,
    message:
      'Direct usage of supabase.auth.getSession() found. Ensure you are not using auth.uid from the session for domain logic.',
    priority: 'MEDIUM',
  },
  {
    id: 'AUTH_UID_IN_CLIENT',
    regex: /['"]auth\.uid\(\)['"]/g,
    message:
      'Possible usage of auth.uid() in client-side query. Use the internal user.id instead, as the JWT hook now injects this.',
    priority: 'HIGH',
  },
  {
    id: 'AUTH_API_GET_USER',
    regex: /authAPI\.getUser\(\)/g,
    message:
      'authAPI.getUser() returns Supabase User. Favor identityAPI.getMyInternalId() for internal ID resolution.',
    priority: 'MEDIUM',
  },
];

const EXCLUDES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'scripts',
  'docs',
  'supabase/migrations',
  'packages/core/src/api/identity.ts', // Exclude the API definition itself
  'packages/core/src/api/auth.ts', // Exclude the low-level auth wrapper
];

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    // Normalize paths for Windows compatibility
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (EXCLUDES.some((exclude) => relativePath.startsWith(exclude) || file === exclude)) {
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');

      PATTERNS.forEach((pattern) => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
          const lines = content.substring(0, match.index).split('\n');
          results.push({
            file: relativePath,
            line: lines.length,
            patternId: pattern.id,
            message: pattern.message,
            priority: pattern.priority,
            snippet: content.split('\n')[lines.length - 1].trim(),
          });
        }
      });
    }
  }
  return results;
}

console.log('🚀 Starting Identity Alignment Audit...');
const startTime = Date.now();
const results = scanDirectory(rootDir);
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(
  `\nScan complete in ${duration}s. Found ${results.length} potential alignment issues.\n`,
);

const grouped = results.reduce((acc, res) => {
  if (!acc[res.file]) acc[res.file] = [];
  acc[res.file].push(res);
  return acc;
}, {});

Object.entries(grouped).forEach(([file, issues]) => {
  console.log(`\nFile: ${file}`);
  issues.forEach((issue) => {
    const color = issue.priority === 'HIGH' ? '\x1b[31m' : '\x1b[33m';
    console.log(`  [${color}${issue.priority}\x1b[0m] Line ${issue.line}: ${issue.message}`);
    console.log(`    \x1b[90m> ${issue.snippet}\x1b[0m`);
  });
});

const hasHighPriority = results.some((r) => r.priority === 'HIGH');

if (hasHighPriority) {
  console.log(
    '\n\x1b[31m⚠️  HIGH priority identity anomalies detected. Please review the findings above and migrate to identityAPI.\x1b[0m',
  );
  process.exit(1);
} else if (results.length > 0) {
  console.log(
    '\n\x1b[33m⚠️  Only MEDIUM priority issues found. Architecture is sovereign, but review recommended.\x1b[0m',
  );
  process.exit(0);
} else {
  console.log('\n\x1b[32m✨ No identity alignment issues found. Architecture is sovereign.\x1b[0m');
  process.exit(0);
}
