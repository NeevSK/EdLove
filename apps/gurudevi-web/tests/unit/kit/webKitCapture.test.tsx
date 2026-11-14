import { AudioRecord, FileField, ImageCapture, Media } from '@repo/ui/components/web';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  // jsdom has no object URLs; each file gets a blob: address as in a browser.
  let n = 0;
  URL.createObjectURL = vi.fn(() => `blob:http://localhost/${++n}`);
});

const pdf = (name: string, size: number) =>
  new File([new Uint8Array(size)], name, { type: 'application/pdf' });

describe('web kit: Media', () => {
  it('an image speaks its alt; a decorative one is silent; unsafe addresses never load', () => {
    const { unmount } = render(
      <Media file={{ name: 'leaf.jpg', uri: '/leaf.jpg' }} alt="A green leaf" />,
    );
    expect(screen.getByRole('img', { name: 'A green leaf' })).toBeTruthy();
    unmount();
    const { container, unmount: u2 } = render(
      <Media file={{ name: 'b.jpg', uri: '/b.jpg' }} decorative />,
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    u2();
    const { container: c3 } = render(
      <Media file={{ name: 'x.mp4', uri: 'javascript:alert(1)' }} />,
    );
    expect(c3.querySelector('video')).toBeNull();
    expect(screen.getByRole('alert').textContent).toBe('This cannot be played here.');
  });

  it('video has controls, never autoplays, carries captions, and offers a transcript', () => {
    const { container } = render(
      <Media
        file={{ name: 'lesson.mp4', uri: '/lesson.mp4' }}
        captions={{ uri: '/lesson.vtt', language: 'si', label: 'සිංහල' }}
        transcript="We plant the seed."
      />,
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.controls).toBe(true);
    expect(video.autoplay).toBe(false);
    expect(container.querySelector('track')?.getAttribute('kind')).toBe('captions');
    expect(screen.getByText('Transcript').closest('details')).toBeTruthy();
  });
});

describe('web kit: FileField', () => {
  it('says its rules, adds files that pass and names each one refused', async () => {
    const onAdd = vi.fn();
    render(
      <FileField
        label="Homework"
        files={[]}
        onAdd={onAdd}
        onRemove={() => {}}
        accept={['pdf']}
        maxBytes={1000}
        lang="en"
      />,
    );
    const input = screen.getByLabelText('Homework') as HTMLInputElement;
    expect(input.getAttribute('accept')).toBe('application/pdf,.pdf');
    expect(screen.getByText('1,000 B each, PDF')).toBeTruthy();
    await userEvent.upload(input, [pdf('small.pdf', 10), pdf('big.pdf', 5000)]);
    expect(onAdd).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'small.pdf', uri: expect.stringMatching(/^blob:/) }),
    ]);
    expect(screen.getByRole('alert').textContent).toContain('big.pdf is too large.');
  });

  it('accepts dropped files and refuses when full', () => {
    const onAdd = vi.fn();
    const { container, rerender } = render(
      <FileField label="Homework" files={[]} onAdd={onAdd} onRemove={() => {}} maxFiles={1} />,
    );
    const zone = container.querySelector('.gd-dropzone') as HTMLElement;
    fireEvent.drop(zone, { dataTransfer: { files: [pdf('a.pdf', 1)] } });
    expect(onAdd).toHaveBeenCalledTimes(1);
    rerender(
      <FileField
        label="Homework"
        files={[{ name: 'a.pdf', uri: 'blob:x' }]}
        onAdd={onAdd}
        onRemove={() => {}}
        maxFiles={1}
      />,
    );
    expect(
      (screen.getByRole('button', { name: 'Choose files' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

describe('web kit: ImageCapture and AudioRecord', () => {
  it('the camera input asks for the back camera; a chosen photo shows with its label', async () => {
    const onCaptured = vi.fn();
    const { container } = render(<ImageCapture label="Your leaf" onCaptured={onCaptured} />);
    const camera = container.querySelector('input[capture]') as HTMLInputElement;
    expect(camera.getAttribute('capture')).toBe('environment');
    await userEvent.upload(camera, new File(['x'], 'leaf.jpg', { type: 'image/jpeg' }));
    expect(onCaptured).toHaveBeenCalledWith(expect.objectContaining({ name: 'leaf.jpg' }));
  });

  it('where the browser cannot record, it says so instead of offering a dead button', () => {
    render(<AudioRecord label="Your answer" onRecorded={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Record' })).toBeNull();
    expect(screen.getByText('This cannot be played here.')).toBeTruthy();
  });
});
