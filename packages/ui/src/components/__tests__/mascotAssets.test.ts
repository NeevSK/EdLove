import {
  mascotAssetContract,
  mascotAssetExtension,
  mascotAssetId,
  mascotAssetPath,
} from '../mascotAssets';

describe('mascot asset contract', () => {
  it('generates stable, platform-neutral asset names', () => {
    const descriptor = {
      role: 'student' as const,
      state: 'curious' as const,
      theme: 'light' as const,
      scale: 'card' as const,
      format: 'svg' as const,
    };

    expect(mascotAssetId(descriptor)).toBe('firefly-student-curious-light-card.svg');
    expect(mascotAssetPath(descriptor)).toBe(
      'packages/ui/assets/mascot/firefly-student-curious-light-card.svg',
    );
    expect(mascotAssetId({ ...descriptor, format: 'lottie' })).toBe(
      'firefly-student-curious-light-card.json',
    );
    expect(mascotAssetExtension('rive')).toBe('riv');
  });

  it('keeps the complete approved variant surface explicit', () => {
    expect(mascotAssetContract.requiredThemes).toEqual(['light', 'dark']);
    expect(mascotAssetContract.requiredScales).toEqual(['inline', 'card', 'scene']);
    expect(mascotAssetContract.staticFormats).toEqual(['svg', 'png', 'webp']);
    expect(mascotAssetContract.animatedFormats).toEqual(['lottie', 'rive']);
    expect(mascotAssetContract.roles).toEqual([
      'guide',
      'student',
      'teacher',
      'guardian',
      'host',
      'librarian',
    ]);
    expect(mascotAssetContract.states).toEqual([
      'resting',
      'curious',
      'guiding',
      'interrupted',
      'complete',
    ]);
  });
});
