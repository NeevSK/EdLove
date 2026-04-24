export { default as OCRScanner } from './OCRScanner';
export { default as ScannerModal } from './ScannerModal';
export { QRCodeGenerator } from '@repo/ui';
export { QRBuilder, resolveQR } from '@repo/core';
export type { ScannedStudent } from './types';
export type { QRCodeGeneratorProps } from '@repo/ui';

// QR type system  canonical payloads, builder, resolver
export type { QRPayload, QRAction } from '@repo/core';

// OCR adapter pipeline  providers, parsers, pipeline
export * from './ocr';

// UI & Hooks relocated to @repo/ui
export { IdentityCard, QRShareButton } from '@repo/ui';
export type { IdentityData } from '@repo/ui';
export { useQRDeepLink, redeemPendingQRAction } from './hooks/useQRDeepLink';
export { default as QRHandlerScreen } from './screens/QRHandlerScreen';
