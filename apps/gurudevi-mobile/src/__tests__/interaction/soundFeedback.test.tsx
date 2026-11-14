import { act, render } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAudioPlayer: vi.fn(),
  maxConcurrentSounds: 1,
}));

vi.mock('@repo/ui/context', () => ({
  FeedbackProvider: ({ children }: { children: ReactNode }) => children,
  useSensoryPreferencesOptional: () => ({ soundEnabled: true, quietMode: false }),
  useVisualCapabilities: () => ({ experience: { maxConcurrentSounds: mocks.maxConcurrentSounds } }),
}));
vi.mock('expo-audio', () => ({ createAudioPlayer: mocks.createAudioPlayer }));

import { SoundFeedbackProvider, useSoundFeedback } from '@/interaction/soundFeedback';

function player() {
  let complete: (() => void) | undefined;
  const removeListener = vi.fn();
  return {
    play: vi.fn(),
    remove: vi.fn(),
    addListener: vi.fn((_event: string, callback: (status: { didJustFinish: boolean }) => void) => {
      complete = () => callback({ didJustFinish: true });
      return { remove: removeListener };
    }),
    removeListener,
    finish: () => complete?.(),
  };
}

describe('sound feedback resource ownership', () => {
  let play: ReturnType<typeof useSoundFeedback>['play'];
  function Probe() {
    play = useSoundFeedback().play;
    return null;
  }
  const sources = { success: 1 };

  beforeEach(() => {
    mocks.createAudioPlayer.mockReset();
    mocks.maxConcurrentSounds = 1;
  });

  it('releases listeners and players on eviction, completion and owner unmount', () => {
    const first = player();
    const second = player();
    mocks.createAudioPlayer.mockReturnValueOnce(first).mockReturnValueOnce(second);
    const view = render(<SoundFeedbackProvider sources={sources}><Probe /></SoundFeedbackProvider>);

    act(() => play('success'));
    act(() => play('success'));
    expect(first.removeListener).toHaveBeenCalledOnce();
    expect(first.remove).toHaveBeenCalledOnce();
    act(() => first.finish());
    expect(first.remove).toHaveBeenCalledOnce();

    act(() => second.finish());
    expect(second.removeListener).toHaveBeenCalledOnce();
    expect(second.remove).toHaveBeenCalledOnce();
    view.unmount();
    expect(second.remove).toHaveBeenCalledOnce();
  });

  it('replaces the committed owner through strict effect replay and configuration changes', () => {
    const first = player();
    const second = player();
    mocks.createAudioPlayer.mockReturnValueOnce(first).mockReturnValueOnce(second);
    const view = render(<StrictMode><SoundFeedbackProvider sources={sources}><Probe /></SoundFeedbackProvider></StrictMode>);
    act(() => play('success'));
    expect(first.play).toHaveBeenCalledOnce();

    view.rerender(<StrictMode><SoundFeedbackProvider sources={{ success: 2 }}><Probe /></SoundFeedbackProvider></StrictMode>);
    expect(first.remove).toHaveBeenCalledOnce();
    expect(first.removeListener).toHaveBeenCalledOnce();
    act(() => play('success'));
    expect(mocks.createAudioPlayer).toHaveBeenLastCalledWith(2, expect.any(Object));
    view.unmount();
    expect(second.remove).toHaveBeenCalledOnce();
    expect(second.removeListener).toHaveBeenCalledOnce();
  });
});
