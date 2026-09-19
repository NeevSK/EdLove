import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pooler = new URL(
  readFileSync('C:/x/apps/gurudevi-mobile/supabase/.temp/pooler-url', 'utf8').trim(),
);
const direct = new URL(
  execFileSync('doppler', ['secrets', 'get', 'POWERSYNC_DATABASE_URI', '--plain'], {
    encoding: 'utf8',
  }).trim(),
);
pooler.password = direct.password;

const child = spawn(process.execPath, ['--import', 'tsx', 'src/entry-node.ts'], {
  cwd: 'C:/x/apps/sanctuary-api',
  env: {
    ...process.env,
    DATABASE_URL: pooler.toString(),
    SUPABASE_URL: execFileSync('doppler', ['secrets', 'get', 'SUPABASE_URL', '--plain'], {
      encoding: 'utf8',
    }).trim(),
    PORT: '3001',
  },
  stdio: 'inherit',
});

child.once('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
