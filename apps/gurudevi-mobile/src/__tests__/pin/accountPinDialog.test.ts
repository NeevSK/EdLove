import { describe, expect, it, vi } from 'vitest';

vi.mock('@repo/ui/components/native', () => ({}));

import { checkPin } from '@/components/pin/AccountPinDialog';

const entry = (pin = '', confirmPin = '', currentPin = '') => ({ pin, confirmPin, currentPin });

describe('checkPin', () => {
  it('verifies any entered PIN and asks for one when empty', () => {
    expect(checkPin('verify', entry(' 12 34 '))).toEqual({ ok: { pin: '1234' } });
    expect(checkPin('verify', entry())).toEqual({ error: 'Enter the PIN for this account.' });
  });

  it('creates only 4 to 8 matching digits', () => {
    expect(checkPin('create', entry('123'))).toEqual({
      error: 'Use 4 to 8 digits for the app PIN.',
    });
    expect(checkPin('create', entry('1234', '1235'))).toEqual({
      error: 'The two PIN entries do not match.',
    });
    expect(checkPin('create', entry('1234', '1234'))).toEqual({ ok: { pin: '1234' } });
  });

  it('updates with the current PIN and a matching new one', () => {
    expect(checkPin('update', entry('5678', '5678'))).toEqual({
      error: 'Enter the current PIN before changing it.',
    });
    expect(checkPin('update', entry('5678', '5678', '1234'))).toEqual({
      ok: { currentPin: '1234', nextPin: '5678' },
    });
  });

  it('removes with the current PIN', () => {
    expect(checkPin('remove', entry('', '', ''))).toEqual({
      error: 'Enter the current PIN first.',
    });
    expect(checkPin('remove', entry('', '', '1234'))).toEqual({ ok: { pin: '1234' } });
  });
});
