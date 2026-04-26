// QR type system  canonical payloads, builder, resolver
export type { QRAction, QRPayload } from '@repo/core';
export { QRBuilder, resolveQR } from '@repo/core';
export type { IdentityData, QRCodeGeneratorProps } from '@repo/ui';
// UI & Hooks relocated to @repo/ui
export { IdentityCard, QRCodeGenerator, QRShareButton } from '@repo/ui';
export { redeemPendingQRAction, useQRDeepLink } from './hooks/useQRDeepLink';
export { default as OCRScanner } from './OCRScanner';
// OCR adapter pipeline  providers, parsers, pipeline
export * from './ocr';
export { default as ScannerModal } from './ScannerModal';
export { default as QRHandlerScreen } from './screens/QRHandlerScreen';
export type { ScannedStudent } from './types';
