import React from 'react';
import { useConsentStore } from '@repo/core/logic';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Button, ButtonText, Text, VStack, HStack } from '@repo/ui/primitives';
import { Shield } from '@repo/ui/icons';

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
          We value your privacy. In compliance with the Personal Data Protection Act (PDPA), we request your consent to collect and process telemetry and usage analytics.
        </Text>
        <Text className="text-phase-text-secondary text-xs leading-relaxed">
          These analytics help us monitor app performance, track crashes, and continuously improve your experience. No personally identifiable data is shared or sold.
        </Text>
        <HStack className="gap-3 justify-end mt-4">
          <Button variant="outline" action="secondary" onPress={handleDecline} size="sm">
            <ButtonText>Decline</ButtonText>
          </Button>
          <Button action="primary" onPress={handleAccept} size="sm">
            <ButtonText>Accept</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}
