// QR type system  canonical payloads, builder, resolver
export type { QRAction, QRPayload } from '@repo/core';
export { QRBuilder, resolveQR } from '@repo/core';
export { default as QRShareButton } from './qr/QRShareButton';
export { default as IdentityCard } from '@repo/ui/components/IdentityCard';
export type { IdentityData } from '@repo/ui/components/IdentityCard';
export { default as QRCodeGenerator } from '@repo/ui/components/QRCodeGenerator';
export type { QRCodeGeneratorProps } from '@repo/ui/components/QRCodeGenerator';
// UI & Hooks relocated to @repo/ui

export { redeemPendingQRAction, useQRDeepLink } from './hooks/useQRDeepLink';
export { default as OCRScanner } from './OCRScanner';
// OCR adapter pipeline  providers, parsers, pipeline
export * from './ocr';
export { default as ScannerModal } from './ScannerModal';
export { default as QRHandlerScreen } from './screens/QRHandlerScreen';
export type { ScannedStudent } from './types';
