import { getCloudAPI, type CloudImportResult } from '@repo/library/api';
import { useLoadedBytes } from '@repo/library/hooks/useLoadedBytes';
import { saveBytes } from '@repo/library/utils/bytes';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ArrowLeft, Check, Cloud, Download, Key, Link2 } from '@repo/ui/icons';
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
import { Linking } from 'react-native';

type Provider = 'google' | 'microsoft';

export default function CloudExportScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { t } = useTranslation();
  const router = useRouter();
  const { bytes, loading, error, detected } = useLoadedBytes(params);

  const [provider, setProvider] = useState<Provider>('google');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<CloudImportResult | null>(null);

  const cloud = getCloudAPI();

  const configuredProviders = useCallback((): string[] => cloud.getConfiguredProviders(), [cloud]);

  const applyProvider = useCallback(
    (next: Provider) => {
      setProvider(next);
      setLastUpload(null);
    },
    [],
  );

  const saveConfig = () => {
    setBusy(true);
    setMessage(null);
    try {
      if (provider === 'google') {
        cloud.configure({
          google: {
            clientId,
            clientSecret,
            redirectUri,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
          },
        });
      } else {
        cloud.configure({
          microsoft: {
            clientId,
            clientSecret,
            redirectUri,
            tenantId: tenantId || undefined,
            scopes: ['Files.ReadWrite', 'User.Read'],
          },
        });
      }
      setMessage(t('cloudExport.configured'));
      setLastUpload(null);
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Configuration failed');
    } finally {
      setBusy(false);
    }
  };

  const probeToken = useCallback(() => {
    const configured = configuredProviders();
    if (!configured.includes(provider)) {
      setHasToken(false);
      return;
    }
    void cloud
      .getAccessToken(provider)
      .then(() => setHasToken(true))
      .catch(() => setHasToken(false));
  }, [cloud, configuredProviders, provider]);

  useEffect(() => {
    probeToken();
  }, [probeToken]);

  const openAuthUrl = () => {
    try {
      const url = cloud.getAuthUrl(provider);
      void Linking.openURL(url);
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Provider is not configured');
    }
  };

  const exchangeCode = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await cloud.exchangeCode(provider, authCode.trim());
      setAuthCode('');
      setHasToken(true);
      setMessage(t('cloudExport.connected'));
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Code exchange failed');
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    if (!bytes || !detected) return;
    setBusy(true);
    setMessage(null);
    setLastUpload(null);
    try {
      const fileName = ((params.name ?? 'document') as string).replace(/\.[^.]+$/, '.') || 'document.';
      const targetName = `${fileName}${detected.extension}`;
      let result: CloudImportResult;
      if (provider === 'google') {
        result = await cloud.uploadToGoogleDrive({
          fileName: targetName,
          mimeType: detected.mimeType,
          content: bytes,
        });
      } else {
        result = await cloud.uploadToOneDrive({
          fileName: targetName,
          content: bytes,
        });
      }
      setLastUpload(result);
      setMessage(t('cloudExport.uploaded'));
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const saveLocal = async () => {
    if (!bytes || !detected) return;
    const fileName = ((params.name ?? 'document') as string).replace(/\.[^.]+$/, '');
    await saveBytes(bytes, `${fileName}.${detected.extension}`, detected.mimeType, 'share');
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
            <Text className="text-xl font-bold text-phase-text-primary">{t('cloudExport.title')}</Text>
            <Text className="text-xs text-phase-text-secondary">{(params.name ?? '') as string}</Text>
          </Box>
          <Icon as={Cloud} size={22} color="#87CEEB" />
        </HStack>

        {error ? (
          <Box className="rounded-2xl border border-phase-danger/20 bg-phase-danger/5 p-4">
            <Text className="text-sm text-phase-danger">{error}</Text>
          </Box>
        ) : null}

        {!bytes && !loading && !error ? (
          <Box className="rounded-2xl border border-phase-border bg-phase-surface p-6">
            <Text className="text-center text-sm text-phase-text-secondary">{t('cloudExport.emptyHint')}</Text>
          </Box>
        ) : null}

        {bytes && detected ? (
          <>
            <Text className="text-sm font-bold text-phase-text-primary">{t('cloudExport.provider')}</Text>
            <HStack className="gap-2">
              {(['google', 'microsoft'] as const).map((code) => (
                <Pressable key={code} onPress={() => applyProvider(code)}>
                  <Box
                    className={
                      provider === code
                        ? 'rounded-full bg-phase-accent px-4 py-1.5'
                        : 'rounded-full border border-phase-border bg-phase-surface px-4 py-1.5'
                    }
                  >
                    <Text
                      className={
                        provider === code
                          ? 'text-xs font-bold text-phase-text-onAccent'
                          : 'text-xs text-phase-text-secondary'
                      }
                    >
                      {t(`cloudExport.providers.${code}`)}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>

            <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="mb-2 text-sm font-bold text-phase-text-primary">{t('cloudExport.config')}</Text>
              <VStack className="gap-2">
                <Input>
                  <InputField
                    placeholder="Client ID"
                    value={clientId}
                    onChangeText={setClientId}
                    autoCapitalize="none"
                  />
                </Input>
                <Input>
                  <InputField
                    placeholder="Client secret"
                    value={clientSecret}
                    onChangeText={setClientSecret}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </Input>
                <Input>
                  <InputField
                    placeholder="Redirect URI"
                    value={redirectUri}
                    onChangeText={setRedirectUri}
                    autoCapitalize="none"
                  />
                </Input>
                {provider === 'microsoft' ? (
                  <Input>
                    <InputField
                      placeholder={t('cloudExport.tenantId')}
                      value={tenantId}
                      onChangeText={setTenantId}
                      autoCapitalize="none"
                    />
                  </Input>
                ) : null}
                <Button variant="outline" size="sm" onPress={saveConfig} isDisabled={busy}>
                  <ButtonText>{t('cloudExport.saveConfig')}</ButtonText>
                </Button>
              </VStack>
            </Box>

            <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="mb-2 text-sm font-bold text-phase-text-primary">{t('cloudExport.connect')}</Text>
              <HStack className="items-center gap-2">
                <Box
                  className={
                    hasToken
                      ? 'h-2 w-2 rounded-full bg-phase-accent'
                      : 'h-2 w-2 rounded-full bg-phase-danger'
                  }
                />
                <Text className="flex-1 text-xs text-phase-text-secondary">
                  {hasToken ? t('cloudExport.connected') : t('cloudExport.notConnected')}
                </Text>
              </HStack>
              <HStack className="mt-2 gap-2">
                <Button size="sm" variant="outline" onPress={openAuthUrl} isDisabled={busy}>
                  <Icon as={Key} size={14} color="#544A3D" />
                  <ButtonText>{t('cloudExport.openAuth')}</ButtonText>
                </Button>
              </HStack>
              <Box className="mt-2 flex-row items-center gap-2">
                <Input className="flex-1">
                  <InputField
                    placeholder={t('cloudExport.codePlaceholder')}
                    value={authCode}
                    onChangeText={setAuthCode}
                    autoCapitalize="none"
                  />
                </Input>
                <Button size="sm" onPress={exchangeCode} isDisabled={busy || !authCode.trim()} isLoading={busy}>
                  <ButtonText>{t('cloudExport.exchange')}</ButtonText>
                </Button>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
              <Text className="mb-2 text-sm font-bold text-phase-text-primary">{t('cloudExport.uploadCard')}</Text>
              <Text className="mb-2 text-xs text-phase-text-secondary">
                {((params.name ?? 'document') as string) || t('cloudExport.untitled')} Â· {detected.mimeType}
              </Text>
              <Button onPress={upload} isDisabled={busy || !bytes} isLoading={busy}>
                <Icon as={Cloud} size={16} color="white" />
                <ButtonText>{t('cloudExport.upload')}</ButtonText>
              </Button>
            </Box>

            {lastUpload?.webViewLink ? (
              <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3">
                <HStack className="items-center gap-2">
                  <Icon as={Check} size={16} color="#8BBF7A" />
                  <Text className="flex-1 text-sm text-phase-text-primary">{lastUpload.fileName}</Text>
                </HStack>
                <Pressable onPress={() => void Linking.openURL(lastUpload.webViewLink)} className="mt-2">
                  <HStack className="items-center gap-1">
                    <Icon as={Link2} size={14} color="#87CEEB" />
                    <Text className="text-xs text-skyBlue underline">{t('cloudExport.openLink')}</Text>
                  </HStack>
                </Pressable>
              </Box>
            ) : null}

            {message ? (
              <Text className="text-xs text-phase-text-secondary">{message}</Text>
            ) : null}

            <Button variant="ghost" onPress={saveLocal} isDisabled={!bytes}>
              <Icon as={Download} size={16} color="#544A3D" />
              <ButtonText>{t('cloudExport.saveLocal')}</ButtonText>
            </Button>
          </>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}