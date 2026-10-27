/**
 * QRCodeGenerator forwarding shim — canonical component lives in @repo/ui
 *
 * Preserves backward compatibility for callers importing from @repo/scanner-kit/QRCodeGenerator.
 */
export {
  default,
  type QRCodeGeneratorProps,
} from '@repo/ui/components/QRCodeGenerator';
