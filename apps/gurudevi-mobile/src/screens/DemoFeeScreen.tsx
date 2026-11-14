import { Button, Notice, Surface, Text } from '@repo/ui/components/native';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomPage } from '@/components/shell/RoomPage';

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
  }, [showToast]);

  return (
    <RoomPage
      title={t('payments.demoTitle') || 'Demo Fee Flow'}
      intro={t('payments.demoDescription') || 'Test the Stripe integration with a demo fee'}
      mark={{ label: 'Demo' }}
    >
      <Surface tone="raised" style={{ padding: 18, gap: 14 }}>
        <Text kind="value">$10.00</Text>
        <Button
          label={loading ? 'Processing...' : 'Pay $10.00 Demo'}
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
          onPress={handlePay}
        />
      </Surface>
      {error ? <Notice tone="danger" message={error} /> : null}
    </RoomPage>
  );
}

export default DemoFeeScreen;
