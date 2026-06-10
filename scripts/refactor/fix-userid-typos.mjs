import fs from 'node:fs';
import path from 'node:path';

const searchDirs = [
  'packages/core/src',
  'packages/community/src',
  'packages/classroom/src',
  'packages/library/src',
  'packages/self/src',
  'packages/scanner-kit/src',
  'apps/gurudevi-mobile/src',
];

let fixCount = 0;

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // We look for patterns where identityAPI.getMyInternalId() is called and assigned to userId
  // followed shortly by a check for !user

  const lines = content.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    if (currentLine.includes('identityAPI.getMyInternalId()') && currentLine.includes('userId')) {
      if (nextLine.includes('if (!user)')) {
        lines[i + 1] = nextLine.replace('if (!user)', 'if (!userId)');
        hasChanges = true;
        fixCount++;
        console.log(`✅ Fixed typo in ${filePath}:${i + 2}`);
      }
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, lines.join('\n'));
  }
}

console.log('🔍 Scanning codebase for !user typos after identityAPI calls...');

for (const dir of searchDirs) {
  processDirectory(path.join(process.cwd(), dir));
}

console.log(`\n🎉 Complete! Fixed ${fixCount} occurrences.`);
