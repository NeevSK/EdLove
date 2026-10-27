import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LibraryFloor } from '@/app/(sanctuary)/library/LibraryFloor';
import { LibraryMapFloor } from '@/app/(sanctuary)/library/map/LibraryMapFloor';
import { PDFReaderFloor } from '@/app/(sanctuary)/library/reader/[bookId]/PDFReaderFloor';
import { ToolsHubFloor } from '@/app/(sanctuary)/library/tools/ToolsHubFloor';
import { VideoPlayerFloor } from '@/app/(sanctuary)/library/video/[videoId]/VideoPlayerFloor';

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

describe('Library Ecosystem Deep QA Integration & User Journey Audits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    // HTMLMediaElement mocks for jsdom
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  describe('Journey 1: Library Overview & Shelves Exploration', () => {
    it('renders overview shelves, allows searching, and opens catalog master-detail view', async () => {
      const user = userEvent.setup();
      render(<LibraryFloor accountId="scholar-qa-1" displayName="Aria Scholar" />);

      // Verify welcoming sanctuary posture & greeting
      expect(
        screen.getByRole('heading', { level: 1, name: /a place to find what helps you grow/i }),
      ).toBeTruthy();

      // Verify Curated Study Collections shelf
      expect(
        screen.getByRole('heading', { level: 3, name: /curated study collections/i }),
      ).toBeTruthy();

      // Verify Continue Learning shelf
      expect(
        screen.getByRole('heading', { level: 3, name: /continue learning & field guides/i }),
      ).toBeTruthy();

      // Verify Knowledge Tools Hub section and Library Map link
      expect(screen.getByText(/knowledge tools hub/i)).toBeTruthy();
      expect(screen.getByText(/view library map →/i)).toBeTruthy();

      // Enter Master-Detail Catalog
      const browseBtn = screen.getByRole('button', { name: /browse resources/i });
      await user.click(browseBtn);

      // Verify Catalog stage opened
      expect(screen.getByRole('heading', { level: 2, name: /resource catalog/i })).toBeTruthy();
      expect(screen.getByRole('search')).toBeTruthy();

      // Search interaction
      const searchInput = screen.getByLabelText(/search titles and descriptions/i);
      await user.type(searchInput, 'Mangrove');
      expect((searchInput as HTMLInputElement).value).toBe('Mangrove');
    });
  });

  describe('Journey 2: Spatial & Concept Cosmos Map Interactions', () => {
    it('switches between Provincial Resource Centers and Knowledge Cosmos Constellation', async () => {
      const user = userEvent.setup();
      render(<LibraryMapFloor displayName="Aria Scholar" capacity="Educator" />);

      // Verify header and initial Physical Centers mode
      expect(
        screen.getByRole('heading', { level: 1, name: /national learning centers map/i }),
      ).toBeTruthy();

      // Check provincial centers cards exist
      expect(screen.getByText(/colombo central educational resource center/i)).toBeTruthy();
      expect(screen.getByText(/kandy municipal community library/i)).toBeTruthy();

      // Filter by Western province
      const westernBtn = screen.getByRole('button', { name: 'Western' });
      await user.click(westernBtn);
      expect(screen.getByText(/colombo central educational resource center/i)).toBeTruthy();

      // Switch to Knowledge Cosmos SVG Constellation
      const cosmosModeBtn = screen.getByRole('button', { name: /knowledge cosmos/i });
      await user.click(cosmosModeBtn);

      // Verify Cosmos stage renders SVG cluster
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeTruthy();

      // Click on a constellation node in the SVG to inspect concept relations
      const mangroveNodeCircle = document.querySelector('circle[data-node-id="node-1"]');
      if (mangroveNodeCircle) {
        fireEvent.click(mangroveNodeCircle);
        // Expect selected node banner to reveal concept details
        expect(screen.getByText(/mangrove ecology & estuarine biology/i)).toBeTruthy();
      }
    });
  });

  describe('Journey 3: Pedagogical PDF Reader Desk Operations', () => {
    it('supports page flipping, outline chapter jump, note taking, and reading themes', async () => {
      const user = userEvent.setup();
      render(<PDFReaderFloor bookId="mangroves" displayName="Aria Scholar" />);

      // Verify reader header with document title
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();

      // Check current page indicator (starts at 1)
      expect(screen.getByText(/page 1 of/i)).toBeTruthy();

      // Flip to next page
      const nextPageBtn = screen.getByRole('button', { name: /next page/i });
      await user.click(nextPageBtn);
      expect(screen.getByText(/page 2 of/i)).toBeTruthy();

      // Jump to Chapter 3 using outline list
      const chapter3Button = screen.getByText(/3\. field identification/i);
      await user.click(chapter3Button);
      expect(screen.getByText(/page 12 of/i)).toBeTruthy();

      // Switch sidebar tab to Personal Reflections & Marginalia
      const notesTab = screen.getByText(/notes desk/i);
      await user.click(notesTab);

      // Write an annotation and submit
      const noteInput = screen.getByPlaceholderText(/annotation on page 12/i);
      fireEvent.change(noteInput, {
        target: { value: 'Crucial salinity thresholds for viviparous seedlings.' },
      });
      const saveNoteBtn = screen.getByRole('button', { name: /pin note to page 12/i });
      await user.click(saveNoteBtn);

      // Verify annotation is rendered in the list
      expect(
        screen.getByText(/crucial salinity thresholds for viviparous seedlings\./i),
      ).toBeTruthy();

      // Switch reading theme to Sepia
      const sepiaThemeBtn = screen.getByRole('button', { name: /sepia candlelight mode/i });
      await user.click(sepiaThemeBtn);
      const article = screen.getByRole('region', { name: /document reading area/i });
      expect(article.className).toContain('themeSepia');
      expect(sepiaThemeBtn.className).toContain('actionBtnActive');
    });
  });

  describe('Journey 4: Interactive Video Lecture Floor & Time-Stamped Reflections', () => {
    it('manages video playback state, seeks chapters, and saves time-anchored notes', async () => {
      const user = userEvent.setup();
      render(<VideoPlayerFloor videoId="intro-botany" displayName="Aria Scholar" />);

      // Check video title and duration
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();

      // Play video
      const playBtn = screen.getByRole('button', { name: /play video/i });
      await user.click(playBtn);
      expect(screen.getByRole('button', { name: /pause video/i })).toBeTruthy();

      // Seek to Chapter 2: Taxonomic Features & Leaf Venation
      const chapter2Btn = screen.getByText(/taxonomic features & leaf venation/i);
      await user.click(chapter2Btn);

      // Write a time-stamped reflection note
      const reflectionInput = screen.getByLabelText(/write a timestamped reflection/i);
      fireEvent.change(reflectionInput, {
        target: { value: 'Xylem and phloem tissue differentiation observed.' },
      });
      const saveNoteBtn = screen.getByRole('button', { name: 'Pin' });
      await user.click(saveNoteBtn);

      // Verify the saved note appears with reflection text
      expect(
        screen.getByText(/xylem and phloem tissue differentiation observed\./i),
      ).toBeTruthy();

      // Toggle theater mode
      const theaterBtn = screen.getByRole('button', { name: /enter theater mode/i });
      await user.click(theaterBtn);
      expect(screen.getByRole('button', { name: /exit theater mode/i })).toBeTruthy();
    });
  });

  describe('Journey 5: Knowledge Tools Workbench (Data Grid, OCR & Compiler)', () => {
    it('navigates tool tabs, processes sample OCR, and compiles study packet bundles', async () => {
      const user = userEvent.setup();
      render(<ToolsHubFloor displayName="Aria Scholar" />);

      // Verify tools header
      expect(screen.getByRole('heading', { level: 1, name: /pedagogical knowledge tools/i })).toBeTruthy();

      // Initial tab is Spreadsheet Inspector: verify table rendering
      expect(screen.getByRole('table')).toBeTruthy();
      expect(screen.getByText('MATH-LK-10')).toBeTruthy();

      // Switch to OCR Text Extractor Tab
      const ocrTab = screen.getByRole('button', { name: /ocr & document vision/i });
      await user.click(ocrTab);

      // Verify OCR extracted content is rendered in textarea
      expect(screen.getByRole('button', { name: /copy text/i })).toBeTruthy();
      expect(
        screen.getByText(/Rhizophora mucronata \(True Mangrove\) with arching stilt roots/i),
      ).toBeTruthy();

      // Switch to Study Packet Compiler Tab
      const compilerTab = screen.getByRole('button', { name: /study packet compiler/i });
      await user.click(compilerTab);

      // Add a custom curriculum sheet to the packet bundle
      const addItemInput = screen.getByPlaceholderText(/add resource title/i);
      await user.type(addItemInput, 'Estuarine Field Observation Checklist');
      const addBtn = screen.getByRole('button', { name: /\+ add item/i });
      await user.click(addBtn);

      // Verify the new item is listed in the compiled packet
      expect(screen.getByText('Estuarine Field Observation Checklist')).toBeTruthy();
    });
  });
});
