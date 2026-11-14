import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const p = path.resolve('packages/self/src/components/MyGradesView.tsx');
let c = fs.readFileSync(p, 'utf8');
c = c.replace('variant="outline"', 'variant="secondary"');
const tmp = p + '.tmp';
fs.writeFileSync(tmp, c, 'utf8');
execSync(`cmd.exe /c move /y "${tmp}" "${p}"`);
console.log('Fixed MyGradesView variant to secondary');
