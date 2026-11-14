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

// 1. packages/ui/src/qr/index.ts
updateFile('packages/ui/src/qr/index.ts', (content) => {
  return content.replace(
    "from '@repo/ui/components/QRCodeGenerator';",
    "from './QRCodeGenerator';"
  );
});

// 2. packages/ui/src/qr/QRShareButton.tsx
updateFile('packages/ui/src/qr/QRShareButton.tsx', (content) => {
  return content.replace(
    "import QRCodeGenerator from '@repo/ui/components/QRCodeGenerator';",
    "import QRCodeGenerator from './QRCodeGenerator';"
  );
});

// 3. packages/ui/src/qr/SanctuaryQRCard.tsx
updateFile('packages/ui/src/qr/SanctuaryQRCard.tsx', (content) => {
  return content.replace(
    "import QRCodeGenerator from '@repo/ui/components/QRCodeGenerator';",
    "import QRCodeGenerator from './QRCodeGenerator';"
  );
});

// 4. packages/scanner-kit/src/QRCodeGenerator.tsx
updateFile('packages/scanner-kit/src/QRCodeGenerator.tsx', (content) => {
  return content.replace(
    "from '@repo/ui/components/QRCodeGenerator';",
    "from '@repo/ui/qr';"
  );
});

// 5. packages/scanner-kit/src/index.ts
updateFile('packages/scanner-kit/src/index.ts', (content) => {
  return content.replace(
    /from '@repo\/ui\/components\/QRCodeGenerator';/g,
    "from '@repo/ui/qr';"
  );
});
