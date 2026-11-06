import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const files = [
  'packages/self/src/screens/self/AdminSelfView.tsx',
  'packages/self/src/screens/self/FounderSelfView.tsx',
  'packages/self/src/screens/self/PrincipalSelfView.tsx'
];

for (const rel of files) {
  const p = path.resolve(rel);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/import\s*\{\s*Box,\s*VStack\s*\}\s*from\s*['"]@repo\/ui\/primitives['"];?/, "import { View } from 'react-native';");
  content = content.replace(/<Box/g, '<View').replace(/<\/Box>/g, '</View>');
  content = content.replace(/<VStack\s+space=['"]lg['"]\s+style=\{\{\s*padding:\s*20\s*\}\}>/g, '<View style={{ padding: 20, gap: 16 }}>');
  content = content.replace(/<\/VStack>/g, '</View>');

  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, content, 'utf8');
  execSync(`cmd /c "move /y "${tmp}" "${p}""`);
  console.log('Successfully updated:', rel);
}
