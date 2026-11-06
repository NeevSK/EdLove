import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('retired principal dashboard surface', () => {
  it('does not retain route files or workspace registrations for that dashboard', () => {
    const routes = [
      'app/(tabs)/workspace/principal.tsx',
      'app/(tabs)/workspace/admin.tsx',
      'app/(tabs)/workspace/section-head.tsx',
      'app/(tabs)/workspace/grade-head.tsx',
    ];
    expect(routes.every((route) => !fs.existsSync(path.join(APP_ROOT, route)))).toBe(true);

    const dispatcher = fs.readFileSync(
      path.join(APP_ROOT, 'app/(tabs)/workspace/index.tsx'),
      'utf8',
    );
    expect(dispatcher).not.toContain('/workspace/principal');
    expect(dispatcher).not.toContain('/workspace/admin');
  });
});
