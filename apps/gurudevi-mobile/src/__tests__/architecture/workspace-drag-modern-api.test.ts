import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../..');
const draggableSurfacePath = path.join(
  repoRoot,
  'packages',
  'ui',
  'src',
  'components',
  'workspace',
  'DraggableCanvasSurface.tsx',
);
const achievementOverlayPath = path.join(
  repoRoot,
  'packages',
  'ui',
  'src',
  'components',
  'AchievementUnlockOverlay.tsx',
);

describe('workspace drag production contract', () => {
  it('does not require manual pan activation without an activation pathway', () => {
    const source = fs.readFileSync(draggableSurfacePath, 'utf8');

    expect(source).not.toMatch(/manualActivation\s*:\s*true/);
    expect(source).toContain('usePanGesture');
  });

  it('uses the Worklets runtime for cross-thread animation callbacks', () => {
    const source = fs.readFileSync(achievementOverlayPath, 'utf8');

    expect(source).toContain("from 'react-native-worklets'");
    expect(source).not.toMatch(
      /import\s*\{[^}]*\brunOnJS\b[^}]*\}\s*from\s*['\"]react-native-reanimated['\"]/,
    );
  });
});
