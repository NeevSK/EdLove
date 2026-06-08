const fs = require('node:fs');
const results = JSON.parse(
  fs.readFileSync('eslint_output_fresh.json', 'utf8').replace(/^\uFEFF/, ''),
);

const fileResult = results.find(
  (r) => r.filePath.endsWith('src\\api\\index.ts') || r.filePath.endsWith('src/api/index.ts'),
);
if (fileResult) {
  console.log(
    JSON.stringify(
      fileResult.messages.filter((m) => m.ruleId === 'import-x/export'),
      null,
      2,
    ),
  );
} else {
  console.log('File not found');
}
