import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('retired classroom routes', () => {
  it('does not publish retired classroom route files or navigation registrations', () => {
    const retiredRoutes = [
      'app/(tabs)/workspace/classroom/index.tsx',
      'app/(tabs)/workspace/classroom/[classroomId]/index.tsx',
      'app/(tabs)/workspace/classroom/[classroomId]/attendance.tsx',
      'app/(tabs)/workspace/classroom/[classroomId]/gradebook.tsx',
      'app/(tabs)/workspace/classroom/student/[classroomId].tsx',
      'app/attendance.tsx',
      'app/gradebook.tsx',
    ];
    expect(retiredRoutes.every((route) => !fs.existsSync(path.join(APP_ROOT, route)))).toBe(true);

    const workspaceLayout = fs.readFileSync(
      path.join(APP_ROOT, 'app/(tabs)/workspace/_layout.tsx'),
      'utf8',
    );
    const workspaceRegistry = fs.readFileSync(
      path.join(APP_ROOT, 'src/navigation/registries/workspaceRegistry.ts'),
      'utf8',
    );
    expect(workspaceLayout).not.toContain('classroom/');
    expect(workspaceRegistry).not.toContain('/workspace/classroom');
    expect(workspaceRegistry).not.toContain('@repo/classroom');
  });
});
