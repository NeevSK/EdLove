import { useConsentStore } from '@repo/core/logic';
import { Button, Dialog, Text } from '@repo/ui/components/native';
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
        <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="secondary" size="sm" label="Decline" onPress={handleDecline} />
          <Button variant="primary" size="sm" label="Accept" onPress={handleAccept} />
        </View>
      }
    >
      <View style={{ gap: 12, marginVertical: 8 }}>
        <Text kind="caption" tone="soft" style={{ fontSize: 13, lineHeight: 18 }}>
          Allowing analytics helps us monitor app performance and improve the experience. We do not
          sell personal information. You can decline, and you can read the{' '}
          <Text
            kind="caption"
            tone="lamp"
            style={{ fontSize: 13, textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(EXTERNAL_URLS.privacy)}
          >
            Privacy Policy
          </Text>{' '}
          and{' '}
          <Text
            kind="caption"
            tone="lamp"
            style={{ fontSize: 13, textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(EXTERNAL_URLS.terms)}
          >
            Terms of Use
          </Text>{' '}
          before choosing.
        </Text>
      </View>
    </Dialog>
  );
}
