import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const p = path.resolve('scripts/check-world.mjs');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  "import { existsSync, readFileSync, writeFileSync } from 'node:fs';",
  "import { existsSync, readFileSync, writeFileSync } from 'node:fs';\nimport { execSync } from 'node:child_process';"
);

const oldWrite = `  writeFileSync(
    RATCHET,
    \`\${JSON.stringify({ rawHex: hexCount, note: 'Raw hex colours outside dressed files. May only go down. node scripts/check-world.mjs --update' }, null, 2)}\\n\`,
  );`;

const newWrite = `  const outJson = \`\${JSON.stringify({ rawHex: hexCount, note: 'Raw hex colours outside dressed files. May only go down. node scripts/check-world.mjs --update' }, null, 2)}\\n\`;
  try {
    writeFileSync(RATCHET, outJson);
  } catch {
    const tmp = \`\${RATCHET}.tmp\`;
    writeFileSync(tmp, outJson);
    execSync(\`cmd.exe /c move /y "\${tmp}" "\${RATCHET}"\`);
  }`;

c = c.replace(oldWrite, newWrite);

const tmp = p + '.tmp';
fs.writeFileSync(tmp, c, 'utf8');
execSync(`cmd.exe /c move /y "${tmp}" "${p}"`);
console.log('Fixed check-world.mjs to use atomic fallback on Windows file locks');
