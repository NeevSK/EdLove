import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text, View } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { haptic } from '../../../utils/haptics';
import { groupFabActions, remainingNote, shouldAnnounce } from '../../shared/agent';
import {
  ApprovalCard,
  ArtifactCard,
  Citation,
  PrivacyState,
  RunStatus,
  ThinkingTrace,
  ToolCallCard,
} from '../Agent/AgentCards';
import { Composer } from '../Agent/Composer';
import { ActionFab, FabMenu } from '../Agent/Fab';
import { MessageBubble, MessageList } from '../Agent/Message';
import { RichTextEditor } from '../Media/RichTextEditor';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
// Native-only renderers are replaced so the kit's own behaviour is tested:
// Markdown shows its source as text, the rich editor is absent (fallback),
// and Legend List renders every item.
vi.mock('../Media/EnrichedMarkdownAdapter', () => ({
  EnrichedMarkdownAdapter: ({ source }: { source: string }) => {
    const { Text: T } = require('react-native');
    return <T>{source}</T>;
  },
}));
vi.mock('../Media/EnrichedRichTextAdapter', () => ({ EnrichedRichTextAdapter: undefined }));
vi.mock('../Media/ExpoVideoAdapter', () => ({ ExpoVideoAdapter: undefined }));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('@legendapp/list/react-native', async () => {
  const { View: Host } = await import('react-native');
  type Props = {
    data: readonly unknown[];
    keyExtractor: (item: unknown) => string;
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    'aria-label'?: string;
    role?: import('react-native').Role;
  };
  function LegendList({ data, keyExtractor, renderItem, ...rest }: Props) {
    return (
      <Host role={rest.role} aria-label={rest['aria-label']}>
        {data.map((item, index) => (
          <Host key={keyExtractor(item)}>{renderItem({ item, index })}</Host>
        ))}
      </Host>
    );
  }
  return { LegendList };
});

beforeEach(() => vi.mocked(haptic).mockClear());
afterEach(() => vi.restoreAllMocks());

describe('agent rules', { tags: ['unit'] }, () => {
  it('announces a message once, when it completes', () => {
    expect(shouldAnnounce('streaming', 'complete')).toBe(true);
    expect(shouldAnnounce('complete', 'complete')).toBe(false);
    expect(shouldAnnounce(undefined, 'complete')).toBe(false);
    expect(shouldAnnounce('streaming', 'streaming')).toBe(false);
  });

  it('shows characters left only in the last fifth', () => {
    expect(remainingNote(10, 100)).toBeNull();
    expect(remainingNote(85, 100)).toBe(15);
    expect(remainingNote(104, 100)).toBe(-4);
    expect(remainingNote(10, undefined)).toBeNull();
  });
});

describe('MessageBubble', { tags: ['a11y', 'unit'] }, () => {
  it('own words sit on the lamp, replies on paper', async () => {
    const m = resolveWorld('wewa', 'morning', 'light').recipes.message;
    await render(
      <WorldScope world="wewa" phase="morning" mode="light">
        <MessageBubble author="self" content="Hello" />
        <MessageBubble author="assistant" content="Ayubowan" />
      </WorldScope>,
    );
    const own = screen.getByLabelText('You');
    const reply = screen.getByLabelText('Gurudevi');
    expect(own.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: m.self.fill })]),
    );
    expect(reply.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: m.other.fill })]),
    );
  });

  it('is busy while streaming and announced once when complete', async () => {
    const announce = vi
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const { rerender } = await render(
      <MessageBubble author="assistant" content="Thin" state="streaming" />,
    );
    expect(screen.getByLabelText('Gurudevi').props.accessibilityState).toMatchObject({
      busy: true,
    });
    expect(announce).not.toHaveBeenCalled();
    await rerender(<MessageBubble author="assistant" content="Thinking done." state="complete" />);
    await rerender(<MessageBubble author="assistant" content="Thinking done." state="complete" />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('Gurudevi: Thinking done.');
  });

  it('a failed reply says so and offers retry', async () => {
    const onRetry = vi.fn();
    await render(<MessageBubble author="assistant" content="" state="failed" onRetry={onRetry} />);
    expect(screen.getByRole('alert').props.children).toBe('This reply did not arrive.');
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('MessageList', { tags: ['a11y', 'unit'] }, () => {
  it('is a named list of messages; empty shows its state', async () => {
    const { unmount } = await render(
      <MessageList
        label="Conversation"
        items={['a', 'b']}
        keyOf={(x) => x}
        renderItem={(x) => <Text>{x}</Text>}
      />,
    );
    expect(screen.getByLabelText('Conversation').props.role).toBe('list');
    expect(screen.getByText('a')).toBeTruthy();
    expect(screen.getByText('b')).toBeTruthy();
    await unmount();
    await render(
      <MessageList
        label="Conversation"
        items={[]}
        keyOf={(x: string) => x}
        renderItem={() => null}
        empty={{ title: 'Ask anything' }}
      />,
    );
    expect(screen.getByText('Ask anything')).toBeTruthy();
  });
});

describe('Composer', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('cannot send nothing; sends text; becomes Stop while busy', async () => {
    const onSend = vi.fn();
    const onStop = vi.fn();
    const { rerender } = await render(
      <Composer label="Message" value="" onChange={() => {}} onSend={onSend} />,
    );
    expect(screen.getByRole('button', { name: 'Send' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await rerender(<Composer label="Message" value="Hi" onChange={() => {}} onSend={onSend} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).toHaveBeenCalledTimes(1);
    await rerender(
      <Composer
        label="Message"
        value=""
        onChange={() => {}}
        onSend={onSend}
        busy
        onStop={onStop}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalled();
  });

  it('past the limit it says how far over and will not send', async () => {
    await render(
      <Composer
        label="Message"
        value={'x'.repeat(12)}
        onChange={() => {}}
        onSend={() => {}}
        maxLength={10}
      />,
    );
    expect(screen.getByText('-2 characters left')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('attached files wait in a tray and can be removed', async () => {
    const onRemove = vi.fn();
    const file = { name: 'Plan.pdf', uri: 'file:///p.pdf' };
    await render(
      <Composer
        label="Message"
        value=""
        onChange={() => {}}
        onSend={() => {}}
        attachments={[file]}
        onRemoveAttachment={onRemove}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledWith(file);
    expect(screen.getByRole('button', { name: 'Send' }).props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });
});

describe('agent cards', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('thinking is collapsed until asked, and says how long it took', async () => {
    await render(<ThinkingTrace content="First, the sun." state="done" seconds={12} />);
    const toggle = screen.getByRole('button', { name: 'Thought for 12 s' });
    expect(screen.queryByText('First, the sun.')).toBeNull();
    await fireEvent.press(toggle);
    expect(screen.getByText('First, the sun.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thought for 12 s' }).props['aria-expanded']).toBe(
      true,
    );
  });

  it('a tool call says what it does and how it went; a failure offers retry', async () => {
    const onRetry = vi.fn();
    await render(
      <ToolCallCard
        title="Searching attendance"
        detail="Grade 7B"
        state="failed"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByLabelText('Searching attendance, Did not finish')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('an approval waits, then says what happened, and is felt once', async () => {
    const onAccept = vi.fn();
    const props = { title: 'Save lesson draft', onAccept, onDiscard: () => {} };
    const { rerender } = await render(<ApprovalCard {...props} state="pending" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Accept' }));
    expect(onAccept).toHaveBeenCalled();
    await rerender(<ApprovalCard {...props} state="submitting" />);
    expect(screen.getByRole('button', { name: 'Discard' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await rerender(<ApprovalCard {...props} state="accepted" />);
    expect(screen.getByRole('alert').props.children).toBe('Accepted and saved.');
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
    await rerender(<ApprovalCard {...props} state="accepted" />);
    expect(vi.mocked(haptic).mock.calls.filter(([k]) => k === 'success')).toHaveLength(1);
  });

  it('a failed approval says nothing changed and can be tried again', async () => {
    await render(
      <ApprovalCard title="Save" state="failed" onAccept={() => {}} onDiscard={() => {}} />,
    );
    expect(screen.getByRole('alert').props.children).toBe('Could not save. Nothing was changed.');
    expect(screen.getByRole('button', { name: 'Accept' })).toBeTruthy();
  });

  it('a run lists its steps and can be cancelled while working', async () => {
    const onCancel = vi.fn();
    await render(
      <RunStatus
        steps={[
          { label: 'Read attendance', state: 'done' },
          { label: 'Draft summary', state: 'running' },
          { label: 'Check privacy', state: 'pending' },
        ]}
        elapsed="1 min 12 s"
        onCancel={onCancel}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByLabelText('Draft summary, Working')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('a citation is a named link; an HTML artifact says it opens sealed', async () => {
    const onOpen = vi.fn();
    await render(
      <View>
        <Citation index={2} title="Term plan" onOpen={onOpen} />
        <ArtifactCard title="Quiz page" kind="html" onOpen={onOpen} />
      </View>,
    );
    await fireEvent.press(screen.getByRole('link', { name: 'Source 2: Term plan' }));
    expect(screen.getByRole('button', { name: 'Quiz page' }).props.accessibilityHint).toBe(
      'Opens in a sealed view',
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('privacy is always said; when allowed it can be switched', async () => {
    const onChange = vi.fn();
    await render(<PrivacyState mode="incognito" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: /Incognito/ }).props.accessibilityState).toMatchObject(
      { checked: true },
    );
    await fireEvent.press(screen.getByRole('radio', { name: /Temporary/ }));
    expect(onChange).toHaveBeenCalledWith('temporary');
  });
});

describe('ActionFab and FabMenu', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('the floating action is named, signals in words, and presses with feedback', async () => {
    const onPress = vi.fn();
    const { rerender } = await render(
      <ActionFab label="Classroom actions" onPress={onPress} signal signalLabel="2 need you" />,
    );
    const fab = screen.getByRole('button', { name: 'Classroom actions, 2 need you' });
    await fireEvent(fab, 'pressIn');
    await fireEvent.press(fab);
    expect(onPress).toHaveBeenCalled();
    expect(haptic).toHaveBeenCalled();
    await rerender(<ActionFab label="Classroom actions" onPress={onPress} hidden />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('the menu closes before an action runs', async () => {
    const order: string[] = [];
    await render(
      <FabMenu
        open
        onClose={() => order.push('close')}
        label="Actions"
        actions={[{ key: 'ai', label: 'Ask Gurudevi', onPress: () => order.push('ai') }]}
      />,
    );
    await act(async () => {});
    await fireEvent.press(screen.getByRole('button', { name: 'Ask Gurudevi' }));
    expect(order).toEqual(['close', 'ai']);
  });

  it('groups actions: loose ones first, then each named group in listed order', async () => {
    const run = () => {};
    const actions = [
      { key: 'new', label: 'New lesson', onPress: run },
      { key: 'ask', label: 'Ask', group: 'AI companion', onPress: run },
      { key: 'reset', label: 'Breathing reset', onPress: run },
      { key: 'quiet', label: 'Incognito ask', group: 'AI companion', onPress: run },
    ];
    expect(groupFabActions(actions).map((s) => [s.group, s.actions.map((a) => a.key)])).toEqual([
      [undefined, ['new', 'reset']],
      ['AI companion', ['ask', 'quiet']],
    ]);
    await render(<FabMenu open onClose={() => {}} label="Actions" actions={actions} />);
    await act(async () => {});
    expect(screen.getByText('AI companion')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Incognito ask' })).toBeTruthy();
  });
});

describe('RichTextEditor port', { tags: ['unit'] }, () => {
  it('with no adapter, a plain field still takes Markdown', async () => {
    const onChange = vi.fn();
    await render(<RichTextEditor label="Lesson notes" value="" onChange={onChange} />);
    await fireEvent.changeText(screen.getByLabelText('Lesson notes'), '**Bold**');
    expect(onChange).toHaveBeenCalledWith('**Bold**');
  });
});
