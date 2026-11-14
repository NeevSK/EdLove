import fs from 'node:fs';

const files = [
  'packages/self/src/screens/self/AdminSelfView.tsx',
  'packages/self/src/screens/self/FounderSelfView.tsx',
  'packages/self/src/screens/self/GuardianSelfView.tsx',
  'packages/self/src/screens/self/PrincipalSelfView.tsx',
  'packages/self/src/screens/self/StudentSelfView.tsx',
  'packages/self/src/screens/self/TeacherSelfView.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';");
  content = content.replace(/<ScreenWrapper scroll=\{false\} noTopInset=\{true\}>/g, '<SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">');
  content = content.replace(/<\/ScreenWrapper>/g, '</SafeAreaView>');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
