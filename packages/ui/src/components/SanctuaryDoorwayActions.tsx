import { Box, Spinner, Text, VStack } from '@repo/ui/primitives';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PressableScale } from './PressableScale';

export interface SanctuaryDoorwayActionsProps {
  isConnecting?: boolean;
  hasPreviousSession?: boolean;
  onExploreGuest: () => void | Promise<void>;
  onSignIn: () => void;
  guestLabel?: string;
  signInLabel?: string;
}

export const SanctuaryDoorwayActions = memo(
  ({
    isConnecting = false,
    onExploreGuest,
    onSignIn,
    guestLabel,
    signInLabel,
  }: SanctuaryDoorwayActionsProps) => {
    const { t } = useTranslation();

    const resolvedGuestLabel =
      guestLabel ?? t('welcome.exploreAsGuest', { defaultValue: 'Explore as Guest' });

    const resolvedSignInLabel =
      signInLabel ?? t('welcome.login', { defaultValue: 'I have an account. Log In' });

    return (
      <VStack className="gap-3 pt-2 w-full">
        {/* Primary Action Button: 56dp height for optimal mobile ergonomics */}
        <PressableScale
          onPress={() => {
            void onExploreGuest();
          }}
          disabled={isConnecting}
          accessibilityRole="button"
          accessibilityLabel={resolvedGuestLabel}
          accessibilityState={{ busy: isConnecting, disabled: isConnecting }}
        >
          <Box className="h-[56px] w-full rounded-2xl bg-phase-accent justify-center items-center shadow-md">
            {isConnecting ? (
              <Spinner color="white" />
            ) : (
              <Text className="text-white font-bold text-lg tracking-wide">
                {resolvedGuestLabel}
              </Text>
            )}
          </Box>
        </PressableScale>

        {/* Secondary Action Button: 50dp height, clear contrast, first-class account doorway */}
        <PressableScale
          onPress={onSignIn}
          accessibilityRole="button"
          accessibilityLabel={resolvedSignInLabel}
        >
          <Box className="h-[50px] w-full rounded-2xl border border-phase-border bg-phase-surface/60 justify-center items-center">
            <Text className="text-phase-text-primary font-semibold text-base">
              {resolvedSignInLabel}
            </Text>
          </Box>
        </PressableScale>
      </VStack>
    );
  },
);

SanctuaryDoorwayActions.displayName = 'SanctuaryDoorwayActions';

export default SanctuaryDoorwayActions;
