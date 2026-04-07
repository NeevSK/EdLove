/**
 * QRHandlerScreen.tsx
 */
import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { QRHandlerScreen as PackageQRHandler } from '@repo/scanner-kit';

const QRHandlerWrapper = (props: any) => (
  <ErrorBoundary name="QR Scanner">
    <PackageQRHandler {...props} />
  </ErrorBoundary>
);

export default QRHandlerWrapper;
