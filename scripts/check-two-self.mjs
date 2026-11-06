import fs from 'fs';

['packages/self/src/components/archive/ShadowAgentDrawer.tsx',
 'packages/self/src/components/DecisionJournalSection.tsx'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  console.log('===', f, '===');
  const match = c.match(/import\s+\{([^}]+)\}\s+from\s+['"]@repo\/ui\/primitives['"]/);
  console.log(match ? match[0] : 'no legacy primitive import');
});
