import { describe, expect, it } from 'vitest';
import type { GurudeviExperience } from '../../verger/experience';
import { floorControlsOf } from './controls';

const exp = (over: Partial<GurudeviExperience>) => over as GurudeviExperience;

describe('floorControlsOf: verger sets the floor dials on both platforms', () => {
  it('starts balanced and calm before verger has read the device', () => {
    expect(floorControlsOf(null)).toEqual({ detail: 'balanced', motion: 'reduced' });
  });
  it('follows verger quality and allowed motion', () => {
    expect(floorControlsOf(exp({ quality: 'full', allowRichAnimation: true }))).toEqual({
      detail: 'rich',
      motion: 'full',
    });
    expect(
      floorControlsOf(
        exp({ quality: 'essential', allowRichAnimation: false, allowSubtleAnimation: false }),
      ),
    ).toEqual({ detail: 'essential', motion: 'none' });
  });
});
