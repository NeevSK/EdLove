import { styled } from 'nativewind';
import React, { createContext, useContext, useMemo } from 'react';
import { View, type ViewProps } from 'react-native';

const StyledView = styled(View);

/**
 * Progress Component
 *
 * A high-impact, hardened feedback primitive.
 * Optimized for smooth visual progression and theme consistency.
 */

interface ProgressContextType {
  value: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a Progress component');
  return context;
}

export interface IProgressProps extends ViewProps {
  className?: string;
  value?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Progress = React.forwardRef<View, IProgressProps>(
  ({ className, value = 0, size = 'md', children, ...props }, ref) => {
    const heightMap = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5',
    };

    const contextValue = useMemo(() => ({ value }), [value]);

    return (
      <ProgressContext.Provider value={contextValue}>
        <StyledView
          {...props}
          ref={ref}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: value }}
          className={`bg-phase-interactive/10 rounded-full overflow-hidden w-full ${heightMap[size] || heightMap.md} ${className || ''}`}
        >
          {children}
        </StyledView>
      </ProgressContext.Provider>
    );
  },
);

export const ProgressFilledTrack = React.forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    const { value } = useProgress();

    return (
      <StyledView
        {...props}
        ref={ref}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        className={`h-full bg-phase-accent rounded-full transition-all duration-300 ${className || ''}`}
      />
    );
  },
);

Progress.displayName = 'Progress';
ProgressFilledTrack.displayName = 'ProgressFilledTrack';

export { Progress as default };
