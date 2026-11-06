import fs from 'node:fs';

const files = [
  'packages/graphics/src/charts/AnalyticsEngine.tsx',
  'packages/graphics/src/charts/HeatmapChart.tsx',
  'packages/graphics/src/charts/InteractiveChat.tsx',
  'packages/graphics/src/charts/RadarSpiderChart.tsx',
  'packages/graphics/src/charts/SankeyDiagram.tsx',
  'packages/graphics/src/charts/TimelineChart.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import { Card } from '@repo/ui/components/SanctuaryCard';", "import { Surface } from '@repo/ui/components/native';");
  content = content.replace(/<Card\s+style=/g, '<Surface tone="raised" style=');
  content = content.replace(/<\/Card>/g, '</Surface>');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
