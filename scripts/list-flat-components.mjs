import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve('.');
const UI = 'packages/ui/src';

const isFlatComponent = (p) =>
  p.startsWith(`${UI}/components/`) &&
  !`${p}/`.startsWith(`${UI}/components/native/`) &&
  !`${p}/`.startsWith(`${UI}/components/web/`) &&
  !`${p}/`.startsWith(`${UI}/components/shared/`);

const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', 'packages/ui'], { encoding: 'utf8' })
  .split('\0')
  .filter(f => f && isFlatComponent(f));

console.log('Flat components under packages/ui/src/components/ (' + files.length + '):');
files.forEach(f => console.log(' ', f));
