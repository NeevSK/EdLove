import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import {
  ArrowLeftRight,
  Check,
  ExternalLink,
  Globe,
  ShieldAlert,
  ShieldCheck,
} from '@repo/ui/icons';
import { Box, Pressable as GSPressable, HStack, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import {
  clearStoredExternalOpenPreference,
  type ExternalLinkTrustLevel,
  type ExternalOpenMethod,
  registerExternalLinkRuntime,
} from '@repo/ui/utils/linking';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface PendingRequest {
  url: string;
  options: {
    title?: string;
    sourceLabel?: string;
    sourceBadge?: string;
    trustLevel?: ExternalLinkTrustLevel;
  };
  platform: 'web' | 'native';
  defaultMethod: ExternalOpenMethod;
  currentPreference?: ExternalOpenMethod;
  domain: string;
  overrideCount: number;
  resolve: (result: { method: ExternalOpenMethod; persistPreference: boolean } | null) => void;
}

type MethodDefinition = {
  id: ExternalOpenMethod;
  title: string;
  description: string;
};

const webMethods: MethodDefinition[] = [
  {
    id: 'new_tab',
    title: 'Open in New Tab',
    description: 'Keeps Gurudevi open and preserves your place in the sanctuary.',
  },
  {
    id: 'same_tab',
    title: 'Open Here',
    description: 'Replaces the current tab and follows the link in this browser view.',
  },
];

const nativeMethods: MethodDefinition[] = [
  {
    id: 'in_app_browser',
    title: 'Open in App Browser',
    description: 'Stays close to Gurudevi and returns smoothly when you are done.',
  },
  {
    id: 'external_browser',
    title: 'Open in Browser App',
    description: 'Hands off to your default browser for a fully external experience.',
  },
];

function getTrustCopy(level: ExternalLinkTrustLevel | undefined) {
  switch (level) {
    case 'verified':
      return {
        label: 'Verified source',
        note: 'This destination is known and trusted inside the sanctuary.',
        icon: ShieldCheck,
      };
    case 'broken':
      return {
        label: 'Broken or unverified',
        note: 'This link may fail. If it does, you can try another method or report it.',
        icon: ShieldAlert,
      };
    default:
      return {
        label: 'External source',
        note: 'You are moving beyond Gurudevi to a site we do not fully control.',
        icon: Globe,
      };
  }
}

interface MethodItemProps {
  method: MethodDefinition;
  isSelected: boolean;
  onSelect: (id: ExternalOpenMethod) => void;
}

const MethodItem = React.memo(({ method, isSelected, onSelect }: MethodItemProps) => {
  const handlePress = React.useCallback(() => {
    onSelect(method.id);
  }, [method.id, onSelect]);

  return (
    <GSPressable
      accessibilityRole="button"
      onPress={handlePress}
      className="p-4 rounded-xl flex-row items-center gap-3"
      style={{
        backgroundColor: isSelected ? '#FAF2DE' : '#F5EFE0',
        borderWidth: 1.5,
        borderColor: isSelected ? '#C47020' : 'rgba(42, 35, 24, 0.15)',
      }}
    >
      <Box
        className="w-5 h-5 rounded-full items-center justify-center"
        style={{
          borderWidth: 1.5,
          borderColor: isSelected ? '#C47020' : 'rgba(42, 35, 24, 0.3)',
          backgroundColor: isSelected ? '#C47020' : 'transparent',
        }}
      >
        {isSelected ? (
          <Box className="text-white">
            <Check size={10} color="#FFFFFF" />
          </Box>
        ) : null}
      </Box>
      <VStack className="flex-1">
        <Text className="text-phase-text-primary font-bold">{method.title}</Text>
        <Text className="text-phase-text-secondary text-[13px] leading-5">
          {method.description}
        </Text>
      </VStack>
    </GSPressable>
  );
});

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useOfflineStatus();
  const { showToast } = useSanctuaryToast();
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ExternalOpenMethod>('new_tab');
  const [rememberChoice, setRememberChoice] = useState(true);

  useEffect(() => {
    registerExternalLinkRuntime({
      promptForChoice: (request) => {
        setSelectedMethod(request.currentPreference ?? request.defaultMethod);
        setRememberChoice(!request.currentPreference);
        return new Promise((resolve) => {
          setPendingRequest({ ...request, resolve });
        });
      },
      isOnline: () => isOnlineRef.current,
      notifyOffline: (message) => showToastRef.current({ message, type: 'error' }),
    });

    return () => registerExternalLinkRuntime(null);
  }, []);

  const methods = useMemo(
    () => (pendingRequest ? (pendingRequest.platform === 'web' ? webMethods : nativeMethods) : []),
    [pendingRequest],
  );

  const trustCopy = useMemo(
    () => getTrustCopy(pendingRequest?.options.trustLevel),
    [pendingRequest],
  );

  const TrustIcon = trustCopy.icon;

  const modalSubtitle = useMemo(() => {
    if (!pendingRequest) return '';

    const source = pendingRequest.options.sourceLabel ?? 'Gurudevi';
    if (pendingRequest.currentPreference) {
      return `Your current default from ${source} can be changed here at any time.`;
    }
    return `Choose how links from ${source} should open on this ${pendingRequest.platform === 'web' ? 'browser' : 'device'}.`;
  }, [pendingRequest]);

  const closeRequest = React.useCallback(
    (result: { method: ExternalOpenMethod; persistPreference: boolean } | null) => {
      if (!pendingRequest) return;
      pendingRequest.resolve(result);
      setPendingRequest(null);
    },
    [pendingRequest],
  );

  const handleOpenNow = React.useCallback(() => {
    closeRequest({
      method: selectedMethod,
      persistPreference: rememberChoice,
    });
  }, [closeRequest, selectedMethod, rememberChoice]);

  const handleSetDefault = React.useCallback(() => {
    closeRequest({
      method: selectedMethod,
      persistPreference: true,
    });
  }, [closeRequest, selectedMethod]);

  const handleResetPreference = React.useCallback(() => {
    clearStoredExternalOpenPreference();
    showToast({
      message: 'Link opening preference reset for this platform.',
      type: 'info',
    });
  }, [showToast]);

  const handleToggleRememberChoice = React.useCallback(() => {
    setRememberChoice((current) => !current);
  }, []);

  return (
    <>
      {children}
      <SanctuaryModal
        isOpen={!!pendingRequest}
        onClose={() => closeRequest(null)}
        title={pendingRequest?.options.title ?? 'Open external link'}
        subtitle={modalSubtitle}
        icon={
          <Box className="text-phase-accent">
            <ExternalLink size={18} />
          </Box>
        }
        size="md"
        footer={
          pendingRequest ? (
            <VStack className="gap-2">
              <HStack className="gap-2 flex-wrap">
                <SanctuaryButton onPress={handleOpenNow} fullWidth>
                  Open Now
                </SanctuaryButton>
              </HStack>
              <HStack className="gap-2 flex-wrap">
                <SanctuaryButton
                  variant="outline"
                  action="secondary"
                  onPress={handleSetDefault}
                  fullWidth
                >
                  Set as Default
                </SanctuaryButton>
              </HStack>
              {pendingRequest.currentPreference && (
                <SanctuaryButton
                  variant="ghost"
                  action="secondary"
                  onPress={handleResetPreference}
                  leftIcon={ArrowLeftRight}
                >
                  Reset Saved Preference
                </SanctuaryButton>
              )}
            </VStack>
          ) : null
        }
      >
        {pendingRequest && (
          <VStack className="gap-4">
            <Box
              className="rounded-xl p-4"
              style={{
                backgroundColor: '#F5EFE0',
                borderWidth: 1,
                borderColor: 'rgba(42, 35, 24, 0.15)',
              }}
            >
              <HStack className="gap-2 items-center mb-1">
                <Box
                  className={
                    trustCopy.label === 'Broken or unverified'
                      ? 'text-phase-danger'
                      : 'text-phase-accent'
                  }
                >
                  <TrustIcon size={16} />
                </Box>
                <Text className="text-phase-text-primary font-bold">{trustCopy.label}</Text>
              </HStack>
              <Text className="text-phase-text-secondary text-[13px] leading-5">
                {trustCopy.note}
              </Text>
              <Text className="text-phase-text-secondary text-[12px] opacity-60 mt-2">
                Destination: {pendingRequest.domain}
              </Text>
              {pendingRequest.options.sourceBadge ? (
                <Text className="text-phase-accent text-[12px] mt-1 font-bold">
                  {pendingRequest.options.sourceBadge}
                </Text>
              ) : null}
              {pendingRequest.overrideCount >= 2 && !pendingRequest.currentPreference ? (
                <Text className="text-phase-text-secondary text-[12px] mt-2">
                  You often choose a different link method. Saving a default may reduce friction.
                </Text>
              ) : null}
            </Box>
            <VStack className="gap-2">
              {methods.map((method) => (
                <MethodItem
                  key={method.id}
                  method={method}
                  isSelected={selectedMethod === method.id}
                  onSelect={setSelectedMethod}
                />
              ))}
            </VStack>
            <GSPressable
              accessibilityRole="button"
              onPress={handleToggleRememberChoice}
              className="flex-row items-center gap-3 rounded-xl p-4"
              style={{
                backgroundColor: '#F5EFE0',
                borderWidth: 1,
                borderColor: 'rgba(42, 35, 24, 0.15)',
              }}
            >
              <Box
                className={`w-5 h-5 rounded-md border-[1.5px] items-center justify-center ${rememberChoice ? 'border-phase-accent bg-phase-accent' : 'border-phase-interactive/30'}`}
              >
                {rememberChoice ? (
                  <Box className="text-white">
                    <Check size={12} />
                  </Box>
                ) : null}
              </Box>
              <VStack className="flex-1">
                <Text className="text-phase-text-primary font-bold">
                  Remember my choice on this{' '}
                  {pendingRequest.platform === 'web' ? 'browser' : 'device'}
                </Text>
                <Text className="text-phase-text-secondary text-[12px]">
                  You can still choose another method whenever you need to.
                </Text>
              </VStack>
            </GSPressable>
          </VStack>
        )}
      </SanctuaryModal>
    </>
  );
}
