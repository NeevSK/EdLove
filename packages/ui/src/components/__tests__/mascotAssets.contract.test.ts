import {
  mascotAssetContract,
  mascotAssetExtension,
  mascotAssetId,
  mascotAssetPath,
} from '../mascotAssets';

describe('mascot asset contract', () => {
  it('covers every role/state/theme/scale address with deterministic ids', () => {
    for (const role of mascotAssetContract.roles) {
      for (const state of mascotAssetContract.states) {
        for (const theme of mascotAssetContract.requiredThemes) {
          for (const scale of mascotAssetContract.requiredScales) {
            const descriptor = { role, state, theme, scale, format: 'webp' as const };
            const id = mascotAssetId(descriptor);
            expect(id).toBe(`firefly-${role}-${state}-${theme}-${scale}.webp`);
            expect(mascotAssetPath(descriptor)).toBe(`packages/ui/assets/mascot/${id}`);
          }
        }
      }
    }
  });

  it.each([
    ['svg', 'svg'],
    ['png', 'png'],
    ['webp', 'webp'],
    ['lottie', 'json'],
    ['rive', 'riv'],
  ] as const)('maps %s to the delivery extension %s', (format, extension) => {
    expect(mascotAssetExtension(format)).toBe(extension);
  });
});
