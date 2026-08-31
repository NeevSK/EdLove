import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const baseChatScreen = readFileSync(resolve(import.meta.dirname, 'BaseChatScreen.tsx'), 'utf8');

describe('chat delivery recovery', () => {
  it('keeps queued delivery count and reconnection state visible to assistive technology', () => {
    expect(baseChatScreen).toContain('setQueuedMessageCount(queued.length);');
    expect(baseChatScreen).toContain('deliverQueuedMessages(queued, sendMessage)');
    expect(baseChatScreen).toContain('accessibilityLiveRegion="polite"');
    expect(baseChatScreen).toContain('queued securely');
  });

  it('does not silently discard queue persistence or delivery errors and gives a retry action', () => {
    expect(baseChatScreen).toContain(
      "console.error('[BaseChatScreen] could not persist queued message', error);",
    );
    expect(baseChatScreen).toContain(
      "console.error('[BaseChatScreen] queued send error', result.error);",
    );
    expect(baseChatScreen).toContain('Retry queued messages');
    expect(baseChatScreen).toContain('Some queued messages could not send yet.');
  });
});
