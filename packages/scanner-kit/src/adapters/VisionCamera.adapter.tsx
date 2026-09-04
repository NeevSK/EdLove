import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CameraDriverProps, ICameraDriverAdapter } from './CameraDriver.port';

let VisionCameraModule: any = null;
let useCameraDeviceHook: any = null;

try {
  // Dynamically load react-native-vision-camera if installed in host app
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vc = require('react-native-vision-camera');
  VisionCameraModule = vc.Camera;
  useCameraDeviceHook = vc.useCameraDevice;
} catch {
  VisionCameraModule = null;
  useCameraDeviceHook = null;
}

/**
 * Nitro VisionCamera Driver Component
 * 
 * Provides high-speed 60-120fps direct C++ / Nitro frame processing,
 * continuous real-time bounding box tracking, and AR overlays.
 */
const VisionCameraDriverComponent: FC<CameraDriverProps> = ({
  facing = 'back',
  isActive = true,
  torch = false,
  onBarcodeScanned,
  onFrame,
  children,
  style,
}) => {
  if (!VisionCameraModule || !useCameraDeviceHook) {
    return (
      <View style={[styles.fallbackContainer, style as any]}>
        <Text style={styles.fallbackText}>
          VisionCamera (Nitro) is not linked in this build. Please fall back to the Expo Camera adapter.
        </Text>
        {children}
      </View>
    );
  }

  const device = useCameraDeviceHook(facing);

  if (!device) {
    return (
      <View style={[styles.fallbackContainer, style as any]}>
        <Text style={styles.fallbackText}>No camera device found for {facing}.</Text>
      </View>
    );
  }

  const Camera = VisionCameraModule;

  return (
    <Camera
      device={device}
      isActive={isActive}
      torch={torch ? 'on' : 'off'}
      style={StyleSheet.absoluteFill}
    >
      {children}
    </Camera>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
  },
});

export const VisionCameraAdapter: ICameraDriverAdapter = {
  id: 'vision-camera',
  isAvailable: Boolean(VisionCameraModule),
  CameraViewComponent: VisionCameraDriverComponent,
  supportsARFrameProcessing() {
    return true;
  },
};
