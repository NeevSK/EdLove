/**
 * Web shim for @react-native-ml-kit/barcode-scanning.
 *
 * Same issue as text-recognition: native JSI module whose compiled output
 * uses a getter-only `exports.default`, crashing Metro's web factory wrapper.
 *
 * ScannerModal.web.tsx already provides a web-safe fallback UI, so barcode
 * scanning is never invoked in a browser context.
 */

const BarcodeScanning = {
    scan: async () => [],
};

module.exports = BarcodeScanning;
module.exports.default = BarcodeScanning;
