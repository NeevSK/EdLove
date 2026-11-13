import { describe, expect, it, vi } from 'vitest';
import { createFeel } from '../engine';

describe('one feedback engine', () => {
  it('feels a press in the world character and makes no sound for it', () => {
    const haptic = vi.fn();
    const sound = vi.fn();
    const feel = createFeel({ haptic, sound }, { soundEnabled: true, character: 'crisp' });
    feel.emit('press');
    expect(haptic).toHaveBeenCalledWith('medium');
    expect(sound).not.toHaveBeenCalled();
    feel.configure({ character: 'soft' });
    feel.emit('press');
    expect(haptic).toHaveBeenLastCalledWith('light');
  });

  it('plays a result sound only when the person turned sounds on and is not in quiet hours', () => {
    const sound = vi.fn();
    const feel = createFeel({ sound });
    feel.emit('success');
    expect(sound).not.toHaveBeenCalled();
    feel.configure({ soundEnabled: true });
    feel.emit('success');
    expect(sound).toHaveBeenCalledWith('success');
    feel.configure({ quietMode: true });
    feel.emit('success');
    expect(sound).toHaveBeenCalledTimes(1);
  });

  it('drops everyday taps when verger saves, but keeps results', () => {
    const haptic = vi.fn();
    const feel = createFeel({ haptic }, { hapticsLevel: 'essential' });
    feel.emit('select');
    expect(haptic).not.toHaveBeenCalled();
    feel.emit('error');
    expect(haptic).toHaveBeenCalledWith('error');
  });

  it('reads the older "selection" name as select', () => {
    const haptic = vi.fn();
    createFeel({ haptic }).emit('selection');
    expect(haptic).toHaveBeenCalledWith('selection');
  });

  it('turns everything off with the person vibration switch', () => {
    const haptic = vi.fn();
    createFeel({ haptic }, { hapticsEnabled: false }).emit('error');
    expect(haptic).not.toHaveBeenCalled();
  });
});
