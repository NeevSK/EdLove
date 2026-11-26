import { describe, expect, it } from 'vitest';
import {
  createFrameReader,
  encodeFrame,
  MAX_FRAME_CHARS,
  onLinkStatus,
  transportsToTry,
} from '../liveTransport';

describe('choosing a transport', () => {
  const all = [
    { kind: 'internet', usable: false, reason: 'offline' },
    { kind: 'local-network', usable: true },
    { kind: 'nearby', usable: true },
  ] as const;

  it('assumes the internet first and falls back in order', () => {
    expect(transportsToTry(all, { mixedPlatforms: false })).toEqual(['local-network', 'nearby']);
  });

  it('leaves out nearby when the class mixes Android and iPhone', () => {
    expect(transportsToTry(all, { mixedPlatforms: true })).toEqual(['local-network']);
  });

  it('waits out a short drop, then moves on, then gives up', () => {
    const order = ['internet', 'local-network', 'nearby'] as const;
    expect(onLinkStatus(order, 'internet', 'lost', 1000)).toEqual({ action: 'stay' });
    expect(onLinkStatus(order, 'internet', 'lost', 5000)).toEqual({
      action: 'switch',
      to: 'local-network',
    });
    expect(onLinkStatus(order, 'nearby', 'lost', 5000)).toEqual({ action: 'give-up' });
    expect(onLinkStatus(order, 'internet', 'open', 99_000)).toEqual({ action: 'stay' });
  });
});

describe('framing', () => {
  it('rebuilds messages split across chunks', () => {
    const reader = createFrameReader();
    const wire = encodeFrame({ t: 'join', name: 'අමා' }) + encodeFrame({ t: 'leave' });
    expect(reader.push(wire.slice(0, 7))).toEqual([]);
    expect(reader.push(wire.slice(7))).toEqual([{ t: 'join', name: 'අමා' }, { t: 'leave' }]);
  });

  it('drops malformed and oversized lines and keeps going', () => {
    const reader = createFrameReader();
    expect(reader.push('{nope\n')).toEqual([]);
    expect(reader.push('x'.repeat(MAX_FRAME_CHARS + 10))).toEqual([]);
    expect(reader.push('still the same huge line\n')).toEqual([]);
    expect(reader.push(encodeFrame({ ok: true }))).toEqual([{ ok: true }]);
  });
});
