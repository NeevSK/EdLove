import fs from 'fs';
import path from 'path';

function findFiles(dir, exts) {
  let res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'dist' && entry.name !== '.turbo' && entry.name !== '.git') {
        res.push(...findFiles(full, exts));
      }
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      res.push(full);
    }
  }
  return res;
}

const files = findFiles('.', ['.ts', '.tsx']).filter(f => !f.includes('.web.tsx') && !f.includes('.web.ts') && !f.includes('packages' + path.sep + 'ui'));
const legacyPattern = /from\s+['"]@repo\/ui\/primitives['"]/;

const candidates = [];
const complexCandidates = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@repo\/ui\/primitives['"]/);
  if (!match) continue;

  const primitives = match[1].split(',').map(s => s.trim()).filter(Boolean);
  
  // Classify: are all primitives within our basic standard set?
  // Basic set: Box, VStack, HStack, Text, Heading, Pressable, ScrollView, View, Center, Divider
  // Plus Icon (which we know how to replace with lucide-react-native)
  // Plus Button, ButtonText (Pressable + Text)
  // Plus Input, InputField (TextInput)
  const basicSet = new Set(['Box', 'VStack', 'HStack', 'Text', 'Heading', 'Pressable', 'ScrollView', 'View', 'Center', 'Divider', 'Icon', 'Button', 'ButtonText', 'Input', 'InputField']);
  
  const unhandled = primitives.filter(p => !basicSet.has(p));
  if (unhandled.length === 0) {
    candidates.push({ file, primitives });
  } else {
    complexCandidates.push({ file, unhandled, primitives });
  }
}

console.log(`Eligible files for Basic+Button+Input codemod: ${candidates.length}`);
candidates.forEach(c => console.log(`  [OK] ${c.file} -> ${c.primitives.join(', ')}`));

console.log(`\nRemaining complex files: ${complexCandidates.length}`);
complexCandidates.forEach(c => console.log(`  [COMPLEX] ${c.file} -> unhandled: [${c.unhandled.join(', ')}]`));
