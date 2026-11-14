import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function updateFile(rel, replacer) {
  const p = path.resolve(rel);
  let c = fs.readFileSync(p, 'utf8');
  c = replacer(c);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, c, 'utf8');
  execSync(`cmd /c "move /y "${tmp}" "${p}""`);
  console.log('Updated:', rel);
}

// 1. GuardianSelfView.tsx
updateFile('packages/self/src/screens/self/GuardianSelfView.tsx', (c) => {
  c = c.replace("import { VStack } from '@repo/ui/primitives';", "import { View } from 'react-native';");
  c = c.replace('<VStack space="lg" style={{ padding: 20 }}>', '<View style={{ padding: 20, gap: 16 }}>');
  c = c.replace('<VStack space="lg">', '<View style={{ gap: 16 }}>');
  c = c.replace(/<\/VStack>/g, '</View>');
  return c;
});

// 2. StudentSelfView.tsx
updateFile('packages/self/src/screens/self/StudentSelfView.tsx', (c) => {
  c = c.replace("import { VStack } from '@repo/ui/primitives';", "import { View } from 'react-native';");
  c = c.replace('<VStack space="lg" style={{ padding: 20 }}>', '<View style={{ padding: 20, gap: 16 }}>');
  c = c.replace(/<\/VStack>/g, '</View>');
  return c;
});

// 3. TeacherSelfView.tsx
updateFile('packages/self/src/screens/self/TeacherSelfView.tsx', (c) => {
  c = c.replace("import { Box, VStack } from '@repo/ui/primitives';", "import { View } from 'react-native';");
  c = c.replace('<VStack space="lg" style={{ padding: 20 }}>', '<View style={{ padding: 20, gap: 16 }}>');
  c = c.replace('<VStack space="lg">', '<View style={{ gap: 16 }}>');
  c = c.replace(/<\/VStack>/g, '</View>');
  c = c.replace('<Box', '<View');
  c = c.replace('</Box>', '</View>');
  return c;
});
