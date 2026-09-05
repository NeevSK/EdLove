import { GatewayFooter } from '@repo/ui/components/GatewayFooter.web';
import { GatewayHeader } from '@repo/ui/components/GatewayHeader.web';
import { useTheme } from '@repo/ui/hooks/useTheme';
import type React from 'react';
import { memo } from 'react';

export interface GatewayScreenShellProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  backgroundColor?: string;
  backgroundElements?: React.ReactNode;
  contentContainerStyle?: React.CSSProperties;
}

/**
 * GatewayScreenShell.web.tsx — Zero-CLS, CSS-first container-query layout shell.
 *
 * Implements a self-collapsing flex track that automatically switches between
 * two-column and single-column modes via browser layout algorithms, completely
 * eliminating JavaScript re-renders on window resize and initial load flash.
 *
 * NOTE: We intentionally use plain <div> elements here, NOT React Native's
 * ScrollView. The outer .gateway-viewport div already handles scrolling via
 * CSS (overflow-y: auto). Using RN's ScrollView created a nested scroll
 * container (overflow: scroll div-inside-div) that intercepted all pointer
 * events, making buttons and inputs unclickable on web.
 */
export const GatewayScreenShell = memo(
  ({
    left,
    right,
    children,
    showHeader = true,
    showFooter = true,
    backgroundColor,
    backgroundElements,
    contentContainerStyle,
  }: GatewayScreenShellProps) => {
    const { gradientNodes } = useTheme();
    const bgFrom = backgroundColor || gradientNodes[0];

    const hasSplitContent = Boolean(left && right);

    return (
      <div className="gateway-viewport" style={{ backgroundColor: bgFrom }}>
        {backgroundElements}
        {showHeader && <GatewayHeader />}

        {/* Plain div — NOT RN ScrollView. gateway-viewport already scrolls via CSS. */}
        <div className="gateway-scroll-body" style={contentContainerStyle}>
          {hasSplitContent ? (
            <div className="gateway-track">
              <div className="gateway-panel-left">{left}</div>
              <div className="gateway-panel-right">{right}</div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: 24 }}>
              {children ?? right ?? left}
            </div>
          )}
        </div>

        {showFooter && <GatewayFooter />}
      </div>
    );
  },
);

GatewayScreenShell.displayName = 'GatewayScreenShell';
