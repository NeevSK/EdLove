import type { WorkspaceAppearancePreset } from '@repo/core/types';

export function resolveWorkspaceAppearanceColor(
  preset: WorkspaceAppearancePreset = 'default',
): string {
  if (preset === 'dawn') return '#fff6e8';
  if (preset === 'garden') return '#f3f7ec';
  if (preset === 'night') return '#202326';
  if (preset === 'none') return 'transparent';
  return '#faf7ed';
}
