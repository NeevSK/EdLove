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

// MoodLotus.web.tsx
updateFile('packages/self/src/components/MoodLotus.web.tsx', (content) => {
  return content
    .replace("import { BrandPulse } from '@repo/ui/components/BrandPulse';\n", '')
    .replace(
      `<BrandPulse size={18} tintColor="#FFFFFF" accessibilityLabel="Saving mood" />`,
      `<span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-label="Saving mood" />`
    );
});

// TomorrowPrep.web.tsx
updateFile('packages/self/src/components/TomorrowPrep.web.tsx', (content) => {
  return content
    .replace("import { BrandPulse } from '@repo/ui/components/BrandPulse';\n", '')
    .replace(
      /<BrandPulse\s+size=\{18\}\s+tintColor="#FFFFFF"\s+accessibilityLabel="Saving tomorrow prep"\s*\/>/g,
      `<span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-label="Saving tomorrow prep" />`
    );
});
