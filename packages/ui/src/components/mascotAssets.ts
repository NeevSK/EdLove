import type { MascotRole, MascotScale, MascotState, MascotTheme } from './mascotTypes';

export type MascotAssetFormat = 'svg' | 'png' | 'webp' | 'lottie' | 'rive';
export type MascotAssetStatus = 'concept' | 'approved' | 'production';

export type MascotAssetDescriptor = {
  id: string;
  role: MascotRole;
  state: MascotState;
  theme: MascotTheme;
  scale: MascotScale;
  format: MascotAssetFormat;
  status: MascotAssetStatus;
  sourcePath: string;
};

/**
 * The asset contract is deliberately data-only until the vector master is approved.
 * Keeping the contract here prevents future exports from inventing incompatible names.
 */
export const mascotAssetContract = {
  sourceDirectory: 'packages/ui/assets/mascot',
  sourceOfTruth: 'Figma mascot vector master',
  staticFormats: ['svg', 'png', 'webp'] as const,
  animatedFormats: ['lottie', 'rive'] as const,
  requiredThemes: ['light', 'dark'] as const,
  requiredScales: ['inline', 'card', 'scene'] as const,
  roles: ['guide', 'student', 'teacher', 'guardian', 'host', 'librarian'] as const,
  states: ['resting', 'curious', 'guiding', 'interrupted', 'complete'] as const,
} as const;

export function mascotAssetId({
  role,
  state,
  theme,
  scale,
  format,
}: Pick<MascotAssetDescriptor, 'role' | 'state' | 'theme' | 'scale' | 'format'>): string {
  return `firefly-${role}-${state}-${theme}-${scale}.${mascotAssetExtension(format)}`;
}

export function mascotAssetExtension(
  format: MascotAssetFormat,
): 'svg' | 'png' | 'webp' | 'json' | 'riv' {
  switch (format) {
    case 'lottie':
      return 'json';
    case 'rive':
      return 'riv';
    default:
      return format;
  }
}

export function mascotAssetPath(
  descriptor: Pick<MascotAssetDescriptor, 'role' | 'state' | 'theme' | 'scale' | 'format'>,
): string {
  return `${mascotAssetContract.sourceDirectory}/${mascotAssetId(descriptor)}`;
}
