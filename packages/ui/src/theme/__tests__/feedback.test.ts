import { describe, expect, it } from 'vitest';
import { type FeedbackEvent, hapticFor, motionFor } from '../feedback';
import { WORLD_IDS, WORLDS } from '../worlds';

const EVENTS: FeedbackEvent[] = [
  'press',
  'select',
  'step',
  'commit',
  'success',
  'warning',
  'error',
  'destructive',
];

describe('feedback grammar', { tags: ['unit'] }, () => {
  it('outcomes feel like outcomes in every world: success, warning and error are never a tap', () => {
    for (const id of WORLD_IDS) {
      const c = WORLDS[id].motion.haptic;
      expect(hapticFor('success', c)).toBe('success');
      expect(hapticFor('warning', c)).toBe('warning');
      expect(hapticFor('error', c)).toBe('error');
    }
  });

  it('choices tick, and the world decides how firm a press is', () => {
    expect(hapticFor('select', 'soft')).toBe('selection');
    expect(hapticFor('step', 'crisp')).toBe('selection');
    expect(hapticFor('press', 'soft')).toBe('light');
    expect(hapticFor('press', 'crisp')).toBe('medium');
    expect(hapticFor('destructive', 'soft')).toBe('heavy');
  });

  it('only failure moves the thing itself', () => {
    expect(EVENTS.filter((e) => motionFor(e) !== 'none')).toEqual(['error']);
  });
});
