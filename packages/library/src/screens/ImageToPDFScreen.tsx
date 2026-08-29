import { ImageToPDFAPI, type ImageToPDFOptions } from '@repo/library/api';
import { saveBytes } from '@repo/library/utils/bytes';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { ArrowLeft, Layers, Save } from '@repo/ui/icons';
import { Box, Button, ButtonText, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FIT_MODES = ['contain', 'cover', 'fill', 'width', 'height'] as const;

const PAGE_SIZES: { key: string; size: [number, number] }[] = [
  { key: 'letter', size: [612, 792] },
  { key: 'a4', size: [595, 842] },
];

interface ConvertResult {
  pageCount: number;
  sizeKB: number;
}

export default function ImageToPDFScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { t } = useTranslation();
  const router = useRouter();

  const imageUris = useMemo(() => {
    const raw = typeof params.uris === 'string' ? params.uris.split(',') : [];
    const single = typeof params.uri === 'string' ? params.uri : undefined;
    return [...raw, ...(single ? [single] : [])].filter(Boolean);
  }, [params.uris, params.uri]);

  const [fitMode, setFitMode] = useState<(typeof FIT_MODES)[number]>('contain');
  const [pageKey, setPageKey] = useState('letter');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const convert = async () => {
    setBusy(true);
    setMessage(null);
    setResult(null);
    setPdfBytes(null);
    try {
      const pageSize = PAGE_SIZES.find((p) => p.key === pageKey)?.size ?? [612, 792];
      const options: ImageToPDFOptions = {
        pageSize,
        fitMode,
        margin: 24,
        quality: 0.85,
        format: 'jpg',
        compress: true,
      };
      const output = await ImageToPDFAPI.convertImagesToPDF(
        imageUris.map((uri) => ({ uri })),
        options,
      );
      setPdfBytes(output.pdfBytes);
      setResult({ pageCount: output.pageCount, sizeKB: Math.round(output.fileSizeBytes / 1024) });
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Conversion failed');
    } finally {
      setBusy(false);
    }
  };

  const savePdf = async () => {
    if (!pdfBytes) return;
    const name = ((params.name ?? 'images') as string).replace(/\.[^.]+$/, '');
    await saveBytes(pdfBytes, `${name}.pdf`, 'application/pdf', 'share');
  };

  return (
    <ScreenWrapper>
      <VStack className="gap-3 p-4">
        <HStack className="items-center gap-2">
          <Pressable onPress={() => router.back()} className="active:opacity-60">
            <Icon as={ArrowLeft} size={22} color="#544A3D" />
          </Pressable>
          <Box className="flex-1">
            <Text className="text-xl font-bold text-phase-text-primary">{t('imageToPdf.title')}</Text>
            <Text className="text-xs text-phase-text-secondary">
              {imageUris.length ? t('imageToPdf.imageCount', { count: imageUris.length }) : ''}
            </Text>
          </Box>
          <Icon as={Layers} size={22} color="#FFB84D" />
        </HStack>

        {!imageUris.length ? (
          <Box className="rounded-2xl border border-phase-border bg-phase-surface p-6">
            <Text className="text-center text-sm text-phase-text-secondary">{t('imageToPdf.emptyHint')}</Text>
          </Box>
        ) : null}

        {imageUris.length ? (
          <>
            <Text className="text-sm font-bold text-phase-text-primary">{t('imageToPdf.fitMode')}</Text>
            <HStack className="flex-wrap gap-2">
              {FIT_MODES.map((mode) => (
                <Pressable key={mode} onPress={() => setFitMode(mode)}>
                  <Box
                    className={
                      fitMode === mode
                        ? 'rounded-full bg-phase-accent px-3 py-1.5'
                        : 'rounded-full border border-phase-border bg-phase-surface px-3 py-1.5'
                    }
                  >
                    <Text
                      className={
                        fitMode === mode ? 'text-xs font-bold text-phase-text-onAccent' : 'text-xs text-phase-text-secondary'
                      }
                    >
                      {t(`imageToPdf.fits.${mode}`)}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>

            <Text className="text-sm font-bold text-phase-text-primary">{t('imageToPdf.pageSize')}</Text>
            <HStack className="gap-2">
              {PAGE_SIZES.map((page) => (
                <Pressable key={page.key} onPress={() => setPageKey(page.key)}>
                  <Box
                    className={
                      pageKey === page.key
                        ? 'rounded-full bg-phase-accent px-4 py-1.5'
                        : 'rounded-full border border-phase-border bg-phase-surface px-4 py-1.5'
                    }
                  >
                    <Text
                      className={
                        pageKey === page.key ? 'text-xs font-bold text-phase-text-onAccent' : 'text-xs text-phase-text-secondary'
                      }
                    >
                      {t(`imageToPdf.pages.${page.key}`)}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>

            <Button onPress={convert} isLoading={busy} isDisabled={busy}>
              <ButtonText>{busy ? t('common.working') : t('imageToPdf.convert')}</ButtonText>
            </Button>

            {message ? (
              <Box className="rounded-2xl border border-phase-danger/20 bg-phase-danger/5 p-3">
                <Text className="text-sm text-phase-danger">{message}</Text>
              </Box>
            ) : null}

            {result ? (
              <Box className="rounded-2xl border border-phase-border bg-phase-surface p-4">
                <Text className="text-sm font-bold text-phase-text-primary">{t('imageToPdf.result')}</Text>
                <Text className="mt-1 text-xs text-phase-text-secondary">
                  {t('imageToPdf.resultDetails', {
                    pages: result.pageCount,
                    size: result.sizeKB,
                  })}
                </Text>
                <Button className="mt-3" onPress={savePdf}>
                  <Icon as={Save} size={16} color="white" />
                  <ButtonText>{t('imageToPdf.save')}</ButtonText>
                </Button>
              </Box>
            ) : null}
          </>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}