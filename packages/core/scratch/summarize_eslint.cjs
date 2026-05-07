const fs = require('fs');
const results = JSON.parse(fs.readFileSync('eslint_output_fresh.json', 'utf8').replace(/^\uFEFF/, ''));

const summary = {};
results.forEach(result => {
  result.messages.forEach(msg => {
    const ruleId = msg.ruleId || 'no-rule-id';
    if (!summary[ruleId]) {
        summary[ruleId] = { count: 0, files: new Set() };
    }
    summary[ruleId].count++;
    if (summary[ruleId].files.size < 5) {
        summary[ruleId].files.add(result.filePath);
    }
  });
});

Object.keys(summary).forEach(ruleId => {
    summary[ruleId].files = Array.from(summary[ruleId].files);
});

console.log(JSON.stringify(summary, null, 2));
