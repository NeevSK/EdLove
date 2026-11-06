import fs from 'fs';

['packages/ui/src/components/SanctuaryCard.tsx',
 'packages/ui/src/components/SanctuaryButton.tsx',
 'packages/ui/src/components/BrandPulse.tsx'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  console.log('===', f, '===');
  console.log(c.match(/from\s+['"](@repo\/ui\/primitives|@repo\/ui\/components\/|@repo\/ui\/theme\/Theme)['"]/g));
});
