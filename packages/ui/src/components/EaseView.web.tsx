import { View, type ViewProps } from 'react-native';

type AnimateProps = {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  elevation?: number;
};

interface EaseViewProps extends Omit<ViewProps, 'style'> {
  initialAnimate?: AnimateProps;
  animate?: AnimateProps;
  transition?: unknown;
  transformOrigin?: { x?: number; y?: number };
  style?: ViewProps['style'];
}

// The native adapter dynamically creates shared values from object keys, which
// violates React's hook rules on web. Web motion is supplied by CSS on the
// gateway routes, so retain the layout contract without mounting Reanimated.
export function EaseView({ style, children, ...rest }: EaseViewProps) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}
