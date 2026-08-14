import { useConsentStore } from '@repo/core/logic';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Button, ButtonText, HStack, Link, LinkText, Text, VStack } from '@repo/ui/primitives';
import { EXTERNAL_URLS } from '@repo/ui/utils';

function ShieldGlyph() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-phase-text-primary"
    >
      <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.5-3.5" />
    </svg>
  );
}

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
      icon={<ShieldGlyph />}
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
