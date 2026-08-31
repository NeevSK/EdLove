import { stateFromMascotMode } from '../mascotTypes';

describe('stateFromMascotMode', () => {
  it.each([
    ['resting', 'resting'],
    ['offline', 'interrupted'],
    ['glowing', 'guiding'],
  ] as const)('maps legacy mode %s to mascot state %s', (mode, state) => {
    expect(stateFromMascotMode(mode)).toBe(state);
  });
});
