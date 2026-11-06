import { useConsentStore } from '@repo/core/logic';
import { Button, Dialog } from '@repo/ui/components/native';
import { Shield } from '@repo/ui/icons';
import { HStack, Link, LinkText, Text, VStack } from '@repo/ui/primitives';
import { EXTERNAL_URLS } from '@repo/ui/utils';

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
    <Dialog
      open={isOpen}
      onClose={handleDecline}
      title="Privacy & Consent"
      description="In compliance with the Personal Data Protection Act (PDPA), we ask whether you want to allow telemetry and product analytics. Essential service operation does not depend on optional analytics."
      dismissable={false}
      actions={
        <HStack className="gap-3 justify-end mt-4">
          <Button variant="secondary" size="sm" label="Decline" onPress={handleDecline} />
          <Button variant="primary" size="sm" label="Accept" onPress={handleAccept} />
        </HStack>
      }
    >
      <VStack className="gap-4 my-2">
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
      </VStack>
    </Dialog>
  );
}
