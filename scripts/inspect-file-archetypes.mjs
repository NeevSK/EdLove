import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json', 'utf8'));

console.log(`Total files: ${data.totalFiles}, Total edges: ${data.totalEdges}`);

data.layerBreakdown.forEach(l => {
  console.log(`\n=== TOPOLOGICAL LAYER ${l.layer} (${l.files.length} files) ===`);
  l.files.forEach(f => {
    const filename = f.path.split('/').pop();
    console.log(`  - [${filename}] ${f.path}`);
  });
});
