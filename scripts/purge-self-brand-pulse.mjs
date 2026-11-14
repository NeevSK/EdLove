import fs from 'node:fs';

const targets = [
  {
    file: 'packages/self/src/components/SelfFeatureRenderer.tsx',
    subs: [
      ["import { BrandPulse } from '@repo/ui/components/BrandPulse';", "import { WaitingSign } from '@repo/ui/components/native';"],
      ['<BrandPulse size={20} />', '<WaitingSign size="sm" />']
    ]
  },
  {
    file: 'packages/self/src/components/SelfNavigator.tsx',
    subs: [
      ["import { BrandPulse } from '@repo/ui/components/BrandPulse';", "import { WaitingSign } from '@repo/ui/components/native';"],
      [/<BrandPulse[^>]*\/>/g, '<WaitingSign size="sm" />']
    ]
  },
  {
    file: 'packages/self/src/screens/SelfScreen.unified.tsx',
    subs: [
      ["import { BrandPulse } from '@repo/ui/components/BrandPulse';", "import { WaitingSign } from '@repo/ui/components/native';"],
      [/<BrandPulse[^>]*\/>/g, '<WaitingSign size="lg" />']
    ]
  },
  {
    file: 'packages/self/src/views/sections.tsx',
    subs: [
      ["import { BrandPulse } from '@repo/ui/components/BrandPulse';", "import { WaitingSign } from '@repo/ui/components/native';"],
      [/<BrandPulse[^>]*\/>/g, '<WaitingSign size="md" />']
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
