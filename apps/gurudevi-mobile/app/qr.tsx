import { resolveQR } from '@repo/core/logic/utils/QRResolver';
import { QRHandlerScreen, ScannerModal } from '@repo/scanner-kit';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useCallback, useState } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading QR scanner" />
    </Center>
  );
}

export default function QRRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const { showToast } = useSanctuaryToast();
  const [isScannerOpen, setIsScannerOpen] = useState(!params.payload);

  const handleScan = useCallback(
    (scannedData: string) => {
      setIsScannerOpen(false);
      const result = resolveQR(scannedData);
      if (result.ok) {
        router.setParams({ payload: JSON.stringify(result.payload) });
      } else {
        showToast({
          message: 'This QR code is not recognized by Gurudevi.',
          type: 'error',
        });
        setTimeout(() => safeBack('/workspace'), 1500);
      }
    },
    [router, showToast],
  );

  const handleCloseScanner = useCallback(() => {
    setIsScannerOpen(false);
    safeBack('/workspace');
  }, []);

  return (
    <ErrorBoundary name="QRRoute">
      <Suspense fallback={<Fallback />}>
        {params.payload ? (
          <QRHandlerScreen />
        ) : (
          <ScannerModal
            visible={isScannerOpen}
            onClose={handleCloseScanner}
            onScan={handleScan}
            title="Scan Sanctuary QR"
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

