import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const screensRoot = import.meta.dirname;
const communityScreen = readFileSync(resolve(screensRoot, 'CommunityScreen.tsx'), 'utf8');
const messagesListScreen = readFileSync(
  resolve(screensRoot, 'DirectMessagesListScreen.tsx'),
  'utf8',
);

describe('direct-message request ownership', () => {
  it('makes the community workspace the owner of embedded message loading and retries', () => {
    expect(communityScreen).toContain('messageRequestVersion');
    expect(communityScreen).toContain("type: 'RETRY_MESSAGES'");
    expect(communityScreen).toContain("onRetry={() => dispatch({ type: 'RETRY_MESSAGES' })}");
    expect(communityScreen).toContain('conversations={state.conversations}');
  });

  it('prevents the embedded list from starting a second request', () => {
    expect(messagesListScreen).toContain(
      'const isControlled = controlledConversations !== undefined;',
    );
    expect(messagesListScreen).toContain('if (!isControlled) {\n      void load();\n    }');
    expect(messagesListScreen).toContain('onRetry?: () => void;');
  });
});
