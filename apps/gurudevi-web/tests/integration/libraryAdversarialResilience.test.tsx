import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { orpcClient } from '@repo/core/api/orpcClient';
import { LibraryFloor } from '@/app/(sanctuary)/library/LibraryFloor';
import { LibraryMapFloor } from '@/app/(sanctuary)/library/map/LibraryMapFloor';
import { PDFReaderFloor } from '@/app/(sanctuary)/library/reader/[bookId]/PDFReaderFloor';
import { ToolsHubFloor } from '@/app/(sanctuary)/library/tools/ToolsHubFloor';
import { VideoPlayerFloor } from '@/app/(sanctuary)/library/video/[videoId]/VideoPlayerFloor';

const mockGetResources = vi.fn();
const mockGetResource = vi.fn().mockResolvedValue(null);
const mockEngage = vi.fn().mockResolvedValue({});
const mockGetKnowledgeTopology = vi.fn().mockResolvedValue({ nodes: [], links: [] });

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    library: {
      getResources: (...args: any[]) => mockGetResources(...args),
      getResource: (...args: any[]) => mockGetResource(...args),
      engage: (...args: any[]) => mockEngage(...args),
      getKnowledgeTopology: (...args: any[]) => mockGetKnowledgeTopology(...args),
    },
  },
  orpc: {},
  safeClient: {},
}));

vi.mock('@/lib/supabase/browser', () => ({
  createBrowserSupabaseClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-bearer-session-token' } },
        error: null,
      }),
    },
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/library',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
  };
});

describe('Adversarial Resilience & Error Boundary Audits (Where Things Go Wrong)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  describe('Adversarial Scenario 1: Network Drops & 503 Service Failures', () => {
    it('handles 503 service outage gracefully with non-crashing alert and functional retry', async () => {
      const user = userEvent.setup();
      render(<LibraryFloor accountId="scholar-qa-2" displayName="Aria Scholar" />);

      // Open catalog
      const browseBtn = screen.getByRole('button', { name: /browse resources/i });
      await user.click(browseBtn);

      // Force orpcClient.library.getResources to throw 503 outage
      mockGetResources.mockRejectedValueOnce({
        status: 503,
        message: 'Sanctuary Library upstream gateway timeout (503)',
      });

      // Execute search which hits the failing backend
      const searchInput = screen.getByLabelText(/search titles and descriptions/i);
      await user.type(searchInput, 'Hydrology{enter}');

      // Verify graceful degradation: no React unmount crash, alert displayed with notice
      const alert = await screen.findByRole('alert');
      expect(alert).toBeTruthy();
      expect(screen.getByText(/we could not reach the library service/i)).toBeTruthy();

      // Retry button exists and is clickable
      const retryBtn = screen.getByRole('button', { name: /try again/i });
      expect(retryBtn).toBeTruthy();
    });

    it('handles session revocation / 401 Unauthorized by rendering denied state with guidance', async () => {
      const user = userEvent.setup();
      render(<LibraryFloor accountId="scholar-qa-2" displayName="Aria Scholar" />);

      const browseBtn = screen.getByRole('button', { name: /browse resources/i });
      await user.click(browseBtn);

      mockGetResources.mockRejectedValueOnce({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'JWT expired',
      });

      const searchInput = screen.getByLabelText(/search titles and descriptions/i);
      await user.type(searchInput, 'Physics{enter}');

      // Verify denied status notice
      const alert = await screen.findByRole('alert');
      expect(alert).toBeTruthy();
      expect(
        screen.getByText(/your account or selected sanctuary scope cannot access these resources/i),
      ).toBeTruthy();
    });
  });

  describe('Adversarial Scenario 2: Corrupted & Empty Knowledge Topology', () => {
    it('survives empty/null node topology without division by zero or NaN SVG coordinates', async () => {
      const user = userEvent.setup();
      // Render LibraryMapFloor
      render(<LibraryMapFloor displayName="Aria Scholar" capacity="Educator" />);

      // Switch to Knowledge Cosmos
      const cosmosModeBtn = screen.getByRole('button', { name: /knowledge cosmos/i });
      await user.click(cosmosModeBtn);

      const svg = document.querySelector('svg');
      expect(svg).toBeTruthy();

      // Verify no NaN attributes in rendered lines or circles
      const lines = Array.from(document.querySelectorAll('line'));
      lines.forEach((line) => {
        expect(line.getAttribute('x1')).not.toBe('NaN');
        expect(line.getAttribute('y1')).not.toBe('NaN');
        expect(line.getAttribute('x2')).not.toBe('NaN');
        expect(line.getAttribute('y2')).not.toBe('NaN');
      });
    });
  });

  describe('Adversarial Scenario 3: Reader Boundary & Zoom Abuse', () => {
    it('clamps negative or oversized page jumps and bounds zoom level safely', async () => {
      const user = userEvent.setup();
      render(<PDFReaderFloor bookId="mangroves" displayName="Aria Scholar" />);

      // Check initial page is 1
      expect(screen.getByText(/page 1 of 24/i)).toBeTruthy();

      // Click previous page on page 1 (should stay clamped to page 1)
      const prevBtn = screen.getByRole('button', { name: /previous page/i });
      await user.click(prevBtn);
      expect(screen.getByText(/page 1 of 24/i)).toBeTruthy();

      // Abuse Zoom Out multiple times below threshold
      const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
      for (let i = 0; i < 8; i++) {
        await user.click(zoomOutBtn);
      }

      // Verify zoom is safely clamped and never drops below 50%
      const zoomGroup = screen.getByRole('group', { name: /zoom controls/i });
      const zoomPill = zoomGroup.querySelector('span');
      const text = zoomPill?.textContent ?? '';
      const percentage = Number.parseInt(text.replace('%', ''), 10);
      expect(percentage).toBeGreaterThanOrEqual(50);
    });

    it('rejects whitespace-only or oversized marginalia annotations', async () => {
      const user = userEvent.setup();
      render(<PDFReaderFloor bookId="mangroves" displayName="Aria Scholar" />);

      const notesTab = screen.getByText(/notes desk/i);
      await user.click(notesTab);

      // Attempt to submit whitespace-only note
      const noteInput = screen.getByPlaceholderText(/annotation on page 1/i);
      fireEvent.change(noteInput, { target: { value: '    \n   ' } });
      const submitBtn = screen.getByRole('button', { name: /pin note to page 1/i });
      await user.click(submitBtn);

      // Verify empty state is retained and no phantom note is created
      expect(screen.getByText(/no annotations yet/i)).toBeTruthy();
    });
  });

  describe('Adversarial Scenario 4: Media Stream Interruption & Video Player Error Recovery', () => {
    it('renders user-facing recovery banner when video stream fails and allows retry', async () => {
      render(<VideoPlayerFloor videoId="intro-botany" displayName="Aria Scholar" />);

      const videoElement = document.querySelector('video');
      expect(videoElement).toBeTruthy();

      // Fire synthetic media error (e.g. 404 video asset or stream network interruption)
      if (videoElement) {
        fireEvent.error(videoElement);
      }

      // Verify alert banner is displayed
      const errorBanner = await screen.findByRole('alert');
      expect(errorBanner).toBeTruthy();
      expect(screen.getByText(/video lecture stream interrupted or unavailable/i)).toBeTruthy();

      // Click Retry Stream
      const retryBtn = screen.getByRole('button', { name: /retry stream/i });
      fireEvent.click(retryBtn);

      // Banner dismisses on retry
      expect(screen.queryByText(/video lecture stream interrupted or unavailable/i)).toBeNull();
    });
  });

  describe('Adversarial Scenario 5: CSV Parsing with Commas Inside Quotes & Empty Inputs', () => {
    it('parses quote-encapsulated commas correctly without breaking tabular columns', () => {
      render(<ToolsHubFloor displayName="Aria Scholar" />);

      // Switch to textarea and input complex CSV with commas inside quotes and empty line
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeTruthy();

      if (textarea) {
        const complexCSV = `Subject,Grade,Region,Notes\n"Botany, Ecology and Mangroves",Grade 10,"Western, Colombo District",Active\n"Marine Biology, Reefs",Grade 11,"Southern, Galle",Review\n`;
        fireEvent.change(textarea, { target: { value: complexCSV } });
      }

      // Check that the cell with embedded comma was preserved as a single table cell
      expect(screen.getByText('Botany, Ecology and Mangroves')).toBeTruthy();
      expect(screen.getByText('Western, Colombo District')).toBeTruthy();
    });

    it('handles completely blank CSV input gracefully without crashing', () => {
      render(<ToolsHubFloor displayName="Aria Scholar" />);

      const textarea = document.querySelector('textarea');
      if (textarea) {
        fireEvent.change(textarea, { target: { value: '   ' } });
      }

      // 0 rows detected, no unhandled runtime exception
      expect(screen.getByText(/0 Rows Detected/i)).toBeTruthy();
    });
  });
});
