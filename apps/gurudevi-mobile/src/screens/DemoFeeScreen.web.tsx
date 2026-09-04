import { Button, ButtonText, Heading, Text, VStack } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';
import { getGatewayWebCapability } from '@/lib/capabilities/webCapabilityRegistry';

const browserPaymentCapability = getGatewayWebCapability('native-payment-sheet');

/**
 * The native payment sheet has no web implementation. Rendering a truthful
 * unavailable state prevents the Metro compatibility shim from reporting a
 * successful payment that did not happen.
 */
export function DemoFeeScreen() {
  const { t } = useTranslation();

  return (
    <VStack className="p-lg gap-lg items-center bg-phase-surface">
      <Heading size="lg" className="text-ink">
        {t('payments.demoTitle') || 'Demo Fee Flow'}
      </Heading>
      <Text className="text-mistGray text-center">
        {t('payments.demoDescription') || 'Test the Stripe integration with a demo fee'}
      </Text>
      <Text accessibilityRole="alert" className="text-emberRed text-center text-sm">
        {browserPaymentCapability.failureMessage}
      </Text>
      <Button
        accessibilityHint={browserPaymentCapability.action}
        className="bg-sanctuarySaffron rounded-full px-xl h-[56px]"
        isDisabled
      >
        <ButtonText className="text-white font-bold">Pay $10.00 Demo</ButtonText>
      </Button>
    </VStack>
  );
}

export default DemoFeeScreen;
