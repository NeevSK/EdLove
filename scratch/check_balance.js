
import fs from 'fs';

const content = fs.readFileSync('packages/library/src/screens/LibraryScreen.web.tsx', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;
let angleBrackets = 0; // This is tricky because of generics and comparisons

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
}

console.log(`Braces: ${braces}`);
console.log(`Parens: ${parens}`);
console.log(`Brackets: ${brackets}`);
