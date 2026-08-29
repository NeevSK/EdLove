import React from 'react';
import { EaseView } from '@repo/ui/components/EaseView';
import { View } from '@repo/ui/primitives';

interface BreathAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'none';
}

const Y_OFFSET = 20;

export const BreathAnimation = ({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
}: BreathAnimationProps) => {
  const translateY = direction === 'up' ? Y_OFFSET : direction === 'down' ? -Y_OFFSET : 0;

  return (
    <EaseView
      initialAnimate={{ opacity: 0, translateY }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration, easing: [0, 0, 0.58, 1], delay }}
    >
      {children}
    </EaseView>
  );
};
