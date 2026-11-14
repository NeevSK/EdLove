import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('retired classroom navigation', () => {
  it('does not publish classroom route wrappers or dispatch to synthetic destinations', () => {
    const retiredRoutes = [
      'app/(tabs)/workspace/classroom/index.tsx',
      'app/(tabs)/workspace/classroom/student/[classroomId].tsx',
      'app/(tabs)/workspace/classroom/[classroomId]/index.tsx',
    ];
    expect(retiredRoutes.every((route) => !fs.existsSync(path.join(APP_ROOT, route)))).toBe(true);

    const dispatcher = fs.readFileSync(
      path.join(APP_ROOT, 'app/(tabs)/workspace/index.tsx'),
      'utf8',
    );
    expect(dispatcher).not.toMatch(/classroomId\s*\|\|\s*['"]default['"]/);
    expect(dispatcher).not.toContain('/workspace/classroom');
  });
});
