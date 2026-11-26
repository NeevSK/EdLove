import React, { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { MoreHorizontal, Check, ArrowUpDown, Image, PanelsTopLeft, SlidersHorizontal } from 'lucide-react';
import styles from './floor-reception.module.css';

export interface FloorReceptionProps {
  /** Primary greeting node or string (e.g., "Good afternoon, Guest Explorer") */
  greeting?: ReactNode;
  /** Active sanctuary domain (e.g. 'self', 'workspace', 'community', 'library') */
  domain?: string;
  /** Breadcrumb node or title string (e.g., "Self · Overview") */
  breadcrumb?: ReactNode;
  /** Optional HTML id for the breadcrumb or greeting heading (for aria-labelledby) */
  titleId?: string;
  /** Temporal instrument or clock node (e.g. DateTimeCombo or compact Time) */
  timeControl?: ReactNode;
  /** Modular extra actions slot for domain-specific tools (e.g., Center Now button, audio toggle) */
  renderExtra?: () => ReactNode;
  /** Whether canvas section arranging mode is currently active */
  isArrangeMode?: boolean;
  /** Callback when toggling arrange mode */
  onToggleArrange?: () => void;
  /** Whether Floor Studio drawer is currently open */
  isStudioOpen?: boolean;
  /** Callback to open Floor Studio (atmosphere or furniture tab) */
  onOpenStudio?: (tab?: 'atmosphere' | 'furniture') => void;
  /** Optional custom CSS class */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
  /** Optional children for deep layout extensions */
  children?: ReactNode;
}

/**
 * FloorReception
 *
 * Implements the Idea 2 Dual-Anchor Horizon Split:
 * - Left Anchor: Identity & Sense of Place (Greeting + Breadcrumb)
 * - Center: 100% Unobstructed Scenic Wallpaper Horizon
 * - Right Anchor: Modular Utility Island (Time + Extra Tools + Studio Three-Dots Menu)
 *
 * Fully adheres to UI Kit Rule 6 (4 Discrete Degradation Gears via CSS Container Queries).
 */
export function FloorReception({
  greeting,
  domain = 'self',
  breadcrumb,
  titleId,
  timeControl,
  renderExtra,
  isArrangeMode = false,
  onToggleArrange,
  isStudioOpen = false,
  onOpenStudio,
  className,
  style,
  children,
}: FloorReceptionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1);
  const activeBreadcrumb = breadcrumb ?? (!greeting && !children ? domainLabel : undefined);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isMenuOpen]);

  return (
    <div className={`${styles.receptionWrapper} ${className ?? ''}`} style={style}>
      <header className={styles.receptionHorizon} aria-label={`${domainLabel} Floor Reception`}>
        {/* LEFT ANCHOR: GREETING & BREADCRUMB */}
        <div className={styles.leftAnchor}>
          {greeting ? (
            typeof greeting === 'string' ? (
              <h2 id={!activeBreadcrumb ? titleId : undefined} className={styles.greetingText}>{greeting}</h2>
            ) : (
              greeting
            )
          ) : null}

          {greeting && activeBreadcrumb ? (
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              ·
            </span>
          ) : null}

          {activeBreadcrumb ? (
            typeof activeBreadcrumb === 'string' ? (
              <span id={titleId} className={styles.breadcrumbBadge}>{activeBreadcrumb}</span>
            ) : (
              activeBreadcrumb
            )
          ) : null}

          {!greeting && !activeBreadcrumb ? children : null}
        </div>

        {/* RIGHT ANCHOR: MODULAR UTILITY ISLAND */}
        <div className={styles.rightAnchor}>
          {greeting || activeBreadcrumb ? children : null}

          {timeControl ? (
            <>
              <div className={styles.timeSlot}>{timeControl}</div>
              <div className={styles.islandDivider} aria-hidden="true" />
            </>
          ) : null}

          {renderExtra ? <div className={styles.extraActionsSlot}>{renderExtra()}</div> : null}

          {/* ACTIVE ARRANGE MODE PROMINENT EXIT PILL - ONLY SHOWN WHEN IN ARRANGE MODE */}
          {isArrangeMode && onToggleArrange ? (
            <button
              type="button"
              className={styles.arrangeDoneBtn}
              onClick={onToggleArrange}
              aria-label="Exit floor arranging mode"
              title="Exit floor arranging mode"
            >
              <Check size={14} aria-hidden="true" />
              <span>Done Arranging</span>
            </button>
          ) : null}

          {/* SINGLE SUBTLE CUSTOMIZE TRIGGER */}
          {onOpenStudio ? (
            <button
              type="button"
              className={styles.studioTriggerBtn}
              aria-expanded={isStudioOpen}
              aria-haspopup="dialog"
              aria-label={`Open ${domain} Floor Studio — customize this ${domain} floor`}
              title={`Customize ${domain} floor`}
              onClick={() => onOpenStudio('atmosphere')}
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span className={styles.srOnly}>Floor Studio</span>
            </button>
          ) : null}
        </div>
      </header>
    </div>
  );
}
