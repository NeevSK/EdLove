import * as React from 'react';

declare module 'react-native-gesture-handler' {
  export const Gesture: any;
  export const GestureDetector: any;
  export const GestureHandlerRootView: any;
  export const PanGestureHandler: any;
  export const PinchGestureHandler: any;
  export const State: any;
  
  export interface GestureDetectorProps {
    gesture?: any;
    children?: React.ReactNode;
  }
  
  export const GestureDetector: React.ComponentType<GestureDetectorProps>;
}
