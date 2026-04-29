/**
 * QRHandlerScreen — Modal screen that executes an incoming QR action
 *
 * Mounted as a modal in RootStack.Navigator. Receives a QRPayload via route params
 * (injected by useQRDeepLink) and executes the appropriate action with visual feedback.
 *
 * Handles:
 *   join_school   → joins school + community group, navigates to Classroom tab
 *   join_class    → joins classroom, navigates to Classroom tab
 *   join_group    → joins community group, navigates to Community tab
 *   claim_invite  → claims role-specific school invite
 *   user_invite   → stores attribution, navigates to Auth if needed
 *   thuthimal_gift → navigated from here to ThuthimalClaimScreen
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { identityAPI } from '@repo/core/api';
import { FlowResolver } from '@repo/core/native';
import type { QRPayload } from '@repo/core/types';

import { Box, Heading, ScreenWrapper, Spinner, Text, VStack } from '@repo/ui';
import { hapticError, hapticSuccess } from '@repo/ui/utils/haptics';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type QRHandlerRouteParams = {
  QRHandler: { payload: QRPayload };
};

export default function QRHandlerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<QRHandlerRouteParams, 'QRHandler'>>();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  const payload = route.params?.payload;

  useEffect(() => {
    if (!payload) {
      navigation.goBack();
      return;
    }
    executeAction(payload);
  }, []);

  const executeAction = async (p: QRPayload) => {
    try {
      const myId = await identityAPI.getMyInternalId();
      if (!myId) {
        // Store and redirect to auth
        await AsyncStorage.setItem('pending_qr_action', JSON.stringify(p));
        navigation.navigate('Auth');
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
            GOTO_CLASSROOM: () => navigation.navigate('Main', { screen: 'Classroom' }),
            GOTO_COMMUNITY: () => navigation.navigate('Main', { screen: 'Community' }),
            GOTO_SELF: () => navigation.navigate('Main', { screen: 'Self' }),
            GOTO_THUTHIMAL_CLAIM: () => navigation.replace('ThuthimalClaim', result.params),
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
          navigation.replace('ThuthimalClaim', result.params);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('QRHandlerScreen error:', err);
      hapticError();
      setStatus('error');
      setMessage(t('qrHandler.somethingWrong'));
      setTimeout(() => navigation.goBack(), 2500);
    }
  };

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
