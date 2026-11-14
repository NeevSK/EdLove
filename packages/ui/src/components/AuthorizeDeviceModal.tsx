import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Laptop, ShieldAlert, ShieldCheck } from '@repo/ui/icons';
import { Box, Button, ButtonSpinner, ButtonText, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import React, { memo } from 'react';

export interface DevicePairingMetadata {
  platform?: string;
  userAgent?: string;
  screen?: string;
  browser?: string;
}

export interface AuthorizeDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize: () => Promise<void> | void;
  onReject: () => Promise<void> | void;
  isLoading?: boolean;
  metadata?: DevicePairingMetadata | null;
  accountDisplayName?: string | null;
  accountEmail?: string | null;
}

function parseBrowserDetails(userAgent?: string, platform?: string): { browser: string; os: string } {
  const ua = userAgent || '';
  let browser = 'Web Browser';
  let os = platform || 'Desktop';

  if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('Edge')) browser = 'Microsoft Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

export const AuthorizeDeviceModal = memo(function AuthorizeDeviceModal({
  isOpen,
  onClose,
  onAuthorize,
  onReject,
  isLoading = false,
  metadata,
  accountDisplayName = 'Current User',
  accountEmail,
}: AuthorizeDeviceModalProps) {
  const { browser, os } = parseBrowserDetails(metadata?.userAgent, metadata?.platform);

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorize New Device"
      size="md"
    >
      <VStack className="gap-5 p-2">
        <HStack className="items-center justify-between">
          <HStack className="items-center gap-3">
            <Box className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30">
              <ShieldCheck color={Theme.colors.sanctuarySaffron} size={22} />
            </Box>
            <VStack className="gap-0.5">
              <Heading className="text-lg font-bold text-phase-primary">
                Authorize New Device
              </Heading>
              <Text className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Cryptographic QR Pairing
              </Text>
            </VStack>
          </HStack>
        </HStack>

        <Text className="text-sm leading-relaxed text-phase-secondary">
          A web browser scanned from your camera is requesting immediate, authenticated access to your sanctuary account.
        </Text>

        <Box className="rounded-2xl border border-phase-border bg-phase-world p-4">
          <HStack className="items-center gap-4">
            <Box className="h-12 w-12 items-center justify-center rounded-2xl bg-phase-accent/10 border border-phase-border">
              <Laptop size={24} color={Theme.colors.sanctuarySaffron} />
            </Box>
            <VStack className="flex-1 gap-1">
              <Text className="text-base font-bold text-phase-primary">
                {browser} on {os}
              </Text>
              <Text className="text-xs text-phase-secondary">
                {metadata?.screen ? `Screen: ${metadata.screen}` : 'Web Workstation'}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box className="rounded-2xl border border-phase-border bg-phase-surface p-3.5">
          <VStack className="gap-1">
            <Text className="text-[11px] font-bold text-phase-muted uppercase tracking-wider">
              Account to Link
            </Text>
            <Text className="text-sm font-bold text-phase-primary">
              {accountDisplayName}
            </Text>
            {accountEmail ? (
              <Text className="text-xs text-phase-secondary opacity-75">
                {accountEmail}
              </Text>
            ) : null}
          </VStack>
        </Box>

        <HStack className="items-center gap-2 px-1">
          <ShieldAlert size={14} color="#f59e0b" />
          <Text className="text-[11px] text-amber-600 font-medium">
            Only authorize if you initiated this on your own computer screen.
          </Text>
        </HStack>

        <HStack className="gap-3 mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl h-12"
            onPress={() => void onReject()}
            isDisabled={isLoading}
          >
            <ButtonText className="text-phase-secondary font-semibold">Reject</ButtonText>
          </Button>

          <Button
            variant="solid"
            className="flex-1 rounded-2xl h-12 bg-amber-600"
            onPress={() => void onAuthorize()}
            isDisabled={isLoading}
          >
            {isLoading ? (
              <ButtonSpinner color="#ffffff" />
            ) : (
              <ButtonText className="text-white font-bold">Authorize Device</ButtonText>
            )}
          </Button>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
});

export default AuthorizeDeviceModal;
