import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const p = path.resolve('scripts/check-ui-boundaries.mjs');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  "execFileSync('cmd', ['/c', `move /y \"${tmp}\" \"${RATCHET}\"`]);",
  "execSync(`cmd.exe /c move /y \"${tmp}\" \"${RATCHET}\"`);"
);
const tmp = p + '.tmp';
fs.writeFileSync(tmp, c, 'utf8');
execSync(`cmd.exe /c move /y "${tmp}" "${p}"`);
console.log('Fixed check-ui-boundaries.mjs');
