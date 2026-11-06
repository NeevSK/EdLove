import fs from 'node:fs';

const targets = [
  {
    file: 'packages/admin/src/screens/AdminRoomShell.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper scroll={false} noTopInset>', '<SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
    ]
  },
  {
    file: 'packages/admin/src/screens/GradeHeadDashboard.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper scroll={false}>', '<SafeAreaView className="flex-1 bg-phase-canvas">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
    ]
  },
  {
    file: 'packages/admin/src/screens/SectionHeadDashboard.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper scroll={false}>', '<SafeAreaView className="flex-1 bg-phase-canvas">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
    ]
  },
  {
    file: 'packages/admin/src/screens/guardian/GuardianRoomShell.tsx',
    subs: [
      ["import ScreenWrapper from '@repo/ui/components/ScreenWrapper';", "import { SafeAreaView } from 'react-native-safe-area-context';"],
      ['<ScreenWrapper scroll={false} noTopInset>', '<SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-silk">'],
      ['</ScreenWrapper>', '</SafeAreaView>']
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
