import { describe, expect, it } from 'vitest';
import { pressKey } from '../Keyboard/focus';

describe('keypad keys', () => {
  it('appends digits up to the field limit', () => {
    expect(pressKey('7', '5', 'number')).toBe('75');
    expect(pressKey('1234', '5', 'number', 4)).toBe('1234');
  });

  it('takes one decimal point, and only on a decimal pad', () => {
    expect(pressKey('', '.', 'decimal')).toBe('0.');
    expect(pressKey('7.5', '.', 'decimal')).toBe('7.5');
    expect(pressKey('7', '.', 'number')).toBe('7');
  });

  it('deletes one at a time and ignores anything else', () => {
    expect(pressKey('42', 'back', 'number')).toBe('4');
    expect(pressKey('', 'back', 'number')).toBe('');
    expect(pressKey('4', 'x', 'number')).toBe('4');
  });
});
