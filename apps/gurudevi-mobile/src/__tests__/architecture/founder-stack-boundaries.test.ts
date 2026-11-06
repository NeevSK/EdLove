import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('retired role dashboard routes', () => {
  it('does not register package backed admin dashboards in the mobile workspace', () => {
    const retiredRoutes = [
      'app/(tabs)/workspace/admin.tsx',
      'app/(tabs)/workspace/principal.tsx',
      'app/(tabs)/workspace/founder.tsx',
      'app/(tabs)/workspace/founder/[schoolId].tsx',
      'app/(tabs)/workspace/grade-head.tsx',
      'app/(tabs)/workspace/section-head.tsx',
    ];
    expect(retiredRoutes.every((route) => !fs.existsSync(path.join(APP_ROOT, route)))).toBe(true);

    const layout = fs.readFileSync(
      path.join(APP_ROOT, 'app/(tabs)/workspace/_layout.tsx'),
      'utf8',
    );
    expect(layout).not.toMatch(/name="(admin|principal|founder|grade-head|section-head)"/);
  });
});
