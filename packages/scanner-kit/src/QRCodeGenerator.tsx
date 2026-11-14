/**
 * QRCodeGenerator forwarding shim — canonical component lives in @repo/ui
 *
 * Preserves backward compatibility for callers importing from @repo/scanner-kit/QRCodeGenerator.
 */
export {
  QRCodeGenerator as default,
  type QRCodeGeneratorProps,
} from '@repo/ui/qr';
