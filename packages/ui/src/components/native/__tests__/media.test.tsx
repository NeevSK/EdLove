import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import type { DocumentAdapterProps, NativeMarkdownAdapterProps } from '../../../theme/contracts';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { fileKindOf, formatBytes, safeFileUrl } from '../../shared/files';
import { MediaAdapters } from '../Media/adapters';
import { DocumentView } from '../Media/DocumentView';
import { FILE_CARD_ENGLISH, FileCard } from '../Media/FileCard';
import { Markdown } from '../Media/Markdown';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
// The test engine cannot draw the native markdown view; the default adapter is
// replaced by name so the port's own behaviour is what is tested.
vi.mock('../Media/EnrichedMarkdownAdapter', () => ({ EnrichedMarkdownAdapter: undefined }));

const PDF = {
  name: 'Term plan.pdf',
  uri: 'file:///term.pdf',
  mime: 'application/pdf',
  size: 840_000,
};

describe('file kinds', { tags: ['unit'] }, () => {
  it('reads the kind from a specific type, else from the name', () => {
    expect(fileKindOf({ name: 'x', mime: 'application/pdf' })).toBe('pdf');
    expect(fileKindOf({ name: 'marks.xlsx', mime: 'application/octet-stream' })).toBe('sheet');
    expect(fileKindOf({ name: 'Lesson.PPTX' })).toBe('slides');
    expect(fileKindOf({ name: 'notes.md' })).toBe('markdown');
    expect(fileKindOf({ name: 'voice.m4a' })).toBe('audio');
    expect(fileKindOf({ name: 'README' })).toBe('other');
  });

  it('only web, blob, file and relative addresses are safe to link or frame', () => {
    expect(safeFileUrl('https://x.org/a.pdf')).toBe('https://x.org/a.pdf');
    expect(safeFileUrl('blob:https://x.org/1')).toBe('blob:https://x.org/1');
    expect(safeFileUrl('/files/a.pdf')).toBe('/files/a.pdf');
    expect(safeFileUrl('javascript:alert(1)')).toBeNull();
    expect(safeFileUrl(' JavaScript:alert(1)')).toBeNull();
    expect(safeFileUrl('data:text/html,<script>')).toBeNull();
    expect(safeFileUrl('')).toBeNull();
    // Browsers drop these inside a URL, so each one would still run as javascript:.
    expect(safeFileUrl('java\tscript:alert(1)')).toBeNull();
    expect(safeFileUrl('java\nscript:alert(1)')).toBeNull();
    expect(safeFileUrl('\u0000javascript:alert(1)')).toBeNull();
    expect(safeFileUrl('//evil.example/a.pdf')).toBeNull();
    expect(safeFileUrl('files/a.pdf')).toBe('files/a.pdf');
    expect(safeFileUrl('a.pdf?x=1:2')).toBe('a.pdf?x=1:2');
  });

  it('formats sizes for people', () => {
    expect(formatBytes(512, 'en')).toBe('512 B');
    expect(formatBytes(840_000, 'en')).toBe('820 KB');
    expect(formatBytes(4.4 * 1024 * 1024, 'en')).toBe('4.4 MB');
  });
});

describe('Markdown port', { tags: ['unit'] }, () => {
  it('hands the source and the world prose to the chosen adapter', async () => {
    const seen: NativeMarkdownAdapterProps[] = [];
    function Probe(props: NativeMarkdownAdapterProps) {
      seen.push(props);
      return <Text>drawn</Text>;
    }
    await render(
      <WorldScope world="wewa" phase="morning" mode="light">
        <MediaAdapters adapters={{ markdown: Probe }}>
          <Markdown source="# Hi" tone="lamp" />
        </MediaAdapters>
      </WorldScope>,
    );
    expect(screen.getByText('drawn')).toBeTruthy();
    expect(seen.at(-1)?.source).toBe('# Hi');
    expect(seen.at(-1)?.prose).toBe(resolveWorld('wewa', 'morning', 'light').recipes.prose.lamp);
  });

  it('with no adapter, every paragraph still shows as text', async () => {
    await render(<Markdown source={'First line.\n\nSecond line.'} />);
    expect(screen.getByText('First line.')).toBeTruthy();
    expect(screen.getByText('Second line.')).toBeTruthy();
  });
});

describe('FileCard', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('names the file, says its kind and size, and opens', async () => {
    const onOpen = vi.fn();
    await render(<FileCard file={PDF} onOpen={onOpen} />);
    const card = screen.getByRole('button', { name: 'Term plan.pdf' });
    expect(card.props.accessibilityHint).toBe('PDF · 820 KB');
    await fireEvent.press(card);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('announces an error and offers retry; progress is hidden while failed', async () => {
    const onRetry = vi.fn();
    await render(
      <FileCard file={PDF} progress={0.4} error="The upload stopped." onRetry={onRetry} />,
    );
    expect(screen.getByRole('alert').props.children).toBe('The upload stopped.');
    expect(screen.queryByText('40% uploaded')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('speaks the reader language', async () => {
    await render(
      <FileCard file={PDF} labels={{ kinds: { ...FILE_CARD_ENGLISH.kinds, pdf: 'PDF ගොනුව' } }} />,
    );
    expect(screen.getByLabelText(/PDF ගොනුව/)).toBeTruthy();
  });
});

describe('DocumentView port', { tags: ['unit'] }, () => {
  it('uses the adapter for the kind, and falls back to a card when it fails', async () => {
    let fail: (() => void) | undefined;
    function Pdf({ file, onError }: DocumentAdapterProps) {
      fail = onError;
      return <View testID="pdf" accessibilityLabel={file.name} />;
    }
    await render(
      <MediaAdapters adapters={{ documents: { pdf: Pdf } }}>
        <DocumentView file={PDF} onOpenElsewhere={() => {}} />
      </MediaAdapters>,
    );
    expect(screen.getByTestId('pdf')).toBeTruthy();
    await act(() => fail?.());
    expect(screen.queryByTestId('pdf')).toBeNull();
    expect(screen.getByRole('button', { name: 'Term plan.pdf' })).toBeTruthy();
  });

  it('with no adapter for the kind, a person still reaches the file', async () => {
    await render(
      <DocumentView
        file={{ name: 'Marks.xlsx', uri: 'file:///m.xlsx' }}
        onOpenElsewhere={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Marks.xlsx' }).props.accessibilityHint).toBe(
      'Spreadsheet',
    );
  });
});
