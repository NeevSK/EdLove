/**
 * QRHandlerScreen \u2014 Modal screen that executes an incoming QR action
 *
 * Mounted as a modal in RootStack.Navigator. Receives a QRPayload via route params
 * (injected by useQRDeepLink) and executes the appropriate action with visual feedback.
 *
 * Handles:
 *   join_school   \u2192 joins school + community group, navigates to Classroom tab
 *   join_class    \u2192 joins classroom, navigates to Classroom tab
 *   join_group    \u2192 joins community group, navigates to Community tab
 *   claim_invite  \u2192 claims role-specific school invite
 *   user_invite   \u2192 stores attribution, navigates to Auth if needed
 *   thuthimal_gift \u2192 navigated from here to ThuthimalClaimScreen
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { identityAPI } from '@repo/core/api';
import { FlowResolver } from '@repo/core/native';
import { ScreenWrapper } from '@repo/ui';
import { useThemedColors } from '@repo/ui/hooks';
import { type Box, Heading, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticError, hapticSuccess } from '@repo/ui/utils/haptics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { QRPayload } from '../types';

type QRHandlerRouteParams = {
  QRHandler: {
    payload: QRPayload;
  };
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
  }, [payload, navigation.goBack, executeAction]);
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
  const statusColor =
    status === 'success'
      ? Theme.colors.sageGreen
      : status === 'error'
        ? Theme.colors.emberRed
        : Theme.colors.sanctuarySaffron;
  return (
    (
      <ScreenWrapper<Box>
        sx={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Theme.spacing.xl,
        }}
      />
    ),
    (
      <_VStack
        sx={{ alignItems: 'center', _gap: _Theme._spacing._lg }}
        {...(status === 'processing' && (
          <_Spinner _size="large" _color={Theme.colors.sanctuarySaffron} />
        ))}
        {...(status === 'success' && <Text sx={{ fontSize: 56 }}>\u2705</Text>)}
        {...(status === 'error' && <Text sx={{ fontSize: 56 }}>\u26A0\uFE0F</Text>)}
      />
    ),
    (
      <Heading
        sx={{ textAlign: 'center', fontSize: Theme.typography.fontSize.xl }}
        color={statusColor as any}
        {...(status === 'processing'
          ? t('qrHandler.processing')
          : status === 'success'
            ? t('qrHandler.done')
            : t('qrHandler.error'))}
        Heading
      />
    ),
    (
      <Text
        sx={{ textAlign: 'center', color: colors.textSecondary }}
        {...(status === 'processing' ? t('qrHandler.processingMessage') : message)}
        Text
        VStack
        Box
        ScreenWrapper
      />
    )
  );
}
