import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const baseChatScreen = ['BaseChatScreen.tsx', 'chatPresentation.tsx']
  .map((file) => readFileSync(resolve(import.meta.dirname, file), 'utf8'))
  .join('\n');

describe('chat delivery recovery source contract (G0)', () => {
  it('keeps queued delivery count and reconnection state visible to assistive technology', () => {
    expect(baseChatScreen).toContain('outbox.pending.length');
    expect(baseChatScreen).toContain('await outbox.submit(content)');
    expect(baseChatScreen).toContain('accessibilityLiveRegion="polite"');
    expect(baseChatScreen).toContain('saved for delivery');
  });

  it('does not silently discard queue persistence or delivery errors and gives a retry action', () => {
    expect(baseChatScreen).toContain('outbox.admission.error?.message');
    expect(baseChatScreen).toContain('outbox.rejected.length');
    expect(baseChatScreen).toContain('Retry queued messages');
    expect(baseChatScreen).toContain('Some saved messages need review before delivery.');
    expect(baseChatScreen).toContain('setFailedMessage(content)');
    expect(baseChatScreen).not.toContain('useSafeMutation');
    expect(baseChatScreen).not.toContain('storage.delete(');
  });
});
