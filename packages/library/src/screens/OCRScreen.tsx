import { getOCRInstance, type OCRResult } from '@repo/library/api';
import { useLoadedBytes } from '@repo/library/hooks/useLoadedBytes';
import { bytesToBase64, saveBytes } from '@repo/library/utils/bytes';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ArrowLeft, Download, ScanLine } from '@repo/ui/icons';
import { Box, Button, ButtonText, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = ['eng', 'sin', 'tam'] as const;

export default function OCRScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { t } = useTranslation();
  const router = useRouter();
  const { bytes, loading, error } = useLoadedBytes(params);

  const [lang, setLang] = useState<(typeof LANGUAGES)[number]>('eng');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const runOcr = async () => {
    setBusy(true);
    setProgress(0);
    setResult(null);
    setMessage(null);
    try {
      const ocr = getOCRInstance();
      await ocr.initialize({ logger: (m) => setProgress(m.progress) });
      await ocr.loadLanguage([lang]);
      const options = { language: [lang] };
      const uri = typeof params.uri === 'string' ? params.uri : undefined;
      const parsed =
        uri !== undefined
          ? await ocr.recognizeFromFile(uri, options)
          : bytes
            ? await ocr.recognizeFromBase64(bytesToBase64(bytes), options)
            : null;
      if (parsed) setResult(parsed);
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'OCR failed');
    } finally {
      setBusy(false);
      setProgress(1);
    }
  };

  const exportText = async () => {
    if (!result) return;
    const name = ((params.name ?? 'ocr') as string).replace(/\.[^.]+$/, '');
    await saveBytes(new TextEncoder().encode(result.text), `${name}.txt`, 'text/plain', 'share');
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
            <Text className="text-xl font-bold text-phase-text-primary">{t('ocr.title')}</Text>
            <Text className="text-xs text-phase-text-secondary">{(params.name ?? '') as string}</Text>
          </Box>
          <Icon as={ScanLine} size={22} color="#FDD925" />
        </HStack>

        {error ? (
          <Box className="rounded-2xl border border-phase-danger/20 bg-phase-danger/5 p-4">
            <Text className="text-sm text-phase-danger">{error}</Text>
          </Box>
        ) : null}

        {!bytes && !loading && !error ? (
          <Box className="rounded-2xl border border-phase-border bg-phase-surface p-6">
            <Text className="text-center text-sm text-phase-text-secondary">{t('ocr.emptyHint')}</Text>
          </Box>
        ) : null}

        {bytes && (params.uri || params.base64 || params.dataUri) ? (
          <>
            <Text className="text-sm font-bold text-phase-text-primary">{t('ocr.language')}</Text>
            <HStack className="gap-2">
              {LANGUAGES.map((code) => (
                <Pressable key={code} onPress={() => setLang(code)}>
                  <Box
                    className={
                      lang === code
                        ? 'rounded-full bg-phase-accent px-4 py-1.5'
                        : 'rounded-full border border-phase-border bg-phase-surface px-4 py-1.5'
                    }
                  >
                    <Text
                      className={
                        lang === code ? 'text-xs font-bold text-phase-text-onAccent' : 'text-xs text-phase-text-secondary'
                      }
                    >
                      {t(`ocr.langs.${code}`)}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>

            <Button onPress={runOcr} isLoading={busy} isDisabled={busy && !result}>
              <ButtonText>{busy ? t('common.working') : t('ocr.run')}</ButtonText>
            </Button>

            {busy ? (
              <Box className="h-1.5 w-full overflow-hidden rounded-full bg-phase-canvas">
                <Box
                  className="h-full rounded-full bg-phase-accent"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </Box>
            ) : null}

            {message ? (
              <Box className="rounded-2xl border border-phase-danger/20 bg-phase-danger/5 p-3">
                <Text className="text-sm text-phase-danger">{message}</Text>
              </Box>
            ) : null}

            {result ? (
              <Box className="rounded-2xl border border-phase-border bg-phase-surface p-4">
                <HStack className="items-center justify-between">
                  <Text className="text-sm font-bold text-phase-text-primary">{t('ocr.result')}</Text>
                  <Text className="text-xs text-phase-text-secondary">
                    {t('ocr.confidence', { percent: Math.round(result.confidence * 100) })}
                  </Text>
                </HStack>
                <Text className="mt-2 text-sm leading-5 text-phase-text-primary">
                  {result.text.trim() || t('ocr.noText')}
                </Text>
                <Button variant="outline" className="mt-3" onPress={exportText}>
                  <Icon as={Download} size={16} color="#544A3D" />
                  <ButtonText>{t('ocr.export')}</ButtonText>
                </Button>
              </Box>
            ) : null}
          </>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}