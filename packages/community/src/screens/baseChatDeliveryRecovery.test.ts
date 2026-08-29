import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const baseChatScreen = readFileSync(resolve(import.meta.dirname, 'BaseChatScreen.tsx'), 'utf8');

describe('chat delivery recovery', () => {
  it('keeps an offline send visible as queued rather than reporting a false failure', () => {
    expect(baseChatScreen).toContain(
      'if (queueMessage(content)) {\n          setQueuedMessage(content);',
    );
    expect(baseChatScreen).toContain(
      'Message queued securely. It will send when the connection returns.',
    );
  });

  it('does not silently discard queue persistence or background delivery errors', () => {
    expect(baseChatScreen).toContain(
      "console.error('[BaseChatScreen] could not persist queued message', error);",
    );
    expect(baseChatScreen).toContain("console.error('[BaseChatScreen] queued send error', error);");
    expect(baseChatScreen).toContain('Message could not be sent or queued.');
  });
});
