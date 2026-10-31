import { DocumentView, FileCard, Markdown, MediaAdapters } from '@repo/ui/components/web';
import type { DocumentAdapterProps, MarkdownAdapterProps } from '@repo/ui/theme';
import { resolveWorld, worldCssVariables } from '@repo/ui/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const PDF = {
  name: 'Term plan.pdf',
  uri: '/files/term.pdf',
  mime: 'application/pdf',
  size: 840_000,
};

describe('web kit: Markdown port', () => {
  it('without an adapter, paragraphs are plain text, never HTML', () => {
    const { container } = render(<Markdown source={'Hello <b>there</b>\n\nSecond'} />);
    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText('Hello <b>there</b>')).toBeTruthy();
    expect(container.querySelector('.gd-prose')?.getAttribute('data-tone')).toBe('ground');
  });

  it('an adapter draws inside the world prose', () => {
    function Probe({ source }: MarkdownAdapterProps) {
      return <h1>{source.replace('# ', '')}</h1>;
    }
    const { container } = render(
      <MediaAdapters adapters={{ markdown: Probe }}>
        <Markdown source="# Lesson" tone="lamp" />
      </MediaAdapters>,
    );
    expect(screen.getByRole('heading', { name: 'Lesson' }).closest('.gd-prose')).toBe(
      container.querySelector('.gd-prose[data-tone="lamp"]'),
    );
  });
});

describe('web kit: FileCard and DocumentView', () => {
  it('a file with href is a download link; an error is announced with retry', async () => {
    const onRetry = vi.fn();
    render(
      <FileCard
        file={PDF}
        href={PDF.uri}
        error="The upload stopped."
        onRetry={onRetry}
        lang="en"
      />,
    );
    const link = screen.getByRole('link', { name: /Term plan\.pdf/ });
    expect(link.getAttribute('download')).toBe('Term plan.pdf');
    expect(link.textContent).toContain('PDF · 820 KB');
    expect(screen.getByRole('alert').textContent).toBe('The upload stopped.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('a PDF opens in the browser viewer by default, always with a download beside it', () => {
    render(<DocumentView file={PDF} />);
    expect(screen.getByTitle('Term plan.pdf').tagName).toBe('IFRAME');
    expect(screen.getByRole('link', { name: /Term plan\.pdf/ }).getAttribute('href')).toBe(PDF.uri);
  });

  it('office files use the adapter the app chose, else a download card', () => {
    function Sheet({ file }: DocumentAdapterProps) {
      return <table aria-label={file.name} />;
    }
    const xlsx = { name: 'Marks.xlsx', uri: '/m.xlsx' };
    const { unmount } = render(<DocumentView file={xlsx} />);
    expect(screen.getByRole('link', { name: /Marks\.xlsx/ }).textContent).toContain('Spreadsheet');
    unmount();
    render(
      <MediaAdapters adapters={{ documents: { sheet: Sheet } }}>
        <DocumentView file={xlsx} />
      </MediaAdapters>,
    );
    expect(screen.getByRole('table', { name: 'Marks.xlsx' })).toBeTruthy();
  });

  it('an unsafe address is never linked or framed', () => {
    const evil = { name: 'x.pdf', uri: 'javascript:alert(1)', mime: 'application/pdf' };
    const { container } = render(<DocumentView file={evil} />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByText('x.pdf')).toBeTruthy();
  });

  it('prose variables come from the world recipe', () => {
    const vars = worldCssVariables(resolveWorld('wewa', 'morning', 'light'));
    expect(vars['--w-prose-lamp-link']).toBe(resolveWorld('wewa').recipes.prose.lamp.link.ink);
  });
});
