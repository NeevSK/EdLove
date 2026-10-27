import { subscribeChatTyping } from '@repo/community/hooks/useChatRealtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => {
  type Handler = (event: { payload: unknown }) => void;
  type Channel = {
    on: (event: string, filter: unknown, handler: Handler) => Channel;
    subscribe: () => Channel;
    send: (payload: unknown) => Promise<string>;
  };
  const handlers: Handler[] = [];
  const send = vi.fn(async (_payload: unknown) => 'ok');
  const remove = vi.fn(async (_channel: Channel) => undefined);
  const create = vi.fn((_key: string) => {
    const channel: Channel = {
      on: (_event, _filter, handler) => {
        handlers.push(handler);
        return channel;
      },
      subscribe: () => channel,
      send,
    };
    return channel;
  });
  return { handlers, send, remove, create };
});
vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { channel: fixture.create, removeChannel: fixture.remove },
}));

beforeEach(() => {
  fixture.handlers.length = 0;
  vi.clearAllMocks();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('chat typing resource ownership with a substituted realtime transport', () => {
  it('reuses one subscribed channel for broadcasts and stops sending after disposal', () => {
    const owner = subscribeChatTyping('channel-a', 'account-a', vi.fn());
    owner.send('Alice');
    owner.send('Alice');
    expect(fixture.create).toHaveBeenCalledTimes(1);
    expect(fixture.send).toHaveBeenCalledTimes(2);
    owner.dispose();
    owner.send('Alice');
    expect(fixture.send).toHaveBeenCalledTimes(2);
    expect(fixture.remove).toHaveBeenCalledTimes(1);
  });

  it('renews each member deadline, rejects malformed/self events, and releases every timer', async () => {
    const onTyping = vi.fn();
    const owner = subscribeChatTyping('channel-a', 'account-a', onTyping);
    const receive = fixture.handlers[0];
    if (!receive) throw new Error('Expected the actual typing subscriber to register.');
    receive({ payload: {} });
    receive({ payload: { userId: 'account-a', userName: 'Me' } });
    expect(onTyping).not.toHaveBeenCalled();
    receive({ payload: { userId: 'account-b', userName: 'Bob' } });
    await vi.advanceTimersByTimeAsync(2000);
    receive({ payload: { userId: 'account-b', userName: 'Bob' } });
    await vi.advanceTimersByTimeAsync(2000);
    expect(onTyping).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onTyping).toHaveBeenLastCalledWith('account-b', null);
    receive({ payload: { userId: 'account-c', userName: 'Carol' } });
    owner.dispose();
    expect(vi.getTimerCount()).toBe(0);
    const calls = onTyping.mock.calls.length;
    receive({ payload: { userId: 'account-b', userName: 'Late packet' } });
    await vi.advanceTimersByTimeAsync(5000);
    expect(onTyping).toHaveBeenCalledTimes(calls);
  });
});
