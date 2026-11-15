import { dropAt, moveAmong, moveChoices, movedAnnouncement } from '@repo/core/logic/floor';
import { describe, expect, it } from 'vitest';

describe('moving furniture', () => {
  const order = ['a', 'hidden', 'b', 'c', 'other-group', 'd'];
  const visible = ['a', 'b', 'c', 'd'];

  it('moves among visible neighbours and keeps other ids in their slots', () => {
    expect(moveAmong(order, visible, 'c', -1)).toEqual([
      'a',
      'hidden',
      'c',
      'b',
      'other-group',
      'd',
    ]);
    expect(moveAmong(order, visible, 'a', 1)).toEqual([
      'b',
      'hidden',
      'a',
      'c',
      'other-group',
      'd',
    ]);
  });

  it('first and last', () => {
    expect(moveAmong(order, visible, 'd', 'first')).toEqual([
      'd',
      'hidden',
      'a',
      'b',
      'other-group',
      'c',
    ]);
    expect(moveAmong(order, visible, 'a', 'last')).toEqual([
      'b',
      'hidden',
      'c',
      'd',
      'other-group',
      'a',
    ]);
  });

  it('returns the same array at an edge or for an unknown id', () => {
    expect(moveAmong(order, visible, 'a', -1)).toBe(order);
    expect(moveAmong(order, visible, 'zzz', 1)).toBe(order);
  });

  it('drag and buttons agree', () => {
    expect(dropAt(order, visible, 'a', 2)).toEqual(
      moveAmong(moveAmong(order, visible, 'a', 1), ['b', 'a', 'c', 'd'], 'a', 1),
    );
  });

  it('adds visible ids the saved order did not know yet', () => {
    expect(moveAmong(['a'], ['a', 'new'], 'new', -1)).toEqual(['new', 'a']);
  });

  it('offers only possible moves and announces the place', () => {
    expect(moveChoices(visible, 'a')).toEqual({ up: false, down: true });
    expect(moveChoices(visible, 'd')).toEqual({ up: true, down: false });
    expect(movedAnnouncement('Notes', visible, 'b')).toBe('Notes, 2 of 4');
  });
});
