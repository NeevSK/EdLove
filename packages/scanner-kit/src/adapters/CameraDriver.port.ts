import type { ComponentType, ReactNode } from 'react';

/**
 * Common camera driver capabilities
 */
export type CameraDriverType = 'expo' | 'vision-camera';

export interface CameraFrameData {
  width: number;
  height: number;
  /** Raw pixel data or native buffer handle when available */
  pixelFormat?: 'yuv' | 'rgb' | 'native';
  /** AR plane or bounding boxes detected in real-time */
  arTrackingData?: unknown;
}

export interface BarcodeResult {
  rawValue: string;
  format?: string;
  cornerPoints?: Array<{ x: number; y: number }>;
}

/**
 * Camera Viewport Props passed to the active camera driver adapter
 */
export interface CameraDriverProps {
  facing?: 'back' | 'front';
  isActive?: boolean;
  torch?: boolean;
  enableFrameProcessor?: boolean;
  onBarcodeScanned?: (barcode: BarcodeResult) => void;
  onFrame?: (frame: CameraFrameData) => void;
  children?: ReactNode;
  style?: unknown;
}

/**
 * Standard interface for camera adapters in @repo/scanner-kit
 */
export interface ICameraDriverAdapter {
  readonly id: CameraDriverType;
  readonly isAvailable: boolean;
  /** Camera View Component provided by this driver */
  CameraViewComponent: ComponentType<CameraDriverProps>;
  /** Check if high-speed AR frame processing is supported */
  supportsARFrameProcessing(): boolean;
}
