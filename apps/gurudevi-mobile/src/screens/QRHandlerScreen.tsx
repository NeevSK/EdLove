/**
 * QRHandlerScreen.tsx
 */
import { QRHandlerScreen as PackageQRHandler } from '@repo/scanner-kit';
import { ErrorBoundary } from '@repo/ui';

const QRHandlerWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="QR Scanner">
    <PackageQRHandler {...props} />
  </ErrorBoundary>
);

export default QRHandlerWrapper;
