
const fs = require('fs');
const log = fs.readFileSync('audit-admin.log', 'utf8');
const lines = log.split('\n');
const regex = /^(.*?)(?:\(|\:)(\d+)(?:[\, \:]+(\d+))?[\)\s\-\:]*\s*(error|warning)\s+TS(\d+):\s*(.*)$/;

let matched = 0;
let unmatched = [];

lines.forEach(line => {
    if (line.trim() === '') return;
    if (regex.test(line)) {
        matched++;
    } else {
        // Only track if it looks like an error line (has TS in it)
        if (line.includes('TS')) {
            unmatched.push(line);
        }
    }
});

console.log(`Matched: ${matched}`);
console.log(`Unmatched lines with 'TS': ${unmatched.length}`);
if (unmatched.length > 0) {
    console.log('Sample unmatched:');
    unmatched.slice(0, 5).forEach(u => console.log(u));
}
