import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.turbo', '__tests__', '.git', '.next', 'android', 'ios', '.expo', 'build', '.cache']);

function walk(dir) {
  let files = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          files = files.concat(walk(path.join(dir, entry.name)));
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        if (!entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(path.join(dir, entry.name).replace(/\\/g, '/'));
        }
      }
    }
  } catch (e) {}
  return files;
}

const allCoreFiles = walk(path.join(REPO_ROOT, 'packages/core/src'));
const appFiles = [
  ...walk(path.join(REPO_ROOT, 'apps/gurudevi-web/app')),
  ...walk(path.join(REPO_ROOT, 'apps/gurudevi-web/lib')),
  ...walk(path.join(REPO_ROOT, 'apps/gurudevi-mobile/app')),
  ...walk(path.join(REPO_ROOT, 'apps/gurudevi-mobile/src')),
];

console.log(`Auditing: ${allCoreFiles.length} core files, ${appFiles.length} app files.`);

const importerMap = new Map();

function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /(?:from\s+['"]|import\s+['"])([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const specifier = match[1];
      const baseName = specifier.split('/').pop().replace(/\.(ts|tsx|js|mjs)$/, '');
      if (!importerMap.has(baseName)) importerMap.set(baseName, new Set());
      importerMap.get(baseName).add(filePath);
    }
  } catch (e) {}
}

allCoreFiles.forEach(analyzeImports);
appFiles.forEach(analyzeImports);

const authCandidates = [
  'AuthManager', 'IdentityManager', 'DeviceIdentityManager',
  'auth.factory', 'identity.factory', 'authz.factory',
  'auth.slice', 'useAuthStore', 'scopeSession', 'scopeSessionCoordinator',
  'AuthProvider', 'identityState', 'profileResolution',
  'supabaseAuthStorage', 'authStorage', 'authProfileStorage',
  'localGuestSession', 'guestIdentity', 'guestDataManager',
  'webAuth', 'webAuthorizedEntry', 'auth', 'authenticatedAccountCapture'
];

console.log('\n=== AUTH SUBSYSTEM IN-DEGREE AUDIT ===\n');

authCandidates.forEach(cand => {
  const callers = importerMap.get(cand) || new Set();
  const appCallers = Array.from(callers).filter(c => c.includes('/apps/'));
  const coreCallers = Array.from(callers).filter(c => !c.includes('/apps/'));
  
  const status = appCallers.length > 0 ? '🟢 DIRECT APP USE' : coreCallers.length > 0 ? '🟡 INTERNAL CORE ONLY' : '🔴 0 CALLERS (POTENTIAL DEADWEIGHT)';
  
  console.log(`${status} [${cand}]`);
  console.log(`   Total Callers: ${callers.size} (Apps: ${appCallers.length}, Core: ${coreCallers.length})`);
  if (appCallers.length > 0) {
    console.log(`   Apps: ${appCallers.slice(0, 2).map(p => p.split('/').slice(-2).join('/')).join(', ')}`);
  }
});
