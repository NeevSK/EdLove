import * as Haptics from 'expo-haptics';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sensoryFeedback } from '../SensoryFeedbackService';

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  selectionAsync: vi.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('SensoryFeedbackService (Zero-Provider Hardware Singleton)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sensoryFeedback.configure({
      hapticsEnabled: true,
      soundEnabled: true,
      quietMode: false,
    });
  });

  it('triggers native haptics on selection event', () => {
    sensoryFeedback.emit('selection');
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('triggers native haptics on success event', () => {
    sensoryFeedback.emit('success');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('respects hapticsEnabled toggle when disabled', () => {
    sensoryFeedback.configure({ hapticsEnabled: false });
    sensoryFeedback.emit('selection');
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('routes sound to registered native player', () => {
    const mockPlayer = vi.fn();
    sensoryFeedback.registerNativeSoundPlayer(mockPlayer);

    sensoryFeedback.emit('milestone');
    expect(mockPlayer).toHaveBeenCalledWith('milestone');
  });

  it('releases a player without allowing old cleanup to erase its replacement', () => {
    const previous = vi.fn();
    const current = vi.fn();
    const releasePrevious = sensoryFeedback.registerNativeSoundPlayer(previous);
    const releaseCurrent = sensoryFeedback.registerNativeSoundPlayer(current);
    releasePrevious();

    sensoryFeedback.emit('success');
    expect(previous).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledOnce();

    releaseCurrent();
    sensoryFeedback.emit('success');
    expect(current).toHaveBeenCalledOnce();
  });

  it('distinguishes registrations even when the callback identity is reused', () => {
    const player = vi.fn();
    const releaseOld = sensoryFeedback.registerNativeSoundPlayer(player);
    const releaseNew = sensoryFeedback.registerNativeSoundPlayer(player);
    releaseOld();
    sensoryFeedback.emit('milestone');
    expect(player).toHaveBeenCalledOnce();
    releaseNew();
  });

  it('silences sound when quietMode is active', () => {
    const mockPlayer = vi.fn();
    sensoryFeedback.registerNativeSoundPlayer(mockPlayer);
    sensoryFeedback.configure({ quietMode: true });

    sensoryFeedback.emit('milestone');
    expect(mockPlayer).not.toHaveBeenCalled();
  });
});
