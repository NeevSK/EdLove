import fs from 'node:fs';

const files = [
  'packages/classroom/src/components/grading/GradebookTable.tsx',
  'packages/community/src/components/CommunityHearth.tsx',
  'packages/form-builder/src/FormBuilder.tsx',
  'packages/library/src/components/CollectionPickerModal.tsx',
  'packages/self/src/components/BaseSelfView.tsx',
  'packages/self/src/components/SelfNavigator.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';", "import { FlashList } from '@shopify/flash-list';");
  content = content.replace("import { SanctuaryFlashList } from '@repo/ui/components/SanctuaryFlashList';", "import { FlashList } from '@shopify/flash-list';");
  content = content.replace(/<SanctuaryFlashList/g, '<FlashList');
  content = content.replace(/<\/SanctuaryFlashList>/g, '</FlashList>');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
