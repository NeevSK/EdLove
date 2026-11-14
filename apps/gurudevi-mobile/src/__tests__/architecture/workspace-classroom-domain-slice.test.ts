import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('workspace route admissions', () => {
  it('does not redirect into retired classroom or role-dashboard routes', () => {
    const dispatcher = fs.readFileSync(
      path.join(APP_ROOT, 'app/(tabs)/workspace/index.tsx'),
      'utf8',
    );
    expect(dispatcher).not.toContain('/workspace/classroom');
    expect(dispatcher).not.toContain('/workspace/founder');
    expect(dispatcher).not.toContain('/workspace/principal');
    expect(dispatcher).not.toContain('/workspace/admin');
    expect(dispatcher).toContain('Workspace capability unavailable');
  });
});
