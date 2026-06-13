import AsyncStorage from '@react-native-async-storage/async-storage';
import { identityAPI } from '@repo/core/api';
import { FlowResolver } from '@repo/core/native';
import type { QRPayload } from '@repo/core/types';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Heading, Spinner, Text, VStack } from '@repo/ui/primitives';
import { hapticError, hapticSuccess } from '@repo/ui/utils/haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { safeBack } from '@repo/ui/utils/navigation';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function QRHandlerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  const payload = useMemo(() => {
    if (!params.payload) return undefined;
    try {
      return JSON.parse(params.payload) as QRPayload;
    } catch (error) {
      console.error('[QRHandlerScreen] invalid QR payload', error);
      return undefined;
    }
  }, [params.payload]);

  const executeAction = useCallback(
    async (p: QRPayload) => {
      try {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) {
          // Store and redirect to auth
          await AsyncStorage.setItem('pending_qr_action', JSON.stringify(p));
          router.push('/auth');
          return;
        }

        const result = await FlowResolver.resolveQR(p, myId);

        if (result.outcome === 'success') {
          hapticSuccess();
          setStatus('success');
          setMessage(t('qrHandler.actionSuccess'));

          if (result.intent) {
            // Map Abstract Core Intent -> Mobile Specific Navigation
            const intentMap: Record<string, () => void> = {
              GOTO_CLASSROOM: () => router.push('/workspace/classroom'),
              GOTO_COMMUNITY: () => router.push('/community'),
              GOTO_SELF: () => router.push('/self'),
              GOTO_THUTHIMAL_CLAIM: () =>
                router.replace({
                  pathname: '/thuthimal-claim',
                  params: result.params as Record<string, string>,
                }),
            };

            const action = intentMap[result.intent];
            if (action) {
              setTimeout(action, 1500);
            }
          }
        } else if (result.outcome === 'redirect') {
          setStatus('success');
          setMessage(t('qrHandler.actionSuccess'));
          if (result.intent === 'GOTO_THUTHIMAL_CLAIM') {
            router.replace({
              pathname: '/thuthimal-claim',
              params: result.params as Record<string, string>,
            });
          }
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error('QRHandlerScreen error:', err);
        hapticError();
        setStatus('error');
        setMessage(t('qrHandler.somethingWrong'));
        setTimeout(() => safeBack('/self'), 2500);
      }
    },
    [router, t],
  );

  useEffect(() => {
    if (!payload) {
      safeBack('/self');
      return;
    }
    void executeAction(payload);
  }, [payload, router, executeAction]);

  return (
    <ScreenWrapper>
      <Box className="flex-1 items-center justify-center p-6">
        <VStack className="items-center gap-4">
          {status === 'processing' && <Spinner size="large" className="text-primary-500" />}
          {status === 'success' && <Text className="text-[56px]">✅</Text>}
          {status === 'error' && <Text className="text-[56px]">⚠️</Text>}
          <Heading
            className={`text-center ${
              status === 'success'
                ? 'text-success-600'
                : status === 'error'
                  ? 'text-error-600'
                  : 'text-primary-500'
            }`}
            size="xl"
          >
            {status === 'processing'
              ? t('qrHandler.processing')
              : status === 'success'
                ? t('qrHandler.done')
                : t('qrHandler.error')}
          </Heading>
          <Text className="text-center text-typography-500">
            {status === 'processing' ? t('qrHandler.processingMessage') : message}
          </Text>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}
