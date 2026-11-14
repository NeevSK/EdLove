import fs from 'node:fs';

const targets = [
  {
    file: 'packages/classroom/src/components/QuickAnalytics.tsx',
    subs: [
      ["import { Card } from '@repo/ui/components/SanctuaryCard';", "import { Surface } from '@repo/ui/components/native';"],
      ['<Card className="p-6 bg-phase-surface-secondary rounded-[32px] border border-phase-border shadow-sm">', '<Surface tone="raised" className="p-6 rounded-[32px]">'],
      ['</Card>', '</Surface>']
    ]
  },
  {
    file: 'packages/community/src/components/GroupCard.tsx',
    subs: [
      ["import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';", "import { Surface } from '@repo/ui/components/native';\nimport { Pressable } from 'react-native';"],
      ['<SanctuaryCard\n      onPress={onPress}\n      className="mb-3 rounded-3xl bg-phase-surface border border-border shadow-sm p-4 overflow-hidden"\n    >', '<Pressable onPress={onPress} className="mb-3 active:opacity-90"><Surface tone="raised" className="rounded-3xl p-4 overflow-hidden">'],
      ['</SanctuaryCard>', '</Surface></Pressable>']
    ]
  },
  {
    file: 'packages/community/src/components/ManifestoCard.tsx',
    subs: [
      ["import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';", "import { Surface } from '@repo/ui/components/native';"],
      ['<SanctuaryCard onPress={onPress} elevated={has_endorsed} className="bg-surface-lowest">', '<Pressable onPress={onPress} className="active:opacity-90"><Surface tone="raised" className="p-4 rounded-2xl">'],
      ['</SanctuaryCard>', '</Surface></Pressable>']
    ]
  },
  {
    file: 'packages/library/src/components/ResourceRow.tsx',
    subs: [
      ["import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';", "import { Surface } from '@repo/ui/components/native';\nimport { Pressable } from 'react-native';"],
      ['<SanctuaryCard onPress={onOpen}>', '<Pressable onPress={onOpen} className="active:opacity-90"><Surface tone="raised" flush className="rounded-2xl">'],
      ['</SanctuaryCard>', '</Surface></Pressable>']
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
