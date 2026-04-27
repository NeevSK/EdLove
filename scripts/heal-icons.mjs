import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const targetPath = path.join(ROOT, 'packages/community/src');

function walk(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        walk(fullPath, callback);
      }
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

let fixedCount = 0;

walk(targetPath, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace lucide-react-native with @repo/ui/icons
  if (content.includes('lucide-react-native')) {
    content = content.replace(/from\s+['"]lucide-react-native['"]/g, "from '@repo/ui/icons'");
    changed = true;
  }

  // Replace direct react-native primitives in components/screens
  // Note: Only for View, Text, Pressable, ScrollView, etc.
  // Actually, let's keep it simple and just do icons first.

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed icons in: ${path.relative(ROOT, filePath)}`);
    fixedCount++;
  }
});

console.log(`\nIcon Healing complete. Fixed ${fixedCount} files.`);
