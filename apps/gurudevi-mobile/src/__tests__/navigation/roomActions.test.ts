import { describe, expect, it } from 'vitest';
import { fabLabelOf, roomActions } from '@/components/shell/roomActions';

const noop = () => undefined;

describe('the room action offers', () => {
  it('always has something to do, even when no screen registered', () => {
    const actions = roomActions({
      room: 'library',
      pinned: [],
      common: { breathe: { label: 'Breathing reset', onPress: noop } },
    });
    expect(actions.map((a) => a.key)).toEqual(['breathe']);
    expect(fabLabelOf('library')).toBe('Library actions');
  });

  it("puts the screen's own actions first, then pinned, then the room's common ones", () => {
    const actions = roomActions({
      room: 'self',
      screen: {
        primary: { label: 'New entry', onPress: noop },
        actions: [{ label: 'Share', onPress: noop }],
      },
      pinned: [{ id: 'mood_lotus', title: 'Mood', open: noop }],
      common: {
        breathe: { label: 'Breathe', onPress: noop },
        ask: { label: 'Ask Tutii', onPress: noop },
      },
    });
    expect(actions.map((a) => a.key)).toEqual([
      'screen-primary',
      'screen-0',
      'pin-mood_lotus',
      'breathe',
      'ask',
    ]);
    expect(actions[0]?.tone).toBe('lamp');
    expect(actions[2]?.group).toBe('Pinned in Self');
    expect(
      fabLabelOf('self', { primary: { label: 'New entry', onPress: noop }, actions: [] }),
    ).toBe('New entry');
  });
});
