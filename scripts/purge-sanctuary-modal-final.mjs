import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function updateFile(relPath, transformFn) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skip non-existent: ${relPath}`);
    return;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = transformFn(original);
  if (original !== updated) {
    const tmp = `${fullPath}.tmp`;
    fs.writeFileSync(tmp, updated, 'utf8');
    const winTmp = tmp.replace(/\//g, '\\');
    const winTarget = fullPath.replace(/\//g, '\\');
    execSync(`cmd.exe /c move /y "${winTmp}" "${winTarget}"`);
    console.log(`Updated: ${relPath}`);
  } else {
    console.log(`Unchanged: ${relPath}`);
  }
}

// 1. PasswordRecoveryBoundary.tsx
updateFile('apps/gurudevi-mobile/src/entry/PasswordRecoveryBoundary.tsx', (content) => {
  return content
    .replace(
      "import SanctuaryModal from '@repo/ui/components/SanctuaryModal';",
      "import { Dialog } from '@repo/ui/components/native';"
    )
    .replace(
      /<SanctuaryModal\s+isOpen=\{recovery\.isOpen\}\s+onClose=\{recovery\.close\}\s+title="Set a new password"\s+subtitle="Your recovery link is verified\. Verify your authenticator and choose a new password\."\s*>/g,
      '<Dialog open={recovery.isOpen} onClose={recovery.close} title="Set a new password" description="Your recovery link is verified. Verify your authenticator and choose a new password.">'
    )
    .replace(/<\/SanctuaryModal>/g, '</Dialog>');
});

// 2. InstitutionalArcCard.tsx
updateFile('packages/admin/src/screens/principal/InstitutionalArcCard.tsx', (content) => {
  return content
    .replace(
      "import SanctuaryModal from '@repo/ui/components/SanctuaryModal';",
      "import { Dialog } from '@repo/ui/components/native';"
    )
    .replace(
      /<SanctuaryModal\s+isOpen=\{isInfoOpen\}\s+onClose=\{\(\) => setIsInfoOpen\(false\)\}\s+title=\{featureInfo\?\.title \|\| title\}\s*>/g,
      '<Dialog open={isInfoOpen} onClose={() => setIsInfoOpen(false)} title={featureInfo?.title || title}>'
    )
    .replace(/<\/SanctuaryModal>/g, '</Dialog>');
});

// 3. SubmissionModal.tsx
updateFile('packages/classroom/src/components/SubmissionModal.tsx', (content) => {
  return content
    .replace(
      "import SanctuaryModal from '@repo/ui/components/SanctuaryModal';",
      "import { Dialog } from '@repo/ui/components/native';"
    )
    .replace(
      /<SanctuaryModal\s+isOpen=\{isOpen\}\s+onClose=\{onClose\}\s+title=\{t\('classroom\.submitWork'\) \|\| 'Submit Work'\}\s+subtitle=\{assignmentTitle\}\s*>/g,
      '<Dialog open={isOpen} onClose={onClose} title={t(\'classroom.submitWork\') || \'Submit Work\'} description={assignmentTitle}>'
    )
    .replace(/<\/SanctuaryModal>/g, '</Dialog>');
});

// 4. SubmissionModal.web.tsx
updateFile('packages/classroom/src/components/SubmissionModal.web.tsx', (content) => {
  let res = content
    .replace("import { BrandPulse } from '@repo/ui/components/BrandPulse';\n", '')
    .replace("import SanctuaryModal from '@repo/ui/components/SanctuaryModal';\n", '')
    .replace(
      /<SanctuaryModal\s+isOpen=\{isOpen\}\s+onClose=\{onClose\}\s+title=\{t\('classroom\.submitWork'\) \|\| 'Submit Work'\}\s+subtitle=\{assignmentTitle\}\s*>/g,
      'isOpen ? (\n    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">\n      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">'
    )
    .replace(
      /<\/SanctuaryModal>/g,
      '      </div>\n    </div>\n  ) : null'
    )
    .replace(
      /<BrandPulse size=\{20\} \/>/g,
      '<span className="inline-block animate-pulse w-4 h-4 rounded-full bg-current" />'
    );
  return res;
});

// 5. ExternalLinkContext.tsx
updateFile('packages/ui/src/context/ExternalLinkContext.tsx', (content) => {
  return content
    .replace(
      "import SanctuaryModal from '@repo/ui/components/SanctuaryModal';",
      "import { Dialog } from '@repo/ui/components/native';"
    )
    .replace(
      /<SanctuaryModal\s+isOpen=\{Boolean\(currentRequest\)\}\s+onClose=\{\(\) => handleResolve\(false\)\}\s+title="External Resource Access"\s*>/g,
      '<Dialog open={Boolean(currentRequest)} onClose={() => handleResolve(false)} title="External Resource Access">'
    )
    .replace(/<\/SanctuaryModal>/g, '</Dialog>');
});
