import { pdfUtils, type PDFAPI, type PDFGenerateOptions } from '@repo/library/api';
import { useLoadedBytes } from '@repo/library/hooks/useLoadedBytes';
import { saveBytes } from '@repo/library/utils/bytes';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  RotateCw,
  Save,
  Trash2,
} from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PDFEditorScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { t } = useTranslation();
  const router = useRouter();
  const { bytes, loading, error } = useLoadedBytes(params);

  const [api, setApi] = useState<PDFAPI | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [metadata, setMetadata] = useState<PDFGenerateOptions | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [watermark, setWatermark] = useState('');
  const [range, setRange] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!bytes) return;
    void (async () => {
      try {
        const { PDFAPI: PdfApi } = await import('@repo/library/api');
        const instance = await PdfApi.load(bytes);
        setApi(instance);
        setPageCount(instance.getPageCount());
        const m = instance.getMetadata();
        if (m) {
          setMetadata({
            title: m.title || undefined,
            author: m.author || undefined,
            subject: m.subject || undefined,
            keywords: m.keywords?.length ? m.keywords : undefined,
            creator: m.creator || undefined,
            producer: m.producer || undefined,
            creationDate: m.creationDate ?? undefined,
            modificationDate: m.modificationDate ?? undefined,
          });
        }
      } catch (e: unknown) {
        setMessage(e instanceof Error ? e.message : 'Could not open PDF');
      }
    })();
  }, [bytes]);

  const refresh = useCallback((instance: PDFAPI) => {
    setPageCount(instance.getPageCount());
    const m = instance.getMetadata();
    if (m) {
      setMetadata({
        title: m.title || undefined,
        author: m.author || undefined,
        subject: m.subject || undefined,
        keywords: m.keywords?.length ? m.keywords : undefined,
        creator: m.creator || undefined,
        producer: m.producer || undefined,
        creationDate: m.creationDate ?? undefined,
        modificationDate: m.modificationDate ?? undefined,
      });
    }
  }, []);

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessage(t('pdfEditor.saved'));
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  const applyToDoc = (fn: (instance: PDFAPI) => void) => {
    if (!api) return;
    fn(api);
    refresh(api);
  };

  const savePdf = async (scope: 'share' | 'download' = 'share') => {
    if (!api) return;
    const out = await api.save();
    const name = (params.name ?? 'document') as string;
    await saveBytes(out, `${name.replace(/\.[^.]+$/, '')}-edited.pdf`, 'application/pdf', scope);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-8">
          <BrandPulse size={28} />
        </Box>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <VStack className="gap-3 p-4">
        <HStack className="items-center gap-2">
          <Pressable onPress={() => router.back()} className="active:opacity-60">
            <Icon as={ArrowLeft} size={22} color="#544A3D" />
          </Pressable>
          <Box className="flex-1">
            <Text className="text-xl font-bold text-phase-text-primary">{t('pdfEditor.title')}</Text>
            <Text className="text-xs text-phase-text-secondary">
              {(params.name ?? '') as string}
            </Text>
          </Box>
          <Icon as={FileText} size={22} color="#B8A9E0" />
        </HStack>

        {error ? (
          <Box className="rounded-2xl border border-phase-danger/20 bg-phase-danger/5 p-4">
            <Text className="text-sm text-phase-danger">{error}</Text>
          </Box>
        ) : null}

        {!bytes && !loading && !error ? (
          <Box className="rounded-2xl border border-phase-border bg-phase-surface p-6">
            <Text className="text-center text-sm text-phase-text-secondary">
              {t('pdfEditor.emptyHint')}
            </Text>
          </Box>
        ) : null}

        {api && metadata ? (
          <>
            <Box className="flex-row gap-2 rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="flex-1 text-sm text-phase-text-secondary">
                {t('pdfEditor.pageCount', { count: pageCount })}
              </Text>
              {metadata.title ? (
                <Text className="flex-1 text-sm text-phase-text-primary">{metadata.title}</Text>
              ) : null}
            </Box>

            <Text className="mt-1 text-sm font-bold text-phase-text-primary">
              {t('pdfEditor.pages')}
            </Text>
            <VStack className="gap-2">
              {Array.from({ length: pageCount }, (_, i) => i).map((pageIndex) => (
                <HStack
                  key={pageIndex}
                  className="items-center gap-2 rounded-xl border border-phase-border bg-phase-surface px-3 py-2"
                >
                  <Text className="w-16 text-sm text-phase-text-secondary">
                    {t('pdfEditor.pageLabel', { number: pageIndex + 1 })}
                  </Text>
                  <Box className="flex-1" />
                  <Pressable
                    className="active:opacity-60"
                    onPress={() =>
                      applyToDoc((instance) => {
                        if (pageIndex > 0) {
                          void instance.reorderPages(
                            swapAdjacent(
                              Array.from({ length: instance.getPageCount() }, (_, j) => j),
                              pageIndex - 1,
                              pageIndex,
                            ),
                          );
                        }
                        refresh(instance);
                      })
                    }
                  >
                    <Icon as={ChevronUp} size={18} color="#544A3D" />
                  </Pressable>
                  <Pressable
                    className="active:opacity-60"
                    onPress={() =>
                      applyToDoc((instance) => {
                        void instance.reorderPages(
                          swapAdjacent(
                            Array.from({ length: instance.getPageCount() }, (_, j) => j),
                            pageIndex,
                            pageIndex + 1,
                          ),
                        );
                      })
                    }
                  >
                    <Icon as={ChevronDown} size={18} color="#544A3D" />
                  </Pressable>
                  <Pressable
                    className="active:opacity-60"
                    onPress={() => applyToDoc((instance) => instance.rotatePage(pageIndex, 90))}
                  >
                    <Icon as={RotateCw} size={18} color="#544A3D" />
                  </Pressable>
                  <Pressable
                    className="active:opacity-60"
                    onPress={() => applyToDoc((instance) => instance.removePage(pageIndex))}
                  >
                    <Icon as={Trash2} size={18} color="#FF6347" />
                  </Pressable>
                </HStack>
              ))}
            </VStack>

            <Button onPress={() => applyToDoc((instance) => instance.addPage())}>
              <Icon as={Plus} size={16} color="white" />
              <ButtonText>{t('pdfEditor.addPage')}</ButtonText>
            </Button>

            {message ? (
              <Text className="text-xs text-phase-text-secondary">{message}</Text>
            ) : null}

            <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="mb-2 text-sm font-bold text-phase-text-primary">
                {t('pdfEditor.watermark')}
              </Text>
              <Box className="flex-row items-center gap-2">
                <Input className="flex-1">
                  <InputField
                    placeholder={t('pdfEditor.watermarkPlaceholder')}
                    value={watermark}
                    onChangeText={setWatermark}
                  />
                </Input>
                <Button
                  size="sm"
                  onPress={() =>
                    void withBusy(() =>
                      api
                        .addWatermark({ text: watermark, opacity: 0.3 })
                        .then(() => setWatermark('')),
                    )
                  }
                >
                  <ButtonText>{t('pdfEditor.apply')}</ButtonText>
                </Button>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="mb-2 text-sm font-bold text-phase-text-primary">
                {t('pdfEditor.pageNumbers')}
              </Text>
              <Button size="sm" variant="outline" onPress={() => void withBusy(() => api.addPageNumbers(0))}>
                <ButtonText>{t('pdfEditor.apply')}</ButtonText>
              </Button>
            </Box>

            <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="mb-2 text-sm font-bold text-phase-text-primary">
                {t('pdfEditor.extract')}
              </Text>
              <Box className="flex-row items-center gap-2">
                <Input className="flex-1">
                  <InputField
                    placeholder={t('pdfEditor.extractPlaceholder')}
                    value={range}
                    onChangeText={setRange}
                  />
                </Input>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    void withBusy(async () => {
                      const indices = parseRange(range, pageCount);
                      if (!indices.length) throw new Error('Invalid range');
                      const current = await api.save();
                      const out = await pdfUtils.extractPages(current, indices);
                      await saveBytes(out, 'extracted-pages.pdf', 'application/pdf', 'share');
                    })
                  }
                >
                  <ButtonText>{t('pdfEditor.export')}</ButtonText>
                </Button>
              </Box>
            </Box>

            <Button
              onPress={() => void withBusy(() => savePdf())}
              isLoading={busy}
              isDisabled={busy}
            >
              <Icon as={Save} size={16} color="white" />
              <ButtonText>{t('pdfEditor.save')}</ButtonText>
            </Button>
          </>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}

function swapAdjacent(order: number[], a: number, b: number): number[] {
  const next = [...order];
  if (a >= 0 && b < next.length) {
    [next[a], next[b]] = [next[b], next[a]] as [number, number];
  }
  return next;
}

function parseRange(range: string, pageCount: number): number[] {
  const indices = new Set<number>();
  for (const part of range.split(',')) {
    const trimmed = part.trim();
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(trimmed);
    if (!match) continue;
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
      indices.add(i - 1);
    }
  }
  return [...indices].sort((x, y) => x - y);
}