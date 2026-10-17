export { QRBuilder, resolveQR } from '@repo/core/logic';
export type { QRAction, QRPayload } from '@repo/core/types';
export type { IdentityData } from '@repo/ui/components/IdentityCard';
export { default as IdentityCard } from '@repo/ui/components/IdentityCard';
export type { QRCodeGeneratorProps } from '@repo/ui/components/QRCodeGenerator';
export { default as QRCodeGenerator } from '@repo/ui/components/QRCodeGenerator';
// UI & Hooks relocated to @repo/ui
export {
  dispatchQRDeepLink,
  redeemPendingQRAction,
  useQRDeepLink,
} from '@repo/scanner-kit/hooks/useQRDeepLink';
export { default as OCRScanner } from '@repo/scanner-kit/OCRScanner';
// OCR adapter pipeline  providers, parsers, pipeline
export * from '@repo/scanner-kit/ocr';
export * from '@repo/scanner-kit/adapters';
export { default as QRShareButton } from '@repo/scanner-kit/qr/QRShareButton';
export { default as ScannerModal } from '@repo/scanner-kit/ScannerModal';
export { default as QRHandlerScreen } from '@repo/scanner-kit/screens/QRHandlerScreen';
export type { ScannedStudent } from '@repo/scanner-kit/types';
export {
  parseInstitutionalQR,
  type ParsedInstitutionalQR,
} from './qr/institutionalQrParser';
