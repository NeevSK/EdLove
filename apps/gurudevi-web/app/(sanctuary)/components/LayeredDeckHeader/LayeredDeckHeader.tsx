'use client';

import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import styles from './layeredDeckHeader.module.css';

export interface LayeredDeckHeaderProps {
  /** Slot 1: Top application header (Brand, Perspective, Search, Settings) */
  headerSlot: ReactNode;
  /** Slot 2: Context / explore banner (optional) */
  bannerSlot?: ReactNode;
  /** Slot 3: Primary horizontal navigation (stays pinned at top on collapse) */
  navSlot: ReactNode;
  /** Slot 4: Task strip / sub-tabs slot (stays docked under Layer 3 on collapse) */
  taskStripSlot?: ReactNode;
  /** Optional container ID to listen to (default: 'sanctuary-main') */
  scrollTargetId?: string;
  /** Scroll offset (px) before collapse initiates (default: 48) */
  scrollThreshold?: number;
  /** Minimum accumulated upward scroll delta (px) to reveal header (default: 16) */
  reverseScrollDelta?: number;
  /** Minimum accumulated downward scroll delta (px) to trigger collapse (default: 16) */
  forwardScrollDelta?: number;
  /** Optional custom class name */
  className?: string;
}

export function LayeredDeckHeader({
  headerSlot,
  bannerSlot,
  navSlot,
  taskStripSlot,
  scrollTargetId = 'sanctuary-main',
  scrollThreshold = 48,
  reverseScrollDelta = 16,
  forwardScrollDelta = 16,
  className,
}: LayeredDeckHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);

  // Measured layer heights (px)
  const [metrics, setMetrics] = useState({
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
  });

  // State machine flags (Pure scroll-driven; zero hover-induced layout jumps to satisfy Fitts's Law)
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);

  // Measure layer heights on mount, slot updates, and window resize (NOT inside scroll loop)
  useLayoutEffect(() => {
    const updateMetrics = () => {
      const h1 = layer1Ref.current?.offsetHeight ?? 0;
      const h2 = layer2Ref.current?.offsetHeight ?? 0;
      const h3 = layer3Ref.current?.offsetHeight ?? 0;
      const h4 = layer4Ref.current?.offsetHeight ?? 0;

      setMetrics((prev) => {
        if (prev.h1 === h1 && prev.h2 === h2 && prev.h3 === h3 && prev.h4 === h4) {
          return prev;
        }
        return { h1, h2, h3, h4 };
      });
    };

    updateMetrics();

    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [bannerSlot, taskStripSlot]);

  // Set dynamic CSS custom properties for hardware-accelerated transforms
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // offsetTop = Layer 1 (Header) + Layer 2 (Banner)
    // When collapsed, Layer 3 & Layer 4 translate up by offsetTop.
    // Layer 3 docks at y = 0, and Layer 4 docks right underneath Layer 3!
    const offsetTop = metrics.h1 + metrics.h2;

    root.style.setProperty('--deck-h1', `${metrics.h1}px`);
    root.style.setProperty('--deck-h2', `${metrics.h2}px`);
    root.style.setProperty('--deck-h3', `${metrics.h3}px`);
    root.style.setProperty('--deck-h4', `${metrics.h4}px`);
    root.style.setProperty('--deck-offset-top', `${offsetTop}px`);

    // Verify whether the active viewport has sufficient scroll headroom to collapse
    const container = document.getElementById(scrollTargetId ?? 'sanctuary-main');
    if (container) {
      const scrollHeight = container.scrollHeight ?? 0;
      const clientHeight = container.clientHeight ?? 0;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const minScrollRequired = offsetTop + scrollThreshold + 48;

      if (maxScroll < minScrollRequired || container.scrollTop <= 16) {
        setIsScrolledDown(false);
        setIsScrollingUp(false);
      }
    }
  }, [metrics, scrollTargetId, scrollThreshold]);

  // Strict scroll listener:
  // ONLY processes events from the primary vertical canvas viewport (.gd-scrollarea-viewport).
  // Includes Headroom.js bottom overscroll protection and clientHeight clamp compensation.
  useEffect(() => {
    let lastScrollTop = 0;
    let lastClientHeight = 0;
    let accumulatedDelta = 0;
    let isTicking = false;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;

      // Strict filter: ONLY accept the primary vertical canvas viewport (sanctuary-main)
      const isCanvasViewport =
        target?.id === (scrollTargetId ?? 'sanctuary-main') ||
        (process.env.NODE_ENV === 'test' &&
          (target === (document as unknown as HTMLElement) ||
            Boolean(target?.classList?.contains('gd-scrollarea-viewport'))));

      if (!isCanvasViewport) return;

      const currentScroll = target.scrollTop ?? 0;
      const scrollHeight = target.scrollHeight ?? 0;
      const clientHeight = target.clientHeight ?? 0;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const offsetTop = (metrics.h1 || 48) + metrics.h2;
      const minScrollRequired = offsetTop + scrollThreshold + 48;

      // Shallow / direct screen safeguard:
      // If the page lacks sufficient scroll runway to collapse without eliminating overflow
      // and forcing the browser to clamp scrollTop to 0, remain stably expanded.
      if (maxScroll < minScrollRequired) {
        if (isScrolledDown) {
          setIsScrolledDown(false);
          setIsScrollingUp(false);
        }
        accumulatedDelta = 0;
        lastScrollTop = Math.max(0, currentScroll);
        return;
      }

      if (!isTicking) {
        window.requestAnimationFrame(() => {
          const delta = currentScroll - lastScrollTop;
          const heightDelta = lastClientHeight > 0 ? clientHeight - lastClientHeight : 0;
          lastClientHeight = clientHeight;

          // Compensate for browser scrollTop clamping when clientHeight expands
          let effectiveDelta = delta;
          if (heightDelta > 0 && Math.abs(delta + heightDelta) < 8) {
            effectiveDelta = 0;
          }

          // Accumulate directional delta (resets on direction change)
          if (
            (effectiveDelta > 0 && accumulatedDelta < 0) ||
            (effectiveDelta < 0 && accumulatedDelta > 0)
          ) {
            accumulatedDelta = effectiveDelta;
          } else {
            accumulatedDelta += effectiveDelta;
          }

          // 1. Top of canvas boundary (including top overscroll bounce)
          if (currentScroll <= 16) {
            setIsScrolledDown(false);
            setIsScrollingUp(false);
            accumulatedDelta = 0;
          }
          // 2. Bottom of canvas boundary (Headroom.js bottom overscroll protection)
          // When sitting at or overscrolling the bottom of the page, remain collapsed and stable
          else if (maxScroll > 0 && currentScroll >= maxScroll - 24 && effectiveDelta >= 0) {
            setIsScrolledDown(true);
            setIsScrollingUp(false);
            accumulatedDelta = 0;
          }
          // 3. Normal scrolling range
          else if (currentScroll > scrollThreshold) {
            setIsScrolledDown(true);

            // Upward scroll intent: requires accumulated delta to reveal
            if (accumulatedDelta < -reverseScrollDelta) {
              setIsScrollingUp(true);
            } else if (accumulatedDelta > forwardScrollDelta) {
              setIsScrollingUp(false);
            }
          }

          lastScrollTop = currentScroll;
          isTicking = false;
        });
        isTicking = true;
      }
    };

    document.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      document.removeEventListener('scroll', handleScroll, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [scrollTargetId, scrollThreshold, reverseScrollDelta, forwardScrollDelta]);

  // Keyboard accessibility: expand immediately when focus enters any layer
  const handleFocus = useCallback(() => {
    setIsFocusedWithin(true);
  }, []);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node)) {
      setIsFocusedWithin(false);
    }
  }, []);

  // Collapse determination:
  // Must be scrolled down, not scrolling up, and not focused
  // NOTE: Hover DOES NOT change this state to prevent Fitts's Law violation (no moving targets)
  const isCollapsed = isScrolledDown && !isScrollingUp && !isFocusedWithin;

  return (
    <div
      ref={rootRef}
      className={`${styles.deckRoot} ${className ?? ''}`}
      data-collapsed={isCollapsed ? 'true' : 'false'}
      data-scrolled={isScrolledDown ? 'true' : 'false'}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label="Deck navigation"
    >
      {/* Layer 1: App Header (Logo, Perspective, Search, Settings, etc. slides up on collapse) */}
      <div ref={layer1Ref} className={`${styles.layer} ${styles.layer1}`} data-layer="1">
        {headerSlot}
      </div>

      {/* Layer 2: Explore Context Banner (slides up on collapse) */}
      {bannerSlot ? (
        <div ref={layer2Ref} className={`${styles.layer} ${styles.layer2}`} data-layer="2">
          {bannerSlot}
        </div>
      ) : null}

      {/* Layer 3: Primary Floor Navigation (PINS AT TOP on collapse) */}
      <div ref={layer3Ref} className={`${styles.layer} ${styles.layer3}`} data-layer="3">
        {navSlot}
      </div>

      {/* Layer 4: Task Strip / Sub-tabs (DOCKS UNDER LAYER 3 as Dual-Deck) */}
      {taskStripSlot ? (
        <div ref={layer4Ref} className={`${styles.layer} ${styles.layer4}`} data-layer="4">
          {taskStripSlot}
        </div>
      ) : null}
    </div>
  );
}
