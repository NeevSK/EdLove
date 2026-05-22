import type React from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: any;
  /** Optional: Show a subtle blooming flower icon in the center */
  withFlower?: boolean;
}

/**
 * SkeletonLoader (Web Implementation)
 *
 * A high-fidelity, sanctuary-themed loading state for the May 2026 platform.
 * Features:
 * - Organic, directional shimmer using phase-aware accent colors.
 * - Subtle "Vellum" grain texture for tactile depth.
 * - "Breathing" animation for a living, sanctuary feel.
 * - Optional "Blooming Flower" micro-interaction.
 */
const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  className = '',
  style,
  withFlower = false,
}) => {
  // Inject the sanctuary shimmer CSS if not already present
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let el = document.getElementById('sanctuary-shimmer-styles');
    if (!el) {
      el = document.createElement('style');
      el.id = 'sanctuary-shimmer-styles';
      el.textContent = `
        @keyframes sanctuary-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes sanctuary-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.005); }
        }
        
        @keyframes sanctuary-bloom {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          50% { opacity: 0.15; transform: scale(1.1) rotate(5deg); }
          100% { opacity: 0.08; transform: scale(1) rotate(0deg); }
        }

        .sanctuary-skeleton {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--scene-surface) 0%, var(--scene-interactive) 100%);
          border: 1px solid var(--scene-surface-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: inset 0 0 30px rgba(var(--surface-rgb), 0.3), 0 4px 12px rgba(0,0,0,0.03);
          animation: sanctuary-breathe 4s ease-in-out infinite;
        }

        .sanctuary-skeleton::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--action-soft) 40%,
            var(--action-medium) 50%,
            var(--action-soft) 60%,
            transparent 100%
          );
          filter: blur(4px);
          animation: sanctuary-shimmer 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .skeleton-flower {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5em;
          pointer-events: none;
          opacity: 0.12;
          filter: drop-shadow(0 0 8px var(--action-glow));
          animation: sanctuary-bloom 5s ease-in-out infinite;
        }
      `;
      document.head.appendChild(el);
    }
  }, []);

  const skeletonStyle = {
    width,
    height,
    borderRadius,
    ...style,
  };

  return (
    <div className={`sanctuary-skeleton ${className}`} style={skeletonStyle}>
      {withFlower && <span className="skeleton-flower">🌸</span>}
    </div>
  );
};

export const SkeletonCard = ({
  height = 150,
  width = '100%',
  className = '',
  style,
}: {
  height?: number;
  width?: number | string;
  className?: string;
  style?: any;
}) => (
  <SkeletonLoader
    width={width}
    height={height}
    borderRadius={24}
    className={`mb-4 ${className}`}
    style={style}
    withFlower
  />
);

export const SkeletonAvatar = ({
  size = 50,
  className = '',
}: {
  size?: number;
  className?: string;
}) => (
  <SkeletonLoader
    width={size}
    height={size}
    borderRadius={size / 2}
    className={className}
    withFlower
  />
);

export const SkeletonTextLine = ({
  width = '100%',
  mb = 8,
  className = '',
}: {
  width?: string | number;
  mb?: number;
  className?: string;
}) => (
  <SkeletonLoader
    width={width}
    height={16}
    borderRadius={6}
    className={className}
    style={{ marginBottom: mb }}
  />
);

export { SkeletonLoader };
export default SkeletonLoader;
