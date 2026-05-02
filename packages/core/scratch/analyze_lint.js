/* eslint-disable */
import fs from 'fs';
const reportPath = 'eslint_report_honest_final.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const hydrationIssues = report.filter(file => 
    file.messages.some(msg => msg.message.includes('hydration') || msg.message.includes('non-deterministic'))
);

const anyUsage = report.filter(file => 
    file.messages.some(msg => msg.ruleId === '@typescript-eslint/no-explicit-any')
);

console.log(`Total files with hydration issues: ${hydrationIssues.length}`);
console.log(`Total files with 'any' usage: ${anyUsage.length}`);

const targetFiles = [
    'presence.ts',
    'resilience.ts',
    'comment.hooks.ts',
    'notification.hooks.ts',
    'assignmentRepository.ts'
];

targetFiles.forEach(target => {
    const fileReport = report.find(f => f.filePath.endsWith(target));
    if (fileReport) {
        console.log(`\n--- Status for ${target} ---`);
        fileReport.messages.forEach(msg => {
            console.log(`  Line ${msg.line}: [${msg.ruleId}] ${msg.message}`);
        });
        if (fileReport.messages.length === 0) console.log('  Clean!');
    } else {
        console.log(`\n--- ${target} not found in report (might be clean or excluded) ---`);
    }
});
