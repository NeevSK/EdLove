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

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Spinner,
  ScreenWrapper,
  Theme,
} from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FlowResolver, identityAPI, type QRPayload } from '@repo/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticSuccess, hapticError } from '@repo/ui';
import { useTranslation } from 'react-i18next';

type QRHandlerRouteParams = {
  QRHandler: { payload: QRPayload };
};

export default function QRHandlerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<QRHandlerRouteParams, 'QRHandler'>>();
  const colors = useThemedColors();
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
            'GOTO_CLASSROOM': () => navigation.navigate('Main', { screen: 'Classroom' }),
            'GOTO_COMMUNITY': () => navigation.navigate('Main', { screen: 'Community' }),
            'GOTO_SELF': () => navigation.navigate('Main', { screen: 'Self' }),
            'GOTO_THUTHIMAL_CLAIM': () => navigation.replace('ThuthimalClaim', result.params)
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

  const statusColor =
    status === 'success'
      ? Theme.colors.sageGreen
      : status === 'error'
        ? Theme.colors.emberRed
        : Theme.colors.sanctuarySaffron;

  return (
    <ScreenWrapper>
      <Box 
        sx={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: Theme.spacing.xl 
        }}
      >
        <VStack sx={{ alignItems: 'center', gap: Theme.spacing.lg }}>
          {status === 'processing' && (
            <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
          )}
          {status === 'success' && (
            <Text sx={{ fontSize: 56 }}>✅</Text>
          )}
          {status === 'error' && (
            <Text sx={{ fontSize: 56 }}>⚠️</Text>
          )}
          <Heading
            sx={{ textAlign: 'center', fontSize: Theme.typography.fontSize.xl }}
            color={statusColor as any}
          >
            {status === 'processing' ? t('qrHandler.processing') : status === 'success' ? t('qrHandler.done') : t('qrHandler.error')}
          </Heading>
          <Text
            sx={{ textAlign: 'center', color: colors.textSecondary }}
          >
            {status === 'processing' ? t('qrHandler.processingMessage') : message}
          </Text>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}
