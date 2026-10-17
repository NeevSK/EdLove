import { uploadWallpaper } from '@repo/core/api/mediaUpload';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WallpaperUploadControl } from '../../app/(sanctuary)/components/WallpaperUploadControl';

vi.mock('@repo/core/api/mediaUpload', () => ({
  uploadWallpaper: vi.fn(),
}));

describe('WallpaperUploadControl (G1)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unsupported media before image decode or upload', async () => {
    render(<WallpaperUploadControl onUploaded={vi.fn()} />);
    const input = screen.getByLabelText(/choose wallpaper image/i);
    const image = new File(['not an image'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [image] } });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/choose a jpg, png, webp, or avif/i);
    });
    expect(uploadWallpaper).not.toHaveBeenCalled();
  });
});
