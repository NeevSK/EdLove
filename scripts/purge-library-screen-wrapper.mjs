import fs from 'node:fs';

const files = [
  'packages/library/src/screens/CloudExportScreen.tsx',
  'packages/library/src/screens/ImageToPDFScreen.tsx',
  'packages/library/src/screens/OCRScreen.tsx',
  'packages/library/src/screens/PDFEditorScreen.tsx',
  'packages/library/src/screens/SpreadsheetViewer.tsx',
  'packages/library/src/screens/ToolsHubScreen.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';\nimport { ScrollView } from 'react-native';");
  content = content.replace(/<ScreenWrapper>/g, '<SafeAreaView className="flex-1 bg-phase-canvas"><ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>');
  content = content.replace(/<\/ScreenWrapper>/g, '</ScrollView></SafeAreaView>');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
