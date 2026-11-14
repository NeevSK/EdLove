import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const targets = [
  'packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx',
  'packages/admin/src/screens/principal/HierarchyDashboard.tsx',
  'packages/people/src/components/TeacherEchoHistoryModal.tsx',
  'packages/profile/src/components/ProfileSkeleton.tsx',
  'packages/self/src/components/AcademicHistoryTimeline.tsx',
  'packages/self/src/components/ClassroomLegacyTimeline.tsx',
  'packages/self/src/components/DailyRhythm.tsx',
  'packages/self/src/components/EnergyForecast.tsx',
  'packages/self/src/components/FireJournal.tsx',
  'packages/self/src/components/GovernanceHistoryTimeline.tsx',
  'packages/self/src/components/MyGradesView.tsx',
  'packages/self/src/components/PulseDashboard.tsx',
  'packages/self/src/components/StudentGoals.tsx'
];

for (const rel of targets) {
  const full = path.resolve(rel);
  if (!fs.existsSync(full)) continue;
  let code = fs.readFileSync(full, 'utf8');

  // Replace import from @repo/ui/components/SkeletonLoader
  if (code.includes('@repo/ui/components/SkeletonLoader')) {
    if (code.includes('@repo/ui/components/native')) {
      // Add WorldSkeleton to existing native import
      code = code.replace(
        /import \{([^}]+)\} from '@repo\/ui\/components\/native';/,
        (m, g1) => `import {${g1}, WorldSkeleton } from '@repo/ui/components/native';`
      );
      code = code.replace(/import\s*\{?[^;]*\}?\s*from\s*['"]@repo\/ui\/components\/SkeletonLoader['"];?\n?/, '');
    } else {
      code = code.replace(
        /import\s*\{?[^;]*\}?\s*from\s*['"]@repo\/ui\/components\/SkeletonLoader['"];?/,
        "import { WorldSkeleton } from '@repo/ui/components/native';"
      );
    }

    // Replace JSX SkeletonLoader / SkeletonCard
    code = code.replace(/<SkeletonCard\s+height=\{([0-9]+)\}\s*\/>/g, '<WorldSkeleton height={$1} />');
    code = code.replace(/<SkeletonCard\s*\/>/g, '<WorldSkeleton height={150} />');
    code = code.replace(/<SkeletonLoader\s+height=\{([0-9]+)\}\s*\/>/g, '<WorldSkeleton height={$1} />');
    code = code.replace(/<SkeletonLoader\s+width=\{([^}]+)\}\s+height=\{([^}]+)\}\s*\/>/g, '<WorldSkeleton width={$1} height={$2} />');
    code = code.replace(/<SkeletonLoader\s*\/>/g, '<WorldSkeleton height={20} />');

    const tmp = `${full}.tmp`;
    fs.writeFileSync(tmp, code, 'utf8');
    const winTmp = tmp.replace(/\//g, '\\');
    const winTarget = full.replace(/\//g, '\\');
    execSync(`cmd.exe /c move /y "${winTmp}" "${winTarget}"`);
    console.log(`Updated native target: ${rel}`);
  }
}

// Web targets:
// 1. packages/admin/src/screens/SchoolProfileScreen.web.tsx
// 2. packages/self/src/components/EnergyForecast.web.tsx
// 3. packages/self/src/components/MyGradesView.web.tsx

const webTargets = [
  'packages/admin/src/screens/SchoolProfileScreen.web.tsx',
  'packages/self/src/components/EnergyForecast.web.tsx',
  'packages/self/src/components/MyGradesView.web.tsx'
];

for (const rel of webTargets) {
  const full = path.resolve(rel);
  if (!fs.existsSync(full)) continue;
  let code = fs.readFileSync(full, 'utf8');
  if (code.includes('@repo/ui/components/SkeletonLoader')) {
    code = code.replace(/import\s*\{?[^;]*\}?\s*from\s*['"]@repo\/ui\/components\/SkeletonLoader['"];?\n?/, '');
    code = code.replace(/<SkeletonCard\s*\/>/g, '<div className="animate-pulse bg-black/10 dark:bg-white/10 rounded-2xl h-[150px] w-full" />');
    code = code.replace(/<SkeletonLoader\s+height=\{([0-9]+)\}\s*\/>/g, '<div className="animate-pulse bg-black/10 dark:bg-white/10 rounded-xl h-[$1px] w-full" />');
    code = code.replace(/<SkeletonLoader\s*\/>/g, '<div className="animate-pulse bg-black/10 dark:bg-white/10 rounded-xl h-5 w-full" />');
    
    const tmp = `${full}.tmp`;
    fs.writeFileSync(tmp, code, 'utf8');
    const winTmp = tmp.replace(/\//g, '\\');
    const winTarget = full.replace(/\//g, '\\');
    execSync(`cmd.exe /c move /y "${winTmp}" "${winTarget}"`);
    console.log(`Updated web target: ${rel}`);
  }
}
