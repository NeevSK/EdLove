import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');

describe('retired profile routes', () => {
  it('removes profile wrappers while keeping standalone app settings', () => {
    const retiredRoutes = [
      'app/(tabs)/profile/index.tsx',
      'app/(tabs)/profile/mute-hub.tsx',
      'app/(tabs)/profile/full/[id].tsx',
      'app/(tabs)/profile/public/[id].tsx',
      'app/(tabs)/profile/privacy-ledger.tsx',
      'app/thuthimal-claim.tsx',
    ];
    expect(retiredRoutes.every((route) => !fs.existsSync(path.join(APP_ROOT, route)))).toBe(true);
    expect(fs.existsSync(path.join(APP_ROOT, 'app/(tabs)/settings.tsx'))).toBe(true);
  });

  it('does not expose a profile tab in navigation metadata or the tab shell', () => {
    const navigation = fs.readFileSync(
      path.join(APP_ROOT, 'src/lib/navigation/appNavigation.ts'),
      'utf8',
    );
    const tabLayout = fs.readFileSync(path.join(APP_ROOT, 'app/(tabs)/_layout.tsx'), 'utf8');
    expect(navigation).not.toContain("href: '/profile'");
    expect(tabLayout).not.toContain('name="profile"');
  });
});
