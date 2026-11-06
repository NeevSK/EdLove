import fs from 'node:fs';

let c = fs.readFileSync('packages/self/src/screens/SelfScreen.unified.tsx', 'utf8');
c = c.replace("import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';\nimport { ScrollView } from 'react-native';");
c = c.replace(/<ScreenWrapper[^>]*>/g, '<SafeAreaView className="flex-1 bg-phase-canvas"><ScrollView className="flex-1">');
c = c.replace(/<\/ScreenWrapper>/g, '</ScrollView></SafeAreaView>');
fs.writeFileSync('packages/self/src/screens/SelfScreen.unified.tsx', c);
console.log('SelfScreen.unified.tsx done');
