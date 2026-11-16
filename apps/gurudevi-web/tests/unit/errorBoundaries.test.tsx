import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RootError from '../../app/error';
import SanctuaryError from '../../app/(sanctuary)/error';
import NotFound from '../../app/not-found';
import SupportPage from '../../app/(marketing)/(support)/support/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/support',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'explore.localhost:3000' }),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Error Boundaries & Safe Back Navigation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RootError boundary', () => {
    it('renders Try Again, Go Back, and Return to Welcome buttons without duplicate museum links', () => {
      const resetMock = vi.fn();
      const error = new Error('Test boundary interruption');

      render(<RootError error={error} reset={resetMock} />);

      expect(screen.getByText('A Moment of Pause')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeDefined();
      expect(screen.getByRole('button', { name: '← Go Back' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Return to Welcome' })).toBeDefined();

      // Confusing "Guest House Museum ↗" button is completely removed
      expect(screen.queryByText(/Guest House Museum/i)).toBeNull();

      // Try Again triggers reset
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
      expect(resetMock).toHaveBeenCalledTimes(1);
    });

    it('navigates back using history.back when Go Back is clicked', () => {
      const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      Object.defineProperty(window.history, 'length', { value: 3, writable: true, configurable: true });

      const resetMock = vi.fn();
      render(<RootError error={new Error('Test')} reset={resetMock} />);

      const backButton = screen.getByRole('button', { name: '← Go Back' });
      fireEvent.click(backButton);
      expect(historyBackSpy).toHaveBeenCalled();

      historyBackSpy.mockRestore();
    });
  });

  describe('SanctuaryError boundary', () => {
    it('renders Retry Floor, Go Back, and Return to Welcome', () => {
      const resetMock = vi.fn();
      render(<SanctuaryError error={new Error('Test')} reset={resetMock} />);

      expect(screen.getByText('We Paused This Floor')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Retry Floor' })).toBeDefined();
      expect(screen.getByRole('button', { name: '← Go Back' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Return to Welcome' })).toBeDefined();
      expect(screen.queryByText(/Guest House Museum/i)).toBeNull();
    });
  });

  describe('NotFound (404)', () => {
    it('renders Go Back and Return to Welcome without duplicate museum buttons', () => {
      render(<NotFound />);

      expect(screen.getByText('Path Not Found')).toBeDefined();
      expect(screen.getByRole('button', { name: '← Go Back' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Return to Welcome' })).toBeDefined();
      expect(screen.queryByText(/Guest House Museum/i)).toBeNull();
    });
  });

  describe('SupportPage on Explore surface', () => {
    it('renders cleanly inside SanctuaryShell with QueryProvider without throwing unhandled exceptions', async () => {
      const pageComponent = await SupportPage();
      const { container } = render(pageComponent);

      expect(container).toBeDefined();
      expect(screen.getByText(/Explore Web Support & Discovery Guide/i)).toBeDefined();
    });
  });
});
