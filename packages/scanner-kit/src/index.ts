export { default as OCRScanner } from './OCRScanner';
export { default as ScannerModal } from './ScannerModal';
export { default as QRCodeGenerator } from './QRCodeGenerator';
export type { ScannedStudent } from './OCRScanner';
export type { QRCodeGeneratorProps } from './QRCodeGenerator';

// QR type system — canonical payloads, builder, resolver
export * from './qr';

// OCR adapter pipeline — providers, parsers, pipeline
export * from './ocr';
