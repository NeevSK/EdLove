import { ExpoCameraAdapter } from './ExpoCamera.adapter';
import { VisionCameraAdapter } from './VisionCamera.adapter';
import type { CameraDriverType, ICameraDriverAdapter } from './CameraDriver.port';

export * from './CameraDriver.port';
export { ExpoCameraAdapter } from './ExpoCamera.adapter';
export { VisionCameraAdapter } from './VisionCamera.adapter';

/**
 * Camera Driver Registry & Factory
 * 
 * Automatically selects Nitro VisionCamera if available and requested (e.g. for AR),
 * falling back gracefully to the rock-solid ExpoCameraAdapter.
 */
export class CameraDriverRegistry {
  private static defaultDriver: CameraDriverType = 'expo';

  static setDefaultDriver(driver: CameraDriverType) {
    this.defaultDriver = driver;
  }

  static getAdapter(preferredDriver?: CameraDriverType): ICameraDriverAdapter {
    const target = preferredDriver || this.defaultDriver;

    if (target === 'vision-camera' && VisionCameraAdapter.isAvailable) {
      return VisionCameraAdapter;
    }

    return ExpoCameraAdapter;
  }
}
