import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const files = [
  'packages/library/src/screens/CloudExportScreen.tsx',
  'packages/library/src/screens/OCRScreen.tsx',
  'packages/library/src/screens/PDFEditorScreen.tsx',
  'packages/library/src/screens/ReaderScreen.tsx',
  'packages/library/src/screens/SpreadsheetViewer.tsx',
];

for (const rel of files) {
  const p = path.resolve(rel);
  let c = fs.readFileSync(p, 'utf8');

  // Replace import
  c = c.replace(/import\s*\{\s*BrandPulse\s*\}\s*from\s*['"]@repo\/ui\/components\/BrandPulse['"];?/, "import { WaitingSign } from '@repo/ui/components/native';");

  // Replace JSX usages
  c = c.replace(/<BrandPulse\s+size=\{([0-9]+)\}\s*\/>/g, '<WaitingSign size={$1} />');
  c = c.replace(/<BrandPulse\s+size=\{([0-9]+)\}\s+tintColor=['"][^'"]+['"]\s*\/>/g, '<WaitingSign size={$1} />');

  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, c, 'utf8');
  execSync(`cmd.exe /c move /y "${tmp}" "${p}"`);
  console.log('Updated:', rel);
}
