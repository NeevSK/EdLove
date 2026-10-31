import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CapturePorts, FileItem, FileRef, RecorderPort } from '../../../theme/contracts';
import { haptic } from '../../../utils/haptics';
import { FILE_CARD_ENGLISH } from '../../shared/files';
import { checkFiles, formatDuration, MEDIA_ENGLISH, rulesText } from '../../shared/media';
import { MediaAdapters } from '../Media/adapters';
import { AudioRecord, FileField, ImageCapture } from '../Media/Capture';
import { Media } from '../Media/Media';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
// Native-only renderers are replaced so the kit's behaviour is what is tested.
vi.mock('../Media/EnrichedMarkdownAdapter', () => ({ EnrichedMarkdownAdapter: undefined }));
vi.mock('../Media/EnrichedRichTextAdapter', () => ({ EnrichedRichTextAdapter: undefined }));
vi.mock('../Media/ExpoVideoAdapter', () => ({ ExpoVideoAdapter: undefined }));
// expo-image and expo-linear-gradient share one stand-in file here, so the original exports stay.
vi.mock('expo-image', async (importOriginal) => {
  const { View } = await import('react-native');
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    Image: (props: { accessibilityLabel?: string; accessible?: boolean; onError?: () => void }) => (
      <View testID="image" {...props} />
    ),
  };
});

beforeEach(() => vi.mocked(haptic).mockClear());

const PDF: FileRef = {
  name: 'Plan.pdf',
  uri: 'file:///p.pdf',
  mime: 'application/pdf',
  size: 2_000,
};
const BIG: FileRef = {
  name: 'Huge.pdf',
  uri: 'file:///h.pdf',
  mime: 'application/pdf',
  size: 9_000_000,
};
const EXE: FileRef = { name: 'tool.exe', uri: 'file:///t.exe', size: 10 };
const PHOTO: FileRef = { name: 'Leaf.jpg', uri: 'file:///leaf.jpg', mime: 'image/jpeg' };

describe('file rules', { tags: ['unit'] }, () => {
  it('refuses by kind, size, count and unsafe address, in order, keeping each reason', () => {
    const evil = { name: 'x.pdf', uri: 'javascript:alert(1)' };
    const r = checkFiles(
      [PDF, BIG, EXE, evil, PDF],
      { accept: ['pdf'], maxBytes: 5_000_000, maxFiles: 2 },
      1,
    );
    expect(r.accepted).toEqual([PDF]);
    expect(r.rejected.map((x) => x.reason)).toEqual(['size', 'type', 'unsafe', 'count']);
  });

  it('says the rules before choosing, and times like a clock', () => {
    expect(
      rulesText(
        { maxFiles: 3, maxBytes: 10 * 1024 * 1024, accept: ['pdf', 'image'] },
        MEDIA_ENGLISH,
        FILE_CARD_ENGLISH.kinds,
        'en',
      ),
    ).toBe('Up to 3 files, 10 MB each, PDF, Image');
    expect(formatDuration(42_500)).toBe('0:42');
    expect(formatDuration(725_000)).toBe('12:05');
  });
});

describe('Media', { tags: ['a11y', 'unit'] }, () => {
  it('an image speaks its alt; a decorative one is hidden; a broken one becomes a card', async () => {
    const { unmount } = await render(<Media file={PHOTO} alt="A green leaf" aspect={4 / 3} />);
    expect(screen.getByTestId('image').props.accessibilityLabel).toBe('A green leaf');
    await act(() => screen.getByTestId('image').props.onError());
    expect(screen.getByRole('alert').props.children).toBe('This cannot be played here.');
    await unmount();
    await render(<Media file={PHOTO} decorative />);
    expect(screen.getByTestId('image', { includeHiddenElements: true }).props.accessible).toBe(
      false,
    );
  });

  it('a voice clip with no player becomes a card, and its transcript is offered', async () => {
    await render(
      <Media file={{ name: 'Answer.m4a', uri: 'file:///a.m4a' }} transcript="The sun warms us." />,
    );
    expect(screen.getByLabelText(/Answer\.m4a/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Show transcript' }));
    expect(screen.getByText('The sun warms us.')).toBeTruthy();
  });
});

function withPorts(capture: CapturePorts, node: React.ReactNode) {
  return <MediaAdapters adapters={{ capture }}>{node}</MediaAdapters>;
}

describe('FileField', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('without a picker it says so, rather than offering a dead button', async () => {
    await render(<FileField label="Homework" files={[]} onAdd={() => {}} onRemove={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Choose files' })).toBeNull();
    expect(screen.getByText('This cannot be played here.')).toBeTruthy();
  });

  it('adds what passes the rules and says why the rest were refused', async () => {
    const onAdd = vi.fn();
    const pickFiles = vi.fn(async () => ({ status: 'ok' as const, value: [PDF, BIG] }));
    await render(
      withPorts(
        { pickFiles },
        <FileField
          label="Homework"
          files={[]}
          onAdd={onAdd}
          onRemove={() => {}}
          accept={['pdf']}
          maxBytes={5_000_000}
        />,
      ),
    );
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Choose files' })));
    expect(pickFiles).toHaveBeenCalledWith({ accept: ['pdf'], multiple: true });
    expect(onAdd).toHaveBeenCalledWith([PDF]);
    expect(screen.getByText('Huge.pdf is too large.')).toBeTruthy();
    expect(haptic).toHaveBeenCalledWith('warning');
  });

  it('a refused permission is said in plain words', async () => {
    await render(
      withPorts(
        { pickFiles: async () => ({ status: 'denied' }) },
        <FileField label="Homework" files={[]} onAdd={() => {}} onRemove={() => {}} />,
      ),
    );
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Choose files' })));
    expect(screen.getByText(/Photos are off for Gurudevi/)).toBeTruthy();
  });

  it('shows each file with progress and error; full fields cannot add more', async () => {
    const onRetry = vi.fn();
    const files: FileItem[] = [{ ...PDF, error: 'The upload stopped.' }];
    await render(
      withPorts(
        { pickFiles: async () => ({ status: 'cancelled' }) },
        <FileField
          label="Homework"
          files={files}
          onAdd={() => {}}
          onRemove={() => {}}
          onRetry={onRetry}
          maxFiles={1}
        />,
      ),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledWith(files[0]);
    expect(
      screen.getByRole('button', { name: 'Choose files' }).props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });
});

describe('ImageCapture', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('takes a photo, shows it, and offers another', async () => {
    function Harness() {
      const [photo, setPhoto] = useState<FileRef | undefined>();
      return (
        <ImageCapture
          label="Your leaf"
          value={photo}
          onCaptured={setPhoto}
          onClear={() => setPhoto(undefined)}
        />
      );
    }
    await render(
      withPorts({ pickImage: async () => ({ status: 'ok', value: PHOTO }) }, <Harness />),
    );
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Take a photo' })));
    expect(screen.getByTestId('image').props.accessibilityLabel).toBe('Your leaf');
    expect(screen.getByRole('button', { name: 'Take another' })).toBeTruthy();
    expect(haptic).toHaveBeenCalledWith('success');
  });

  it('a refused camera is said', async () => {
    await render(
      withPorts(
        { pickImage: async () => ({ status: 'denied' }) },
        <ImageCapture label="Leaf" onCaptured={() => {}} />,
      ),
    );
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Take a photo' })));
    expect(screen.getByText(/The camera is off/)).toBeTruthy();
  });
});

describe('AudioRecord', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  function fakeRecorder(granted = true) {
    const state = { recording: false, elapsedMs: 0 };
    const listeners = new Set<() => void>();
    const bump = () => {
      for (const l of listeners) l();
    };
    const port = {
      prepare: vi.fn(async () => granted),
      start: vi.fn(async () => {
        state.recording = true;
        bump();
      }),
      stop: vi.fn(async () => {
        state.recording = false;
        bump();
        return { name: 'voice.m4a', uri: 'file:///v.m4a', durationMs: state.elapsedMs };
      }),
    };
    function useRecorder(): RecorderPort {
      const [, force] = useState(0);
      listeners.add(() => force((n) => n + 1));
      return { ...port, recording: state.recording, elapsedMs: state.elapsedMs };
    }
    const tick = (ms: number) => {
      state.elapsedMs = ms;
      bump();
    };
    return { port, useRecorder, tick };
  }

  it('records, and the limit stops it so it is never cut short silently', async () => {
    const onRecorded = vi.fn();
    const r = fakeRecorder();
    await render(
      withPorts(
        { useRecorder: r.useRecorder },
        <AudioRecord label="Your answer" onRecorded={onRecorded} maxSeconds={60} />,
      ),
    );
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Record' })));
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeTruthy();
    await act(async () => r.tick(30_000));
    expect(screen.getByText('0:30 of 1:00')).toBeTruthy();
    await act(async () => r.tick(60_000));
    expect(r.port.stop).toHaveBeenCalledTimes(1);
    expect(onRecorded).toHaveBeenCalledWith(expect.objectContaining({ durationMs: 60_000 }));
  });

  it('a refused microphone is said; without a recorder it says so', async () => {
    const r = fakeRecorder(false);
    const { unmount } = await render(
      withPorts(
        { useRecorder: r.useRecorder },
        <AudioRecord label="Answer" onRecorded={() => {}} />,
      ),
    );
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Record' })));
    expect(screen.getByText(/The microphone is off/)).toBeTruthy();
    expect(r.port.start).not.toHaveBeenCalled();
    await unmount();
    await render(<AudioRecord label="Answer" onRecorded={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Record' })).toBeNull();
  });
});
