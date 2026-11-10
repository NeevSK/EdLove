import { useConsentStore } from '@repo/core/logic';
import { Button, Dialog, Link, Text } from '@repo/ui/components/native';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import { Linking, View } from 'react-native';

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
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <Button variant="secondary" size="sm" label="Decline" onPress={handleDecline} />
          <Button variant="primary" size="sm" label="Accept" onPress={handleAccept} />
        </View>
      }
    >
      <Text kind="caption" tone="soft" style={{ marginVertical: 8 }}>
        Allowing analytics helps us monitor app performance and improve the experience. We do not
        sell personal information. You can decline, and you can read the{' '}
        <Link label="Privacy Policy" onPress={() => void Linking.openURL(EXTERNAL_URLS.privacy)} />{' '}
        and <Link label="Terms of Use" onPress={() => void Linking.openURL(EXTERNAL_URLS.terms)} />{' '}
        before choosing.
      </Text>
    </Dialog>
  );
}
