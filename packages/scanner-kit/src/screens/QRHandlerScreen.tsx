import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { identityAPI } from '@repo/core/api/client';
import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';
import { FlowResolver } from '@repo/core/native';
import type { QRPayload } from '@repo/core/types';
import AuthorizeDeviceModal, { type DevicePairingMetadata } from '@repo/ui/components/AuthorizeDeviceModal';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Check, ShieldCheck, Sparkles, X } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Pressable, Spinner, Text, VStack } from '@repo/ui/primitives';
import { hapticError, hapticSelection, hapticSuccess } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function QRHandlerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'preview' | 'processing' | 'success' | 'error'>('preview');
  const [message, setMessage] = useState('');
  const [deviceMetadata, setDeviceMetadata] = useState<DevicePairingMetadata | null>(null);
  const [accountProfile, setAccountProfile] = useState<{ displayName: string; email: string } | null>(null);
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);

  const payload = useMemo(() => {
    if (!params.payload) return undefined;
    try {
      return JSON.parse(params.payload) as QRPayload;
    } catch (error) {
      console.error('[QRHandlerScreen] invalid QR payload', error);
      return undefined;
    }
  }, [params.payload]);

  useEffect(() => {
    if (payload?.action === 'link_device') {
      setIsAuthorizeModalOpen(true);
      void (async () => {
        try {
          const { data } = await supabaseClient.rpc('get_device_pairing_challenge', {
            p_challenge_id: payload.challenge_id,
          });
          if (data?.target_metadata) {
            setDeviceMetadata(data.target_metadata as DevicePairingMetadata);
          }
        } catch (err) {
          console.warn('[QRHandlerScreen] Failed to load challenge metadata', err);
        }
        try {
          const citizen = await identityAPI.identifyActiveCitizen();
          if (citizen) {
            setAccountProfile({
              displayName: citizen.display_name || 'Current User',
              email: citizen.email || '',
            });
          }
        } catch (err) {
          console.warn('[QRHandlerScreen] Failed to load citizen profile', err);
        }
      })();
    }
  }, [payload]);

  const rejectDeviceLink = useCallback(async () => {
    setIsAuthorizeModalOpen(false);
    if (payload?.action === 'link_device') {
      try {
        await supabaseClient.rpc('authorize_device_pairing', {
          p_challenge_id: payload.challenge_id,
          p_approve: false,
        });
      } catch (e) {
        console.warn('[QRHandlerScreen] Reject pairing error:', e);
      }
    }
    safeBack('/workspace');
  }, [payload]);

  const executeAction = useCallback(
    async (p: QRPayload) => {
      setStatus('processing');
      try {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) {
          // Stash intent in pendingIntentStore so SessionRouteGate resumes it after sign-in
          pendingIntentStore.getState().setPendingIntent({
            targetPath: `/qr?payload=${encodeURIComponent(JSON.stringify(p))}`,
            intentKind: 'qr',
            params: { payload: JSON.stringify(p) },
            originalUrl: `https://gurudevi.app/qr?v=1&action=${p.action}`,
          });
          router.replace('/welcome');
          return;
        }

        if (p.action === 'link_device') {
          // Mandatory biometric gate to eliminate zero-consent camera hijacking
          const hasHardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
          const isEnrolled = await LocalAuthentication.isEnrolledAsync().catch(() => false);

          if (hasHardware && isEnrolled) {
            const authResult = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Authorize Web Browser Login',
              cancelLabel: 'Cancel',
              fallbackLabel: 'Enter Passcode',
              disableDeviceFallback: false,
            });

            if (!authResult.success) {
              hapticError();
              setStatus('error');
              setMessage('Biometric authorization required to link device');
              return;
            }
          }
        }

        const result = await FlowResolver.resolveQR(p, myId);

        if (result.outcome === 'success') {
          hapticSuccess();
          setStatus('success');
          setMessage(t('qrHandler.actionSuccess') || 'Action completed successfully');

          if (result.intent) {
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
              setTimeout(action, 1200);
            }
          }
        } else if (result.outcome === 'redirect') {
          setStatus('success');
          setMessage(result.message || t('qrHandler.actionSuccess') || 'Redirecting...');
          if (result.intent === 'GOTO_THUTHIMAL_CLAIM') {
            router.replace({
              pathname: '/thuthimal-claim',
              params: result.params as Record<string, string>,
            });
          } else if (result.intent === 'GOTO_CLASSROOM') {
            router.push('/workspace/classroom');
          }
        } else {
          throw new Error(result.message);
        }
      } catch (err: any) {
        console.error('QRHandlerScreen error:', err);
        hapticError();
        setStatus('error');
        setMessage(err?.message || t('qrHandler.somethingWrong') || 'Could not complete action');
        setTimeout(() => safeBack('/workspace'), 2500);
      }
    },
    [router, t],
  );

  const getActionMetadata = (p: QRPayload) => {
    switch (p.action) {
      case 'join_class':
        return {
          title: 'Classroom Enrollment',
          description: p.handle ? `Join classroom ${p.handle}` : 'Join classroom roster',
          badge: 'Verified Course',
        };
      case 'join_school':
        return {
          title: 'School Discovery',
          description: p.handle ? `Connect with school ${p.handle}` : 'Connect with school community',
          badge: 'Institutional HQ',
        };
      case 'join_group':
        return {
          title: 'Community Group',
          description: p.handle ? `Join group @${p.handle}` : 'Join community discussion circle',
          badge: 'Sovereign Circle',
        };
      case 'claim_invite':
        return {
          title: 'Identity Desk Pass',
          description: `Capacity invitation for role: ${p.capacity}`,
          badge: 'Signed Passcode',
        };
      case 'thuthimal_gift':
        return {
          title: 'Thuthimal Subscription Gift',
          description: `Gifted with care by ${p.gifter_name}`,
          badge: 'Philanthropic Pass',
        };
      case 'link_device':
        return {
          title: 'Link Web Browser Session',
          description: `Authorize login for browser session on ${p.platform ? p.platform.toUpperCase() : 'Web'}`,
          badge: 'Device Pairing',
        };
      default:
        return {
          title: 'Sanctuary Intent',
          description: 'A verified sovereign action is ready to execute',
          badge: 'Sovereign Action',
        };
    }
  };

  if (!payload) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-6">
          <VStack className="items-center gap-4">
            <Text className="text-[48px]">⚠️</Text>
            <Heading size="lg" className="text-center text-phaseText-primary font-black">
              No QR Payload Detected
            </Heading>
            <Text className="text-center text-phaseText-secondary text-sm">
              Please scan a valid Gurudevi QR code with your camera.
            </Text>
            <Pressable
              onPress={() => safeBack('/workspace')}
              className="mt-4 px-6 py-3 rounded-full bg-phase-interactive"
            >
              <Text className="text-white font-bold text-sm">Return to Workspace</Text>
            </Pressable>
          </VStack>
        </Box>
      </ScreenWrapper>
    );
  }

  const meta = getActionMetadata(payload);

  return (
    <ScreenWrapper>
      <Box className="flex-1 items-center justify-center p-6 bg-phase-canvas">
        {status === 'preview' && (
          <VStack className="w-full max-w-sm p-6 rounded-[36px] bg-phase-surface border border-phase-border shadow-2xl items-center gap-6">
            {/* Top Shield Badge */}
            <Box className="w-16 h-16 rounded-full bg-phase-interactive/10 items-center justify-center border border-phase-interactive/20">
              <Icon as={ShieldCheck} size={32} className="text-phase-interactive" />
            </Box>

            <VStack className="items-center gap-1.5 px-2">
              <Box className="px-3 py-1 rounded-full bg-phase-interactive/10 mb-1">
                <Text className="text-[10px] font-mono font-black text-phase-interactive uppercase tracking-wider">
                  {meta.badge}
                </Text>
              </Box>
              <Heading size="xl" className="text-center font-black text-phaseText-primary">
                {meta.title}
              </Heading>
              <Text className="text-xs text-center text-phaseText-secondary font-medium leading-relaxed">
                {meta.description}
              </Text>
            </VStack>

            <Box className="w-full p-4 rounded-2xl bg-phase-canvas border border-phase-border/60">
              <Text className="text-[11px] text-phaseText-muted text-center font-medium">
                No permissions or memberships will be modified until you confirm below.
              </Text>
            </Box>

            {/* Action Buttons */}
            <VStack className="w-full gap-3 mt-2">
              <Pressable
                onPress={() => {
                  hapticSelection();
                  void executeAction(payload);
                }}
                className="w-full min-h-[50px] rounded-2xl bg-phase-interactive items-center justify-center flex-row gap-2 shadow-md"
                accessibilityRole="button"
                accessibilityLabel="Confirm and proceed"
              >
                <Icon as={Check} size={18} className="text-white" />
                <Text className="text-white font-black text-sm uppercase tracking-wider">
                  Confirm & Proceed
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticSelection();
                  safeBack('/workspace');
                }}
                className="w-full min-h-[46px] rounded-2xl bg-phase-canvas border border-phase-border items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Cancel and return"
              >
                <Text className="text-phaseText-primary font-bold text-xs uppercase tracking-wider">
                  Cancel
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        )}

        {status === 'processing' && (
          <VStack className="items-center gap-4">
            <Spinner size="large" className="text-phase-interactive" />
            <Heading size="lg" className="text-center text-phaseText-primary font-black">
              {t('qrHandler.processing') || 'Executing Sovereign Action...'}
            </Heading>
            <Text className="text-center text-phaseText-secondary text-xs">
              {t('qrHandler.processingMessage') || 'Securing cryptographic handshake...'}
            </Text>
          </VStack>
        )}

        {status === 'success' && (
          <VStack className="items-center gap-4">
            <Box className="w-20 h-20 rounded-full bg-emerald-500/10 items-center justify-center border border-emerald-500/30">
              <Icon as={Check} size={40} className="text-emerald-600" />
            </Box>
            <Heading size="xl" className="text-center text-emerald-700 font-black">
              {t('qrHandler.done') || 'Action Complete'}
            </Heading>
            <Text className="text-center text-phaseText-secondary text-sm font-medium">
              {message}
            </Text>
          </VStack>
        )}

        {status === 'error' && (
          <VStack className="items-center gap-4">
            <Text className="text-[56px]">⚠️</Text>
            <Heading size="xl" className="text-center text-rose-600 font-black">
              {t('qrHandler.error') || 'Unable to Complete Action'}
            </Heading>
            <Text className="text-center text-phaseText-secondary text-sm">
              {message}
            </Text>
          </VStack>
        )}
      </Box>

      {payload?.action === 'link_device' && (
        <AuthorizeDeviceModal
          isOpen={isAuthorizeModalOpen && status === 'preview'}
          onClose={() => {
            setIsAuthorizeModalOpen(false);
            safeBack('/workspace');
          }}
          onAuthorize={async () => {
            setIsAuthorizeModalOpen(false);
            await executeAction(payload);
          }}
          onReject={rejectDeviceLink}
          isLoading={status === 'processing'}
          metadata={deviceMetadata}
          accountDisplayName={accountProfile?.displayName || 'Current User'}
          accountEmail={accountProfile?.email}
        />
      )}
    </ScreenWrapper>
  );
}

