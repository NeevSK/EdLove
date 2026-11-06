import fs from 'node:fs';

const files = [
  'packages/analytics/src/components/GPAInsights.js',
  'packages/analytics/src/components/GPAInsights.tsx',
  'packages/analytics/src/components/PerformanceDashboard.js',
  'packages/analytics/src/components/PerformanceDashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import { Card } from '@repo/ui/components/SanctuaryCard';", "import { Surface } from '@repo/ui/components/native';");
  content = content.replace(/<Card\s+className=/g, '<Surface tone="raised" className=');
  content = content.replace(/<\/Card>/g, '</Surface>');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
