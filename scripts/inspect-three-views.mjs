import fs from 'fs';

['packages/self/src/screens/self/GuardianSelfView.tsx',
 'packages/self/src/screens/self/StudentSelfView.tsx',
 'packages/self/src/screens/self/TeacherSelfView.tsx'].forEach(f => {
  console.log('---', f, '---');
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('@repo/ui/primitives') || l.includes('VStack') || l.includes('Box')) {
      console.log((i + 1) + ': ' + l.trim());
    }
  });
});
