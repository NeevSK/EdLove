export { QRBuilder, resolveQR } from '@repo/core/logic';
export type { QRAction, QRPayload } from '@repo/core/types';
export type { IdentityData } from '@repo/ui/components/IdentityCard';
export { default as IdentityCard } from '@repo/ui/components/IdentityCard';
export type { QRCodeGeneratorProps } from '@repo/ui/qr';
export { QRCodeGenerator } from '@repo/ui/qr';
// QR link ingestion was retired with its routes; scanner and OCR remain local capabilities.
export { default as OCRScanner } from './OCRScanner';
// OCR adapter pipeline  providers, parsers, pipeline
export * from './ocr';
export * from './adapters';
export { default as QRShareButton } from './qr/QRShareButton';
export { default as ScannerModal } from './ScannerModal';
export type { ScannedStudent } from './types';
export {
  parseInstitutionalQR,
  type ParsedInstitutionalQR,
} from './qr/institutionalQrParser';
export * from './machines/ocrScannerMachine';
export * from './machines/documentVisionMachine';
export * from './utils/imagePreFlight';
