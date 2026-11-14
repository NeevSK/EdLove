import fs from 'node:fs';

const targets = [
  'packages/admin/src/screens/AnalyticsDashboardScreen.tsx',
  'packages/form-builder/src/screens/FormBuilderScreen.tsx'
];

for (const file of targets) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';");
  content = content.replace(/<ScreenWrapper[^>]*>/g, '<SafeAreaView className="flex-1 bg-phase-canvas">');
  content = content.replace(/<\/ScreenWrapper>/g, '</SafeAreaView>');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
