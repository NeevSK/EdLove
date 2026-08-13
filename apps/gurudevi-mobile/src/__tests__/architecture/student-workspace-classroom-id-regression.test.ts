import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROUTE = path.resolve(__dirname, '../../../app/(tabs)/workspace/index.tsx');

describe('student workspace classroomId routing', () => {
  it('does not substitute a synthetic default classroom id', () => {
    const source = fs.readFileSync(WORKSPACE_ROUTE, 'utf8');

    expect(source).not.toMatch(/context\.classroomId\s*\|\|\s*['"]default['"]/);
  });
});
