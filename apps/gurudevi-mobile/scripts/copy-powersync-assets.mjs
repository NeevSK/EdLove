import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const target = path.resolve('public', '@powersync');

// The upstream copier is not idempotent: concurrent pnpm lifecycle hooks can
// both try to create the same directory and one exits with EEXIST. A present
// target means the workspace already has the generated worker assets.
if (!existsSync(target)) {
  execFileSync('powersync-web', ['copy-assets'], { stdio: 'inherit' });
}
