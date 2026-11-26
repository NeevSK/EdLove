import { describe, expect, it } from 'vitest';
import {
  BRIDGE_CHANNEL,
  buildPlayerDocument,
  MAX_MESSAGE_CHARS,
  parseBridgeMessage,
} from './h5pBridge';

const base = { channel: BRIDGE_CHANNEL, v: 1, playerId: 'quiz-1' } as const;

describe('parseBridgeMessage', () => {
  it('reads strings from a WebView and objects from an iframe', () => {
    expect(parseBridgeMessage(JSON.stringify({ ...base, type: 'ready' }), 'quiz-1')).toMatchObject({
      ok: true,
      message: { type: 'ready' },
    });
    expect(parseBridgeMessage({ ...base, type: 'resize', height: 420 }, 'quiz-1')).toMatchObject({
      ok: true,
      message: { height: 420 },
    });
  });

  it('refuses another player, another channel, extra fields and non-JSON', () => {
    expect(parseBridgeMessage({ ...base, type: 'ready' }, 'quiz-2')).toEqual({
      ok: false,
      reason: 'other_player',
    });
    expect(parseBridgeMessage({ ...base, channel: 'other', type: 'ready' }, 'quiz-1')).toEqual({
      ok: false,
      reason: 'not_a_bridge_message',
    });
    expect(parseBridgeMessage({ ...base, type: 'ready', eval: 'x' }, 'quiz-1')).toEqual({
      ok: false,
      reason: 'not_a_bridge_message',
    });
    expect(parseBridgeMessage('{nope', 'quiz-1')).toEqual({ ok: false, reason: 'not_json' });
  });

  it('refuses oversized messages before parsing them', () => {
    expect(parseBridgeMessage('x'.repeat(MAX_MESSAGE_CHARS + 5000), 'quiz-1')).toEqual({
      ok: false,
      reason: 'too_large',
    });
  });
});

describe('buildPlayerDocument', () => {
  const doc = buildPlayerDocument({
    playerId: 'quiz-1',
    packageUrl: 'file:///data/h5p/quiz-1/',
    assets: {
      mainJs: 'file:///data/h5p-player/main.bundle.js',
      frameJs: 'file:///data/h5p-player/frame.bundle.js',
      frameCss: 'file:///data/h5p-player/styles/h5p.css',
    },
    origin: 'file:',
    previousState: '{"answers":[0]}</script><script>alert(1)</script>',
    language: 'ta',
  });

  it('allows nothing beyond its own origin', () => {
    const csp = /Content-Security-Policy" content="([^"]+)"/.exec(doc)?.[1] ?? '';
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain('connect-src file:');
    expect(csp).not.toMatch(/https?:/);
  });

  it('cannot be broken out of by a saved state', () => {
    expect(doc).not.toContain('</script><script>alert(1)');
    expect(doc).toContain('\\u003c/script>');
  });

  it('turns off H5P buttons that would reach the network', () => {
    expect(doc).toContain('"export":false');
    expect(doc).toContain('"embed":false');
    expect(doc).toContain('<html lang="ta">');
  });
});
