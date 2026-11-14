import fs from 'node:fs';

const targets = [
  {
    file: 'packages/community/src/screens/BaseChatScreen.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper scroll={false} noTopInset className="bg-phase-canvas">', '<SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
    ]
  },
  {
    file: 'packages/community/src/screens/InviteCodeEntry.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">', '<SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
    ]
  },
  {
    file: 'packages/classroom/src/components/ClassroomAccessState.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper scroll={false} noTopInset={true}>', '<SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
    ]
  },
  {
    file: 'apps/gurudevi-mobile/src/screens/AccountRecoveryScreen.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';\nimport { ScrollView } from 'react-native';"],
      ['<ScreenWrapper title="Account status" scroll>', '<SafeAreaView className="flex-1 bg-phase-canvas"><ScrollView className="flex-1">'],
      ['</ScreenWrapper>', '</ScrollView></SafeAreaView>']
    ]
  }
];

for (const t of targets) {
  let content = fs.readFileSync(t.file, 'utf8');
  for (const [find, replace] of t.subs) {
    content = content.replace(find, replace);
  }
  fs.writeFileSync(t.file, content, 'utf8');
  console.log(`Updated ${t.file}`);
}
