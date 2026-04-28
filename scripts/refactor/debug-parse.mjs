import fs from 'node:fs';

const content = fs.readFileSync('packages/self/type_errors_direct_v1.txt', 'utf8');
const lines = content.split('\n');
const regex = /(.+\.tsx?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)/;
console.log('Sample line:', lines[0]);
console.log('Match?', regex.test(lines[0]));
console.log('Result?', lines[0].match(regex));
