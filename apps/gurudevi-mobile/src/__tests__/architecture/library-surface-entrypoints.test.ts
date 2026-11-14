import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('retired library routes', () => {
  it('removes library routes and navigators (the catalog keeps Library entries)', () => {
    const retiredRoutes = [
      'app/(tabs)/library/_layout.tsx',
      'app/(tabs)/library/index.tsx',
      'app/(tabs)/library/document-scanner.tsx',
      'app/(tabs)/library/contribute.tsx',
      'src/navigation/registries/libraryRegistry.ts',
    ];
    expect(retiredRoutes.every((route) => !fs.existsSync(path.join(APP_ROOT, route)))).toBe(true);

    const navigation = fs.readFileSync(
      path.join(APP_ROOT, 'src/lib/navigation/appNavigation.ts'),
      'utf8',
    );
    expect(navigation).not.toContain("href: '/library'");
  });
});
