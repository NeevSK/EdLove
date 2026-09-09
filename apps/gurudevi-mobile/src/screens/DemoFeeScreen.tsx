import { Button, ButtonText, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function DemoFeeScreen() {
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Initialize payment sheet with demo amount
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: 'pi_demo_secret_demo', // would come from backend
        merchantDisplayName: 'Gurudevi Demo',
        style: 'automatic',
      });
      if (error) throw error;

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw presentError;

      // Record in accounting
      // await recordFeeTransaction(userId, 1000);
      showToast({ message: 'Demo payment completed successfully.', type: 'success' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <VStack className="p-lg gap-lg items-center bg-phase-surface">
      <Heading size="lg" className="text-ink">
        {t('payments.demoTitle') || 'Demo Fee Flow'}
      </Heading>
      <Text className="text-mistGray text-center">
        {t('payments.demoDescription') || 'Test the Stripe integration with a demo fee'}
      </Text>
      <Button
        className="bg-sanctuarySaffron rounded-full px-xl h-[56px]"
        onPress={handlePay}
        isDisabled={loading}
      >
        <ButtonText className="text-white font-bold">
          {loading ? 'Processing...' : 'Pay $10.00 Demo'}
        </ButtonText>
      </Button>
      {error && <Text className="text-emberRed text-sm">{error}</Text>}
    </VStack>
  );
}

export default DemoFeeScreen;
