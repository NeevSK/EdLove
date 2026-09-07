import type { ExperienceProfile } from '@repo/ui/context/types';

vi.mock('../haptics', () => ({
  hapticError: vi.fn(),
  hapticLight: vi.fn(),
  hapticMedium: vi.fn(),
  hapticSelection: vi.fn(),
  hapticSuccess: vi.fn(),
}));

import { createFeedbackController, resolveFeedbackDecision } from '../feedbackPolicy';

const profile: ExperienceProfile = {
  motion: 'rich',
  visualEffects: 'rich',
  haptics: 'refined',
  sound: 'essential',
  celebration: 'rich',
  maxParticles: 200,
  maxConcurrentSounds: 1,
  allowAssetPrefetch: true,
};

describe('feedback policy', () => {
  it('keeps routine press feedback quiet on essential haptics', () => {
    const decision = resolveFeedbackDecision('press', { ...profile, haptics: 'essential' });

    expect(decision).toEqual({ haptic: null, sound: null });
  });

  it('maps meaningful events to tactile and sound cues', () => {
    expect(resolveFeedbackDecision('success', profile)).toEqual({
      haptic: 'success',
      sound: 'success',
    });
    expect(resolveFeedbackDecision('milestone', profile)).toEqual({
      haptic: 'success',
      sound: null,
    });
  });

  it('allows an injected audio adapter without coupling policy to audio runtime', () => {
    const playSound = vi.fn();
    createFeedbackController({ ...profile, sound: 'rich' }, playSound).emit('milestone');

    expect(playSound).toHaveBeenCalledWith('milestone');
  });
});
