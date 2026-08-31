import { describe, expect, it } from 'vitest';
import { describeSelfCanvasPersistence } from './selfCanvasPersistence';

describe('Self canvas persistence feedback', () => {
  it('distinguishes a device save waiting for sync from a completed cloud sync', () => {
    expect(describeSelfCanvasPersistence('queued')).toEqual({
      label: 'Saved on this device. Sync needs a connection.',
      canRetry: true,
    });
    expect(describeSelfCanvasPersistence('synced')).toEqual({
      label: 'Sanctuary layout synced',
      canRetry: false,
    });
  });

  it('only exposes retry for a queued server write', () => {
    expect(describeSelfCanvasPersistence('idle').canRetry).toBe(false);
    expect(describeSelfCanvasPersistence('saving').canRetry).toBe(false);
    expect(describeSelfCanvasPersistence('queued').canRetry).toBe(true);
    expect(describeSelfCanvasPersistence('localError')).toEqual({
      label: 'Could not save your sanctuary layout on this device.',
      canRetry: true,
    });
  });
});
