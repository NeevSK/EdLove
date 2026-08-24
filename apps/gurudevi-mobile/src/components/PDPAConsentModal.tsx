import { useConsentStore } from '@repo/core/logic';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Shield } from '@repo/ui/icons';
import { HStack, Link, LinkText, Text, VStack } from '@repo/ui/primitives';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import React from 'react';

interface PDPAConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PDPAConsentModal({ isOpen, onClose }: PDPAConsentModalProps) {
  const { grantConsent, denyConsent } = useConsentStore();

  const handleAccept = () => {
    grantConsent();
    onClose();
  };

  const handleDecline = () => {
    denyConsent();
    onClose();
  };

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={handleDecline}
      title="Privacy & Consent"
      subtitle="PDPA Compliance"
      icon={<Shield size={24} className="text-phase-text-primary" />}
      showCloseButton={false}
    >
      <VStack className="gap-4">
        <Text className="text-phase-text-primary text-sm leading-relaxed">
          We value your privacy. Essential service operation does not depend on optional analytics.
          In compliance with the Personal Data Protection Act (PDPA), we ask whether you want to
          allow telemetry and product analytics.
        </Text>
        <Text className="text-phase-text-secondary text-xs leading-relaxed">
          Allowing analytics helps us monitor app performance and improve the experience. We do not
          sell personal information. You can decline, and you can read the{' '}
          <Link href={EXTERNAL_URLS.privacy} isExternal>
            <LinkText>Privacy Policy</LinkText>
          </Link>{' '}
          and{' '}
          <Link href={EXTERNAL_URLS.terms} isExternal>
            <LinkText>Terms of Use</LinkText>
          </Link>{' '}
          before choosing.
        </Text>
        <HStack className="gap-3 justify-end mt-4">
          <SanctuaryButton variant="outline" action="secondary" onPress={handleDecline} size="sm">
            Decline
          </SanctuaryButton>
          <SanctuaryButton action="primary" onPress={handleAccept} size="sm">
            Accept
          </SanctuaryButton>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}
