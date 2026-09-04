import type { FC } from 'react';
import { CameraView } from 'expo-camera';
import type { CameraDriverProps, ICameraDriverAdapter } from './CameraDriver.port';

/**
 * Expo Camera Adapter
 * 
 * Rock-solid, default on-device camera driver supported natively across Expo SDK 57.
 */
const ExpoCameraDriverComponent: FC<CameraDriverProps> = ({
  facing = 'back',
  torch = false,
  onBarcodeScanned,
  children,
  style,
}) => {
  return (
    <CameraView
      facing={facing}
      enableTorch={torch}
      barcodeScannerSettings={{
        barcodeTypes: ['qr', 'code128', 'ean13', 'ean8', 'pdf417', 'aztec', 'datamatrix'],
      }}
      onBarcodeScanned={(scanningResult) => {
        if (onBarcodeScanned && scanningResult.data) {
          onBarcodeScanned({
            rawValue: scanningResult.data,
            cornerPoints: scanningResult.cornerPoints,
          });
        }
      }}
      style={style as any}
    >
      {children}
    </CameraView>
  );
};

export const ExpoCameraAdapter: ICameraDriverAdapter = {
  id: 'expo',
  isAvailable: true,
  CameraViewComponent: ExpoCameraDriverComponent,
  supportsARFrameProcessing() {
    return false;
  },
};
