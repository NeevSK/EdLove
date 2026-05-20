import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

// --- Explicit Legit/Approved Infrastructure Exceptions ---
const SUPABASE_EXEMPTIONS = new Set([
  // Real-time voice/echo channel broadcasts (ephemeral layer)
  'packages/classroom/src/components/ClassroomEchoSection.tsx',
  'packages/classroom/src/logic/reportGenerator.ts',
  // Community live chat / real-time presence feeds
  'packages/community/src/components/HeaderMoreMenu.tsx',
  'packages/community/src/screens/BaseChatScreen.tsx',
  'packages/community/src/screens/DirectMessageScreen.tsx',
  'packages/community/src/screens/DirectMessageScreen.web.tsx',
  'packages/community/src/screens/GroupChatScreen.tsx',
  'packages/community/src/screens/GroupChatScreen.web.tsx',
  'packages/community/src/screens/GroupDetailsScreen.tsx',
  'packages/community/src/screens/InvitationWelcomeScreen.tsx',
  'packages/community/src/screens/UserPublicProfileScreen.tsx',
  'packages/community/src/screens/UserPublicProfileScreen.web.tsx',
  'packages/community/src/hooks/useSocialShield.ts',
  // Live Map Presence
  'packages/library/src/hooks/useMapPresence.ts',
  'packages/library/src/hooks/useMappingSync.ts',

  // ==========================================
  // 🚀 BACKLOG: Legacy Refactoring Targets
  // (Direct Supabase query leaks to be extracted into hooks/repositories)
  // ==========================================
  'packages/admin/src/components/principal/CurriculumPulse.tsx',
  'packages/admin/src/components/principal/DashboardEcho.tsx',
  'packages/admin/src/components/principal/PrincipalObservationsSection.tsx',
  'packages/admin/src/hooks/useStaffPresence.ts',
  'packages/ai/src/hooks/useAIAgent.ts',
  'packages/form-builder/src/screens/ClimateSensingScreen.web.tsx',
  'packages/library/src/screens/CuratorReviewScreen.tsx',
  'packages/people/src/hooks/useStaffPresence.ts',
]);

// --- Explicit Coupling Bridges (Legacy/Structural bridges allowed between admin/classroom domains) ---
const COUPLING_EXEMPTIONS = new Set([
  'packages/classroom/src/components/GlobalCreateModal.tsx',
  'packages/classroom/src/components/GlobalCreateModal.web.tsx',
  'packages/classroom/src/screens/FounderDashboard.tsx',
  'packages/classroom/src/screens/FounderSchoolDashboard.tsx',
  'packages/classroom/src/hooks/useEcosystemStats.ts',
  'packages/classroom/src/hooks/usePrincipalObservations.ts',
  'packages/classroom/src/hooks/useSchoolInvites.ts',
  'packages/classroom/src/screens/AttendanceReportScreen.tsx',
  'packages/classroom/src/screens/principal/DashboardContent.tsx',
  'packages/classroom/src/screens/principal/types.ts',
  'packages/classroom/src/screens/PrincipalDashboard.tsx',
  'packages/classroom/src/screens/PrincipalDashboard.web.tsx',
  'packages/classroom/src/workspace/usePrincipalWorkspaceSurfaces.tsx',
  'packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx',
]);

const violations = [];
let checkedFilesCount = 0;

function normalize(filePath) {
  return path.relative(repoRoot, filePath).replaceAll('\\', '/');
}

/**
 * Dynamically scans any domain package for architectural rule violations
 */
function scanPackageBoundaries(pkgName) {
  const srcPath = path.join(repoRoot, 'packages', pkgName, 'src');
  if (!fs.existsSync(srcPath)) return;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;

      checkedFilesCount += 1;
      const source = fs.readFileSync(fullPath, 'utf8');
      const relativePath = normalize(fullPath);

      // 1. Deep package import check (Banish importing from another package's /src directory)
      const deepImportPattern = /(packages\/[a-z0-9-_]+\/src|@[a-z0-9-_]+\/[a-z0-9-_]+\/src)/i;
      if (deepImportPattern.test(source)) {
        const matches = source.match(deepImportPattern);
        if (matches) {
          const importPath = matches[0];
          if (!importPath.includes(`packages/${pkgName}/src`) && !importPath.includes(`@repo/${pkgName}/src`)) {
            violations.push({
              file: relativePath,
              rule: 'No Deep Internal Imports',
              reason: `Cross-package deep import: "${importPath}" found in [${pkgName}]. You must import from the public entry point instead.`
            });
          }
        }
      }

      // 2. Direct Supabase client call check in Presentation/Logic layers
      const hasDirectSupabase = /\bsupabase\s*\.\s*(from|channel|storage)\b/m.test(source);
      if (hasDirectSupabase) {
        const isApiOrRepoFile = 
          /\/api\//.test(relativePath) || 
          /Repository\.(ts|tsx)$/.test(relativePath) ||
          ((pkgName === 'admin' || pkgName === 'people') && !relativePath.endsWith('.tsx') && !relativePath.includes('/components/') && !relativePath.includes('/hooks/'));

        const isExempt = SUPABASE_EXEMPTIONS.has(relativePath);

        if (!isApiOrRepoFile && !isExempt) {
          violations.push({
            file: relativePath,
            rule: 'No Direct Supabase in UI/Hooks',
            reason: `Direct Supabase client usage outside the approved api/repository boundary. Move direct database queries to custom hooks or repository adapters to preserve offline-first integrity.`
          });
        }
      }

      // 3. Domain coupling checks for Classroom package
      if (pkgName === 'classroom') {
        const hasCoupling = /@repo\/(admin|workforce)\b/.test(source);
        if (hasCoupling && !COUPLING_EXEMPTIONS.has(relativePath)) {
          violations.push({
            file: relativePath,
            rule: 'Classroom coupling restriction',
            reason: 'New classroom -> admin/workforce coupling outside the approved bridge lists. Move ownership or route through public bridges.'
          });
        }
      }
    }
  }

  walk(srcPath);
}

console.log('\n>>> Starting Monorepo Dynamic Architecture Boundary Audit <<<\n');

const packagesDir = path.join(repoRoot, 'packages');
const allPackages = fs.readdirSync(packagesDir).filter(f => fs.statSync(path.join(packagesDir, f)).isDirectory());

for (const pkg of allPackages) {
  if (pkg === 'core' || pkg === 'scripts' || pkg === 'eslint-config' || pkg === 'typescript-config' || pkg === 'platform-mcp') continue;
  console.log(`Auditing boundary rules for package: [${pkg}]...`);
  scanPackageBoundaries(pkg);
}

console.log(`\nScan completed. Checked ${checkedFilesCount} source files across all active domain packages.`);

if (violations.length > 0) {
  console.error(`\n❌ Found ${violations.length} boundary violations:\n`);
  console.error(JSON.stringify(violations, null, 2));
  process.exit(1);
} else {
  console.log('\n✅ Excellent! All package boundaries are 100% clean and compliant!');
  process.exit(0);
}
