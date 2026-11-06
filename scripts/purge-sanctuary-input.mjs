import fs from 'node:fs';

const files = [
  'apps/gurudevi-mobile/src/components/school/StepBasicInfo.tsx',
  'apps/gurudevi-mobile/src/components/school/StepDemographics.tsx',
  'apps/gurudevi-mobile/src/components/school/StepLocation.tsx',
  'packages/admin/src/components/school/StepBasicInfo.tsx',
  'packages/admin/src/components/school/StepDemographics.tsx',
  'packages/admin/src/components/school/StepLocation.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import SanctuaryInput from '@repo/ui/components/SanctuaryInput';", "import { TextField } from '@repo/ui/components/native';");
  content = content.replace(/helperText=/g, 'hint=');
  content = content.replace(/leftIcon=\{[^}]*\}/g, '');
  content = content.replace(/<SanctuaryInput/g, '<TextField');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
