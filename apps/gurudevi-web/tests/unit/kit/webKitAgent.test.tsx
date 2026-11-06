import {
  ActionFab,
  FabMenu,
  ApprovalCard,
  ArtifactCard,
  Citation,
  Composer,
  MessageBubble,
  MessageList,
  PrivacyState,
  RichTextEditor,
  RunStatus,
  ThinkingTrace,
  ToolCallCard,
} from '@repo/ui/components/web';
import { resolveWorld, worldCssVariables } from '@repo/ui/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

describe('web kit: conversation', () => {
  it('a bubble is a named group, busy while streaming, said once when complete', () => {
    const { rerender } = render(
      <MessageBubble author="assistant" content="Thin" state="streaming" />,
    );
    const group = screen.getByRole('group', { name: 'Gurudevi' });
    expect(group.getAttribute('aria-busy')).toBe('true');
    rerender(<MessageBubble author="assistant" content="All done." state="complete" />);
    expect(screen.getByText('Gurudevi: All done.').getAttribute('aria-live')).toBe('polite');
    expect(group.hasAttribute('aria-busy')).toBe(false);
  });

  it('a failed reply says so and offers retry', async () => {
    const onRetry = vi.fn();
    render(<MessageBubble author="assistant" content="" state="failed" onRetry={onRetry} />);
    expect(screen.getByRole('alert').textContent).toBe('This reply did not arrive.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  // The real Legend List runs here; jsdom has no layout, so it draws no rows.
  // Rows, end-pinning and keeping place are checked in the browser gallery (G4).
  it('the list is a named list; empty shows its state', () => {
    const { unmount } = render(
      <MessageList
        label="Conversation"
        items={['a', 'b']}
        keyOf={(x) => x}
        renderItem={(x) => <p>{x}</p>}
      />,
    );
    expect(screen.getByRole('list', { name: 'Conversation' })).toBeTruthy();
    unmount();
    render(
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

  it('Enter sends, Shift+Enter does not, nothing cannot be sent, busy shows Stop', async () => {
    const onSend = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(
      <Composer label="Message" value="" onChange={() => {}} onSend={onSend} />,
    );
    expect((screen.getByRole('button', { name: 'Send' }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<Composer label="Message" value="Hi" onChange={() => {}} onSend={onSend} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Message' }),
      '{Shift>}{Enter}{/Shift}',
    );
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), '{Enter}');
    expect(onSend).toHaveBeenCalledTimes(1);
    rerender(
      <Composer
        label="Message"
        value=""
        onChange={() => {}}
        onSend={onSend}
        busy
        onStop={onStop}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalled();
  });
});

describe('web kit: agent cards', () => {
  it('thinking is a native disclosure, closed until asked', async () => {
    render(<ThinkingTrace content="First, the sun." state="done" seconds={12} />);
    const details = screen.getByText('Thought for 12 s').closest('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    await userEvent.click(screen.getByText('Thought for 12 s'));
    expect(details.open).toBe(true);
  });

  it('a tool call, an approval and a run say what happened in words', async () => {
    const onAccept = vi.fn();
    render(
      <>
        <ToolCallCard title="Searching attendance" state="done" result="12 present" />
        <ApprovalCard
          title="Save lesson draft"
          state="pending"
          onAccept={onAccept}
          onDiscard={() => {}}
        />
        <RunStatus
          steps={[
            { label: 'Read', state: 'done' },
            { label: 'Draft', state: 'running' },
          ]}
        />
      </>,
    );
    expect(screen.getByRole('region', { name: 'Searching attendance, Done' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(onAccept).toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Save lesson draft' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('an accepted approval no longer offers its buttons', () => {
    render(<ApprovalCard title="Save" state="accepted" onAccept={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('alert').textContent).toBe('Accepted and saved.');
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
  });

  it('citations, artifacts, privacy and the floating action are named', async () => {
    const onOpen = vi.fn();
    const onChange = vi.fn();
    render(
      <>
        <Citation index={1} title="Term plan" onOpen={onOpen} />
        <ArtifactCard title="Quiz page" kind="html" onOpen={onOpen} />
        <PrivacyState mode="incognito" onChange={onChange} />
        <ActionFab label="Actions" onPress={onOpen} signal signalLabel="2 need you" />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Source 1: Term plan' }));
    expect(screen.getByRole('button', { name: /Quiz page.*sealed/ })).toBeTruthy();
    await userEvent.click(screen.getByRole('radio', { name: /Temporary/ }));
    expect(onChange).toHaveBeenCalledWith('temporary');
    expect(screen.getByRole('button', { name: 'Actions, 2 need you' })).toBeTruthy();
  });

  it('rich text falls back to a plain Markdown field until an editor is chosen', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor label="Lesson notes" value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Lesson notes' }), '*');
    expect(onChange).toHaveBeenCalledWith('*');
  });

  it('bubble and card colours come from the world', () => {
    const w = resolveWorld('kandyan', 'dusk', 'dark');
    const vars = worldCssVariables(w);
    expect(vars['--w-msg-self-bg']).toBe(w.recipes.message.self.fill);
    expect(vars['--w-agent-failed']).toBe(w.recipes.message.state.failed);
  });

  it('FabMenu renders grouped actions and closes when an action is selected', async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    render(
      <FabMenu
        open={true}
        onClose={onClose}
        label="Companion & Quick Actions"
        actions={[
          {
            key: 'tutii',
            label: 'Tutii AI Companion',
            hint: 'Direct mentor conversation',
            tone: 'lamp',
            group: 'Tutii & Intelligence',
            onPress: onAction,
          },
        ]}
      />,
    );
    expect(screen.getByText('Companion & Quick Actions')).toBeTruthy();
    expect(screen.getByText('Tutii & Intelligence')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Tutii AI Companion/ }));
    expect(onClose).toHaveBeenCalled();
    expect(onAction).toHaveBeenCalled();
  });
});
