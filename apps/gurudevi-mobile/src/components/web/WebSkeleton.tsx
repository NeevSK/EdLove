import React from 'react';

interface WebSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'rect' | 'circle' | 'text';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * WebSkeleton - A high-performance, web-native skeleton component.
 * Uses vanilla CSS animations for maximum smoothness and low-overhead.
 */
export const WebSkeleton: React.FC<WebSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '12px',
  variant = 'rect',
  className = '',
  style
}) => {
  const isCircle = variant === 'circle';
  
  const baseStyle: React.CSSProperties = {
    width,
    height: isCircle ? width : height,
    borderRadius: isCircle ? '50%' : borderRadius,
    ...style
  };

  return (
    <>
      <style>
        {`
          @keyframes sanctuary-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .sanctuary-skeleton {
            display: inline-block;
            background: linear-gradient(
              90deg,
              rgba(232, 226, 207, 0.4) 25%,
              rgba(250, 247, 237, 0.8) 37%,
              rgba(232, 226, 207, 0.4) 63%
            );
            background-size: 200% 100%;
            animation: sanctuary-shimmer 2.5s infinite linear;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          /* Dark mode adaptation - Bioluminescence */
          [data-theme='dark'] .sanctuary-skeleton {
            background: linear-gradient(
              90deg,
              rgba(42, 35, 24, 0.4) 25%,
              rgba(61, 53, 40, 0.8) 37%,
              rgba(42, 35, 24, 0.4) 63%
            );
            border: 1px solid rgba(252, 249, 242, 0.05);
          }
        `}
      </style>
      <div 
        className={`sanctuary-skeleton ${className}`} 
        style={baseStyle}
        aria-hidden="true"
      />
    </>
  );
};

export default WebSkeleton;
