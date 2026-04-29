import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const targetDir = path.join(ROOT, 'packages/admin/src');

function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules') walk(fullPath);
    } else if (/\.tsx?$/.test(file.name)) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Move lucide imports to @repo/ui
  const lucideRegex = /import\s+{([^}]+)}\s+from\s+'lucide-react-native';/g;

  const matches = [...content.matchAll(lucideRegex)];
  if (matches.length > 0) {
    let allIcons = [];
    matches.forEach((m) => {
      const icons = m[1]
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
      allIcons = [...allIcons, ...icons];
      content = content.replace(m[0], ''); // Remove lucide import line
    });

    const uiRegex = /import\s+{([^}]+)}\s+from\s+'@repo\/ui';/;
    const uiMatch = content.match(uiRegex);

    if (uiMatch) {
      const existingUI = uiMatch[1]
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
      const merged = [...new Set([...existingUI, ...allIcons])].sort();
      content = content.replace(
        uiMatch[0],
        `import {\n  ${merged.join(',\n  ')},\n} from '@repo/ui';`,
      );
    } else {
      // Find suitable place for @repo/ui import (after @repo/core if exists)
      const coreRegex = /import\s+{[^}]+}\s+from\s+'@repo\/core';/;
      if (coreRegex.test(content)) {
        content = content.replace(
          coreRegex,
          (m) => `${m}\nimport {\n  ${allIcons.sort().join(',\n  ')},\n} from '@repo/ui';`,
        );
      } else {
        content = `import {\n  ${allIcons.sort().join(',\n  ')},\n} from '@repo/ui';\n${content}`;
      }
    }
    changed = true;
  }

  // 2. Normalize whitespace (remove multiple empty lines caused by removal)
  content = content.replace(/\n{3,}/g, '\n\n');

  if (changed) {
    fs.writeFileSync(filePath, `${content.trim()}\n`, 'utf8');
    console.log(`Healed icons: ${path.relative(ROOT, filePath)}`);
  }
}

walk(targetDir);
