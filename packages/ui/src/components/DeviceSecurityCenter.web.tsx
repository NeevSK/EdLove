import DeviceAccountManager from '@repo/ui/components/DeviceAccountManager';
import { Box, Heading, Text, VStack } from '@repo/ui/primitives';

export default function DeviceSecurityCenter({ compact = false }: { compact?: boolean }) {
  return (
    <VStack className={compact ? 'gap-3' : 'gap-5'}>
      <Box className="rounded-3xl border border-phase-border bg-phase-surface p-5">
        <Heading className="text-xl font-bold text-phase-primary">Browser account security</Heading>
        <Text className="mt-2 text-sm leading-relaxed text-phase-secondary">
          This browser can remember and switch its local Gurudevi accounts. Those records stay in
          this browser profile.
        </Text>
        <Text
          accessibilityRole="alert"
          className="mt-4 text-sm leading-relaxed text-phase-secondary"
        >
          Remote device lists, remote session revocation, and device unlinking are not available in
          the browser yet. Use the mobile app for those security controls.
        </Text>
      </Box>
      <DeviceAccountManager compact={compact} />
    </VStack>
  );
}
