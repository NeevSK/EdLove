import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const p = path.resolve('scripts/check-ui-boundaries.mjs');
let c = fs.readFileSync(p, 'utf8');
c = c.replace("import { execFileSync } from 'node:child_process';", "import { execFileSync, execSync } from 'node:child_process';");
const tmp = p + '.tmp';
fs.writeFileSync(tmp, c, 'utf8');
execSync(`cmd.exe /c move /y "${tmp}" "${p}"`);
console.log('Fixed execSync import in check-ui-boundaries.mjs');
