import type React from 'react';
import { useMemo } from 'react';
import type { ViewProps } from 'react-native';
import { EaseView } from 'react-native-ease';
import { Box } from '../gluestack';

interface LivingGlowProps extends ViewProps {
  children?: React.ReactNode;
  active?: boolean;
  duration?: number;
  glowColor?: string;
  size?: number;
  className?: string;
}

export function LivingGlow({
  children,
  active = true,
  duration = 2000,
  glowColor,
  size,
  style,
  className,
  ...props
}: LivingGlowProps) {
  const animateProps = useMemo(
    () => ({
      shadowOpacity: active ? 0.8 : 0,
      elevation: active ? 5 : 0,
    }),
    [active],
  );

  const initialAnimateProps = useMemo(
    () => ({
      shadowOpacity: active ? 0.4 : 0,
      elevation: active ? 5 : 0,
    }),
    [active],
  );

  const transitionProps = useMemo(
    () =>
      active
        ? { type: 'timing' as const, duration, easing: 'easeInOut' as const, loop: 'reverse' as const }
        : { type: 'timing' as const, duration: 200 },
    [active, duration],
  );

  return (
    <EaseView
      key={active ? 'active' : 'inactive'}
      initialAnimate={initialAnimateProps}
      animate={animateProps}
      transition={transitionProps}
      style={[
        {
          shadowColor: glowColor || (active ? '#FFC107' : 'transparent'),
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: size ? size / 4 : 10,
          ...(size ? { width: size, height: size } : {}),
        },
        style,
      ]}
      className={className}
      {...props}
    >
      {children ||
        (size ? (
          <Box
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: glowColor || '#FFC107',
            }}
          />
        ) : null)}
    </EaseView>
  );
}
