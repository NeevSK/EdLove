import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function updateFile(relPath, transformFn) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) return;
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = transformFn(original);
  if (original !== updated) {
    const tmp = `${fullPath}.tmp`;
    fs.writeFileSync(tmp, updated, 'utf8');
    const winTmp = tmp.replace(/\//g, '\\');
    const winTarget = fullPath.replace(/\//g, '\\');
    execSync(`cmd.exe /c move /y "${winTmp}" "${winTarget}"`);
    console.log(`Updated: ${relPath}`);
  }
}

// 1. packages/admin/src/screens/DocumentListScreen.web.tsx
updateFile('packages/admin/src/screens/DocumentListScreen.web.tsx', (content) => {
  return content
    .replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';\n", '')
    .replace('<ScreenWrapper scroll={false} style={{ flex: 1, backgroundColor: _theme.glass.surface.bg }}>', '<div className="flex-1 overflow-hidden" style={{ minHeight: "100vh" }}>')
    .replace('</ScreenWrapper>', '</div>');
});

// 2. packages/form-builder/src/screens/FormBuilderScreen.web.tsx
updateFile('packages/form-builder/src/screens/FormBuilderScreen.web.tsx', (content) => {
  return content
    .replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';\n", '')
    .replace('<ScreenWrapper>', '<div className="flex-1 min-h-screen">')
    .replace('</ScreenWrapper>', '</div>');
});

// 3. packages/library/src/screens/PDFViewerScreen.web.tsx
updateFile('packages/library/src/screens/PDFViewerScreen.web.tsx', (content) => {
  return content
    .replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';\n", '')
    .replace(/<ScreenWrapper[^>]*>/, '<div className="flex-1 min-h-screen flex flex-col">')
    .replace('</ScreenWrapper>', '</div>');
});
