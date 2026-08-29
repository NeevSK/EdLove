import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { annotationsAPI } from '@repo/library/api/annotations';
import type {
  AnnotationColor,
  Bookmark as BookmarkType,
  ReadingProgress,
  TextHighlight,
  TextNote,
} from '@repo/library/types';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark as BookmarkIcon,
  EllipsisVertical,
  Pen,
  StickyNote,
  X,
} from '@repo/ui/icons';
import {
  Box,
  Button,
  HStack,
  Icon,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { v7 as uuidv7 } from 'uuid';

const ANNOTATION_COLORS: {
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple';
  label: string;
}[] = [
  { color: 'yellow', label: 'Yellow' },
  { color: 'green', label: 'Green' },
  { color: 'blue', label: 'Blue' },
  { color: 'pink', label: 'Pink' },
  { color: 'orange', label: 'Orange' },
  { color: 'purple', label: 'Purple' },
];

const PDF_COLORS = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  pink: '#E91E63',
  orange: '#FF9800',
  purple: '#9C27B0',
};

interface ReaderScreenParams {
  resourceId: string;
  title: string;
  url: string;
  type?: 'pdf' | 'epub';
}

export default function ReaderScreen() {
  const { resourceId, title, url, type = 'pdf' } = useLocalSearchParams<Record<string, string>>();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { context } = usePermissions();
  const userId = user?.id || context.userId;

  // PDF.js state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Annotations state
  const [highlights, setHighlights] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [progress, setProgressState] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<
    'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
  >('yellow');
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [isCreatingHighlight, setIsCreatingHighlight] = useState(false);
  const [selection, setSelection] = useState<{
    pageIndex: number;
    text: string;
    rects: any[];
  } | null>(null);

  // Progress tracking
  const [readingStartTime, setReadingStartTime] = useState(Date.now());

  // PDF rendering
  const pdfContainerRef = useRef<View | null>(null);
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Load PDF document
  useEffect(() => {
    let mounted = true;
    async function loadPdf() {
      if (!url) return;
      try {
        setIsLoading(true);
        // Dynamic import pdfjs-dist to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument({ url });
        const pdf = await loadingTask.promise;

        if (!mounted) return;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setIsLoading(false);
      } catch (e) {
        console.error('PDF load error:', e);
        if (mounted) {
          setError('Failed to load document');
          setIsLoading(false);
        }
      }
    }
    loadPdf();
    return () => {
      mounted = false;
    };
  }, [url]);

  // Load annotations
  const loadAnnotations = useCallback(async () => {
    if (!userId || !resourceId) return;
    try {
      const [hls, nts, bms, prog] = await Promise.all([
        annotationsAPI.getHighlights(resourceId, userId),
        annotationsAPI.getNotes(resourceId, userId),
        annotationsAPI.getBookmarks(resourceId, userId),
        annotationsAPI.getProgress(resourceId, userId),
      ]);
      setHighlights(hls);
      setNotes(nts);
      setBookmarks(bms);
      if (prog) setProgressState(prog);
    } catch (e) {
      console.warn('Failed to load annotations:', e);
    }
  }, [userId, resourceId]);

  useEffect(() => {
    if (resourceId && userId) {
      loadAnnotations();
    }
  }, [loadAnnotations, resourceId, userId]);

  // Track reading time
  useEffect(() => {
    return () => {
      if (progress && userId && resourceId) {
        const timeSpent = Date.now() - readingStartTime + (progress.timeSpentMs || 0);
        annotationsAPI.upsertProgress(userId, resourceId, {
          ...progress,
          timeSpentMs: timeSpent,
          lastReadAt: new Date().toISOString(),
        });
      }
    };
  }, []);

  // Render page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = pageCanvasRefs.current.get(pageNum);
        if (!canvas) return;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context!, viewport }).promise;
      } catch (e) {
        console.error('Page render error:', e);
      }
    },
    [pdfDoc, scale],
  );

  // Handle text selection for highlights
  const handleTextSelection = useCallback((text: string, rects: any[], pageIndex: number) => {
    if (!text.trim() || isCreatingHighlight) return;
    setSelection({ pageIndex, text, rects });
    setShowHighlightToolbar(true);
  }, []);

  const handleCreateHighlight = useCallback(async () => {
    if (!selection || !userId || !resourceId) return;
    setIsCreatingHighlight(true);
    try {
      const color = selectedColor;
      const highlight = await annotationsAPI.createHighlight(userId, resourceId, {
        color,
        pdfSelection: {
          pageIndex: selection.pageIndex,
          rects: selection.rects,
          text: selection.text,
        },
      });
      setHighlights((prev) => [highlight, ...prev]);
      setShowHighlightToolbar(false);
      setSelection(null);
      hapticLight();
    } catch (e) {
      console.error('Failed to create highlight:', e);
    } finally {
      setIsCreatingHighlight(false);
    }
  }, [selection, selectedColor, userId, resourceId]);

  const handleDeleteHighlight = useCallback(async (highlightId: string) => {
    try {
      await annotationsAPI.deleteHighlight(highlightId);
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
      const noteIds = notes.filter((n) => n.highlightId === highlightId).map((n) => n.id);
      for (const noteId of noteIds) {
        await annotationsAPI.deleteNote(noteId);
      }
      setNotes((prev) => prev.filter((n) => n.highlightId !== highlightId));
      hapticLight();
    } catch (e) {
      console.error('Failed to delete highlight:', e);
    }
  }, []);

  const handleCreateNote = useCallback(
    async (highlightId: string) => {
      if (!noteText.trim() || !userId || !resourceId) return;
      try {
        const note = await annotationsAPI.createNote(userId, resourceId, {
          highlightId,
          content: noteText,
          isPrivate: true,
          tags: [],
        });
        setNotes((prev) => [note, ...prev]);
        setShowNoteInput(false);
        setNoteText('');
        setActiveHighlightId(null);
        hapticLight();
      } catch (e) {
        console.error('Failed to create note:', e);
      }
    },
    [noteText, userId, resourceId],
  );

  const handleCreateBookmark = useCallback(async () => {
    if (!userId || !resourceId || !pdfDoc) return;
    try {
      const bookmark = await annotationsAPI.createBookmark(userId, resourceId, {
        pdfPosition: { pageIndex: currentPage - 1, scrollY: 0 },
        title: `Page ${currentPage}`,
      });
      setBookmarks((prev) => [bookmark, ...prev]);
      hapticLight();
    } catch (e) {
      console.error('Failed to create bookmark:', e);
    }
  }, [currentPage, resourceId, userId, pdfDoc]);

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center bg-black">
        <BrandPulse size={48} tintColor="#D4843A" />
        <Text className="text-mistGray mt-4">{t('reader.loading')}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 items-center justify-center bg-black p-8">
        <Text className="text-emberRed text-center">{error}</Text>
        <Button onPress={() => router.back()} className="mt-4">
          {t('common.goBack')}
        </Button>
      </Box>
    );
  }

  // Current page annotations
  const currentPageHighlights = highlights.filter(
    (h) => h.pdfSelection?.pageIndex === currentPage - 1,
  );
  const currentPageNotes = notes.filter((n) => {
    if (n.highlightId) {
      const h = highlights.find((h) => h.id === n.highlightId);
      return h?.pdfSelection?.pageIndex === currentPage - 1;
    }
    return n.pdfPosition?.pageIndex === currentPage - 1;
  });

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center bg-black">
        <BrandPulse size={48} tintColor="#D4843A" />
        <Text className="text-mistGray mt-4">{t('reader.loading')}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 items-center justify-center bg-black p-8">
        <Text className="text-emberRed text-center">{error}</Text>
        <Button onPress={() => router.back()} className="mt-4">
          {t('common.goBack')}
        </Button>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-black">
      {/* Top Bar */}
      <Box className="flex-row items-center justify-between p-4 bg-black/80 backdrop-blur">
        <Pressable onPress={() => router.back()} className="p-2">
          <Icon as={X} size={24} color="white" />
        </Pressable>
        <Text className="text-white font-semibold flex-1 text-center truncate pr-10">{title}</Text>
        <Pressable onPress={handleCreateBookmark} className="p-2">
          <Icon as={BookmarkIcon} size={24} color="white" />
        </Pressable>
      </Box>

      {/* PDF Viewer Area */}
      <Box className="flex-1 relative">
        {pdfDoc && (
          <Box className="flex-1" ref={pdfContainerRef}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Box key={pageNum} className="w-full mb-4 items-center">
                <canvas
                  ref={(el) => {
                    if (el) pageCanvasRefs.current.set(pageNum, el);
                  }}
                  style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                />
                {/* Highlight overlays */}
                {pageNum === currentPage &&
                  currentPageHighlights.map((h) => (
                    <Box
                      key={h.id}
                      className="absolute pointer-events-none"
                      style={{
                        position: 'absolute',
                        left: Math.min(...h.pdfSelection.rects.map((r: any) => r.x)),
                        top: Math.min(...h.pdfSelection.rects.map((r: any) => r.y)),
                        width:
                          Math.max(...h.pdfSelection.rects.map((r: any) => r.x + r.width)) -
                          Math.min(...h.pdfSelection.rects.map((r: any) => r.x)),
                        height:
                          Math.max(...h.pdfSelection.rects.map((r: any) => r.y + r.height)) -
                          Math.min(...h.pdfSelection.rects.map((r: any) => r.y)),
                        backgroundColor: PDF_COLORS[h.color],
                        opacity: 0.3,
                        borderRadius: 2,
                      }}
                    />
                  ))}
              </Box>
            ))}
          </Box>
        )}

        {/* Highlight Toolbar */}
        {showHighlightToolbar && selection && (
          <Box className="absolute bottom-20 left-4 right-4 bg-white rounded-xl p-3 shadow-xl flex-row items-center gap-3 z-50">
            <Text className="text-xs text-gray-500 flex-1">
              Highlight "{selection.text.slice(0, 30)}..."
            </Text>
            {ANNOTATION_COLORS.map((c) => (
              <Pressable
                key={c.color}
                onPress={() => setSelectedColor(c.color)}
                className={`w-8 h-8 rounded-full border-2 ${selectedColor === c.color ? 'border-black' : 'border-transparent'}`}
                style={{ backgroundColor: PDF_COLORS[c.color] }}
              />
            ))}
            <Pressable
              onPress={handleCreateHighlight}
              className="ml-2 px-4 py-2 bg-black text-white rounded-full"
            >
              <Text className="text-sm font-medium">{t('reader.highlight')}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowHighlightToolbar(false);
                setSelection(null);
              }}
              className="ml-2 p-2"
            >
              <Icon as={X} size={20} color="gray" />
            </Pressable>
          </Box>
        )}

        {/* Note Input Modal */}
        {showNoteInput && activeHighlightId && (
          <Box className="absolute inset-0 bg-black/50 flex items-end z-50">
            <Box className="w-full bg-white rounded-t-2xl p-4 shadow-xl animate-slide-up">
              <HStack className="justify-between mb-3">
                <Text className="text-lg font-semibold">{t('reader.addNote')}</Text>
                <Pressable
                  onPress={() => {
                    setShowNoteInput(false);
                    setActiveHighlightId(null);
                  }}
                >
                  <Icon as={X} size={24} color="gray" />
                </Pressable>
              </HStack>
              <Box className="border rounded-lg p-3 mb-3">
                <InputField
                  className="min-h-[100px] text-base"
                  multiline
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder={t('reader.notePlaceholder')}
                  textAlignVertical="top"
                />
              </Box>
              <Button onPress={() => handleCreateNote(activeHighlightId)} className="w-full">
                <Text>{t('reader.save')}</Text>
              </Button>
            </Box>
          </Box>
        )}

        {/* Bottom Navigation */}
        <Box className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur p-4 flex-row items-center justify-between px-6">
          <Pressable
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3"
          >
            <Icon as={ArrowLeft} size={28} color={currentPage === 1 ? 'gray' : 'white'} />
          </Pressable>
          <Text className="text-white text-sm font-mono">
            {currentPage} / {totalPages}
          </Text>
          <Pressable
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3"
          >
            <Icon as={ArrowRight} size={28} color={currentPage === totalPages ? 'gray' : 'white'} />
          </Pressable>
        </Box>
      </Box>
    </Box>
  );
}
