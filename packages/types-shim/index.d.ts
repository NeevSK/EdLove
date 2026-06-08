// This is an empty type definition file to satisfy legacy peer dependencies.
// React Native 0.83+ provides its own types.
//
// Monorepo convention:
// We allow `className` on core React Native primitives to support web + tailwind-style
// styling (e.g. via `react-native-web`, `react-native-css-interop`, etc.). The runtime
// integration varies by app, but the prop is intentionally tolerated at the type level.

declare module 'react-native' {
  interface ViewProps {
    className?: string | undefined;
  }

  interface TextProps {
    className?: string | undefined;
  }

  interface TextInputProps {
    className?: string | undefined;
    accessibilityDescribedBy?: string | undefined;
  }

  interface PressableProps {
    className?: string | undefined;
  }

  interface ImageProps {
    className?: string | undefined;
  }

  interface ImageBackgroundProps {
    className?: string | undefined;
  }

  interface ScrollViewProps {
    className?: string | undefined;
    contentContainerClassName?: string | undefined;
  }

  interface FlatListProps<ItemT> {
    className?: string | undefined;
    contentContainerClassName?: string | undefined;
  }
}

declare module 'react-native-gifted-charts' {
  import * as React from 'react';

  export const BarChart: React.ComponentType<any>;
  export const PieChart: React.ComponentType<any>;
}

declare module 'react-native-gesture-handler' {
  export const Gesture: any;
  export const GestureDetector: any;
  export const GestureHandlerRootView: any;
  export const PanGestureHandler: any;
  export const PinchGestureHandler: any;
  export const State: any;
}

declare module 'expo-task-manager' {
  export function defineTask(taskName: string, task: (...args: any[]) => any): void;
  export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;
}

declare module 'expo-background-task' {
  export const BackgroundTaskResult: {
    NewData: number;
    NoData: number;
    Failed: number;
  };
  export const BackgroundTaskStatus: {
    Available: number;
    Denied: number;
    Restricted: number;
  };
  export type BackgroundTaskOptions = {
    minimumInterval?: number;
    stopOnTerminate?: boolean;
    startOnBoot?: boolean;
  };

  export function getStatusAsync(): Promise<number>;
  export function registerTaskAsync(
    taskName: string,
    options?: BackgroundTaskOptions,
  ): Promise<void>;
  export function unregisterTaskAsync(taskName: string): Promise<void>;
  export function triggerTaskWorkerForTestingAsync(taskName: string): Promise<void>;
}

export {};
