export { QRBuilder, resolveQR } from '@repo/core/logic';
export type { QRAction, QRPayload } from '@repo/core/types';
export type { IdentityData } from '@repo/ui/components/IdentityCard';
export { default as IdentityCard } from '@repo/ui/components/IdentityCard';
export type { QRCodeGeneratorProps } from '@repo/ui/components/QRCodeGenerator';
export { default as QRCodeGenerator } from '@repo/ui/components/QRCodeGenerator';
// UI & Hooks relocated to @repo/ui
export { redeemPendingQRAction, useQRDeepLink } from '@scanner-kit/hooks/useQRDeepLink';
export { default as OCRScanner } from '@scanner-kit/OCRScanner';
// OCR adapter pipeline  providers, parsers, pipeline
export * from '@scanner-kit/ocr';
export { default as QRShareButton } from '@scanner-kit/qr/QRShareButton';
export { default as ScannerModal } from '@scanner-kit/ScannerModal';
export { default as QRHandlerScreen } from '@scanner-kit/screens/QRHandlerScreen';
export type { ScannedStudent } from '@scanner-kit/types';
