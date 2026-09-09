import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ChatComposer } from '../ChatComposer';

vi.mock('@repo/ui/hooks/useTheme', () => ({
  useTheme: () => ({ text: { muted: '#8A8175' } }),
}));

vi.mock('@repo/ui/icons', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/ui/icons')>()),
  Image: 'ImageIcon',
  Send: 'SendIcon',
}));

function renderComposer(element: React.ReactElement) {
  return render(element);
}

describe('ChatComposer interaction flow', () => {
  it('renders its input outside a chat provider, updates the draft, and sends it', async () => {
    const onChangeText = vi.fn();
    const onSend = vi.fn();
    const onPressAttachment = vi.fn();

    const { getByLabelText, queryByLabelText } = await renderComposer(
      <ChatComposer
        value="hello"
        onChangeText={onChangeText}
        onSend={onSend}
        onPressAttachment={onPressAttachment}
      />,
    );

    const input = getByLabelText('Message input');
    fireEvent.changeText(input, 'hello there');
    expect(onChangeText).toHaveBeenCalledWith('hello there');

    fireEvent.press(getByLabelText('Send message'));
    expect(onSend).toHaveBeenCalledTimes(1);

    fireEvent.press(getByLabelText('Add attachment'));
    expect(onPressAttachment).toHaveBeenCalledTimes(1);
  });

  it('does not send whitespace and exposes the attachment action', async () => {
    const onSend = vi.fn();
    const { getByLabelText, queryByLabelText } = await renderComposer(
      <ChatComposer value="   " onChangeText={vi.fn()} onSend={onSend} />,
    );

    expect(queryByLabelText('Send message')).toBeNull();
    expect(onSend).not.toHaveBeenCalled();
  });
});
