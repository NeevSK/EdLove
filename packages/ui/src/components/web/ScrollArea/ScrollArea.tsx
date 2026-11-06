'use client';

import {
  type HTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type ScrollAreaContract, resolveScrollVariantForWorld, type ScrollAreaVariant } from '../../../theme/contracts';
import { cx } from '../cx';

export interface ScrollAreaProps
  extends ScrollAreaContract,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onScroll'> {}

interface VelocityPoint {
  time: number;
  x: number;
  y: number;
}

function renderTalisman(variant: string, orientation: 'horizontal' | 'vertical') {
  if (variant === 'sovereign') {
    return (
      <div className="gd-scrollarea-talisman" aria-hidden="true">
        <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
          <circle cx="14" cy="14" r="9" fill="var(--w-lamp)" opacity="0.25" filter="blur(2px)" />
          <path
            d="M14 4 C16.5 9 20 13 19 18 C18 22 15.5 24 14 24 C12.5 24 10 22 9 18 C8 13 11.5 9 14 4 Z"
            fill="var(--w-lamp)"
            stroke="color-mix(in srgb, var(--w-lamp) 85%, var(--w-surface-raised-bg))"
            strokeWidth="0.8"
          />
          <ellipse cx="14" cy="18" rx="2.2" ry="3.2" fill="var(--w-surface-raised-bg)" opacity="0.9" />
        </svg>
      </div>
    );
  }
  if (variant === 'ratna') {
    return (
      <div className="gd-scrollarea-talisman" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <polygon
            points="7,3 17,3 21,7 21,17 17,21 7,21 3,17 3,7"
            fill="color-mix(in srgb, var(--w-lamp) 85%, var(--w-surface-raised-bg, var(--w-ground)))"
            stroke="var(--w-lamp)"
            strokeWidth="1.2"
          />
          <polygon
            points="9,6 15,6 18,9 18,15 15,18 9,18 6,15 6,9"
            fill="color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 60%, transparent)"
            stroke="color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 80%, transparent)"
            strokeWidth="0.8"
          />
          <line x1="7" y1="3" x2="9" y2="6" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="17" y1="3" x2="15" y2="6" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="21" y1="7" x2="18" y2="9" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="21" y1="17" x2="18" y2="15" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="17" y1="21" x2="15" y2="18" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="7" y1="21" x2="9" y2="18" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="3" y1="17" x2="6" y2="15" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <line x1="3" y1="7" x2="6" y2="9" stroke="var(--w-lamp)" strokeWidth="0.8" />
          <polygon points="10,8 14,8 12,11" fill="var(--w-surface-raised-bg, var(--w-raised))" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (variant === 'fluid') {
    if (orientation === 'horizontal') {
      return (
        <div className="gd-scrollarea-talisman" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <ellipse cx="16" cy="25" rx="10" ry="3" fill="var(--w-ink-soft)" filter="blur(1.5px)" />
            <circle cx="16" cy="16" r="11" fill="url(#gd-dew-lens)" stroke="var(--w-ink-soft)" strokeWidth="0.8" />
            <ellipse cx="16" cy="21" rx="7" ry="3.5" fill="var(--w-ink-soft)" />
            <ellipse cx="12" cy="11" rx="3.5" ry="2" transform="rotate(-35 12 11)" fill="var(--w-ink)" />
            <circle cx="20" cy="19" r="1.1" fill="var(--w-ink-soft)" />
            <defs>
              <radialGradient id="gd-dew-lens" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="color-mix(in srgb, var(--w-surface-raised-bg) 95%, transparent)" stopOpacity="0.85" />
                <stop offset="40%" stopColor="var(--w-glow)" stopOpacity="0.55" />
                <stop offset="85%" stopColor="var(--w-lamp-deep, var(--w-lamp))" stopOpacity="0.65" />
                <stop offset="100%" stopColor="var(--w-lamp-deep, var(--w-lamp))" stopOpacity="0.95" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      );
    }
    // Vertical: Natural droplet with tip at top and bulbous round bottom downwards
    return (
      <div className="gd-scrollarea-talisman" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="24" height="30" fill="none">
          <path
            d="M16 4 C16 4 26 15 25 21 A9 9 0 0 1 7 21 C6 15 16 4 16 4 Z"
            fill="url(#gd-dew-v-lens)"
            stroke="var(--w-ink-soft)"
            strokeWidth="0.9"
          />
          <path d="M12 11 C11 14 10 17 10 20" stroke="var(--w-ink)" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="16" cy="23" rx="5" ry="2.5" fill="var(--w-ink-soft)" />
          <circle cx="19" cy="21" r="1.1" fill="var(--w-ink)" />
          <defs>
            <linearGradient id="gd-dew-v-lens" x1="16" y1="4" x2="16" y2="29" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--w-surface-raised-bg) 95%, transparent)" stopOpacity="0.9" />
              <stop offset="35%" stopColor="var(--w-glow)" stopOpacity="0.6" />
              <stop offset="85%" stopColor="var(--w-lamp-deep, var(--w-lamp))" stopOpacity="0.65" />
              <stop offset="100%" stopColor="var(--w-lamp-deep, var(--w-lamp))" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'leaf') {
    if (orientation === 'horizontal') {
      // Horizontal: Stem on left, wide heart shoulders, midrib spine, slender drip tip pointing rightward
      return (
        <div className="gd-scrollarea-talisman" aria-hidden="true">
          <svg viewBox="0 0 40 28" width="36" height="26" fill="none">
            <path d="M5 14 C10 5 20 6 35 14 C20 22 10 23 5 14 Z" fill="var(--w-ink-soft)" filter="blur(1.5px)" />
            <path
              d="M5 14 C10 5 20 6 35 14 C20 22 10 23 5 14 Z"
              fill="url(#gd-leaf-h)"
              stroke="var(--w-ink-soft)"
              strokeWidth="0.9"
            />
            <path d="M2 15 Q3.5 14 5 14" stroke="var(--w-lamp)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M5 14 Q18 14 35 14" stroke="var(--w-lamp)" strokeWidth="1" strokeLinecap="round" opacity="0.95" />
            <path d="M10 14 Q13 10 17 8 M14 14 Q18 10 22 9 M20 14 Q24 11 27 11" stroke="var(--w-ink-soft)" strokeWidth="0.75" strokeLinecap="round" />
            <path d="M10 14 Q13 18 17 20 M14 14 Q18 18 22 19 M20 14 Q24 17 27 17" stroke="var(--w-ink-soft)" strokeWidth="0.75" strokeLinecap="round" />
            <path d="M10 9 C14 8 18 9 22 11" stroke="var(--w-ink)" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
            <defs>
              <linearGradient id="gd-leaf-h" x1="5" y1="14" x2="35" y2="14" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--w-ink)" />
                <stop offset="35%" stopColor="var(--w-ink)" />
                <stop offset="75%" stopColor="var(--w-ink)" />
                <stop offset="100%" stopColor="var(--w-lamp)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    }
    // Vertical: Stem at top, wide heart shoulders, midrib spine, slender drip tail gracefully pointing downward
    return (
      <div className="gd-scrollarea-talisman" aria-hidden="true">
        <svg viewBox="0 0 28 40" width="26" height="36" fill="none">
          <path d="M14 5 C5 10 6 20 14 35 C22 20 23 10 14 5 Z" fill="var(--w-ink-soft)" filter="blur(1.5px)" />
          <path
            d="M14 5 C5 10 6 20 14 35 C22 20 23 10 14 5 Z"
            fill="url(#gd-leaf-v)"
            stroke="var(--w-ink-soft)"
            strokeWidth="0.9"
          />
          <path d="M14 2 Q14 3.5 14 5" stroke="var(--w-lamp)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M14 5 Q14 18 14 35" stroke="var(--w-lamp)" strokeWidth="1" strokeLinecap="round" opacity="0.95" />
          <path d="M14 10 Q10 13 8 17 M14 14 Q10 18 9 22 M14 20 Q11 24 11 27" stroke="var(--w-ink-soft)" strokeWidth="0.75" strokeLinecap="round" />
          <path d="M14 10 Q18 13 20 17 M14 14 Q18 18 19 22 M14 20 Q17 24 17 27" stroke="var(--w-ink-soft)" strokeWidth="0.75" strokeLinecap="round" />
          <path d="M9 11 C8 15 9 19 11 22" stroke="var(--w-ink)" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
          <defs>
            <linearGradient id="gd-leaf-v" x1="14" y1="5" x2="14" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--w-ink)" />
              <stop offset="35%" stopColor="var(--w-ink)" />
              <stop offset="75%" stopColor="var(--w-ink)" />
              <stop offset="100%" stopColor="var(--w-lamp)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'perahera') {
    return (
      <div className="gd-scrollarea-talisman" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path
            d="M12 2 C13.5 6 19.5 10 19 16 C18 20.5 14 22.5 11 22 C6.5 22.5 3.5 19.5 4 15 C5 10.5 10.5 7.5 12 2 Z"
            fill="color-mix(in srgb, var(--w-danger) 80%, var(--w-lamp))"
            stroke="var(--w-lamp)"
            strokeWidth="1"
          />
          <path
            d="M12 10 C13 12 16 14.5 15 18 C14 20 12 21 10.5 20 C8.5 21 7 19.5 8 17 C8.5 14 11.5 12.5 12 10 Z"
            fill="var(--w-surface-raised-bg, var(--w-raised))"
            opacity="0.95"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'circadian') {
    return (
      <div className="gd-scrollarea-talisman" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="12" r="5" fill="var(--w-lamp)" stroke="var(--w-surface-raised-bg, var(--w-raised))" strokeWidth="1" />
          <line x1="12" y1="2" x2="12" y2="5" stroke="var(--w-lamp)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="var(--w-lamp)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="2" y1="12" x2="5" y2="12" stroke="var(--w-lamp)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="19" y1="12" x2="22" y2="12" stroke="var(--w-lamp)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="5" y1="5" x2="7" y2="7" stroke="var(--w-lamp)" strokeWidth="1" strokeLinecap="round" />
          <line x1="17" y1="17" x2="19" y2="19" stroke="var(--w-lamp)" strokeWidth="1" strokeLinecap="round" />
          <line x1="19" y1="5" x2="17" y2="7" stroke="var(--w-lamp)" strokeWidth="1" strokeLinecap="round" />
          <line x1="7" y1="17" x2="5" y2="19" stroke="var(--w-lamp)" strokeWidth="1" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="var(--w-surface-raised-bg, var(--w-raised))" />
        </svg>
      </div>
    );
  }

  return null;
}

function isPureTokenVariant(variant: string): boolean {
  return variant === 'sovereign' || variant === 'fluid' || variant === 'leaf' || variant === 'ratna' || variant === 'perahera' || variant === 'circadian';
}

/**
 * Sovereign ScrollArea:
 * High-precision, zero-drama scroll container engineered for all 11 worlds.
 *
 * Capabilities:
 * 1. Physical wheel event normalization: maps deltaY to horizontal scroll seamlessly.
 * 2. PointerCapture-driven canvas panning & thumb dragging (zero window listener leaks).
 * 3. Kinetic momentum engine with Euler friction decay.
 * 4. Synthetic click suppression after panning threshold (>4px).
 * 5. Dynamic smooth-scrolling isolation (disabled during active drag/wheel to eliminate jitter).
 * 6. Edge gradient overflow masks matching theme variables.
 * 7. Accessible WAI-ARIA region and scrollbar semantics.
 */
export function ScrollArea({
  children,
  orientation = 'horizontal',
  variant = 'auto',
  tone = 'lamp',
  showEdgeGradients = true,
  dragToScroll = true,
  kineticMomentum = true,
  scrollbarVisibility = 'always',
  viewportId: customViewportId,
  label,
  pips,
  hudLabel,
  onScrollProgress,
  className,
  style,
  ...rest
}: ScrollAreaProps) {
  const generatedId = useId();
  const viewportId = customViewportId || generatedId;
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Active World detection for living instrument auto-inheritance
  const [detectedWorld, setDetectedWorld] = useState<string | null>(null);

  useEffect(() => {
    if (variant && variant !== 'auto') return;

    const inspectWorld = () => {
      const el = scrollRef.current;
      const worldEl = el?.closest('[data-world]');
      const w =
        worldEl?.getAttribute('data-world') ||
        (typeof document !== 'undefined'
          ? document.documentElement.getAttribute('data-world')
          : null);
      setDetectedWorld(w);
    };

    inspectWorld();

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const observer = new MutationObserver(inspectWorld);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-world'],
      });
      return () => observer.disconnect();
    }
  }, [variant]);

  const activeVariant: ScrollAreaVariant =
    variant && variant !== 'auto'
      ? variant
      : resolveScrollVariantForWorld(detectedWorld ?? undefined);

  // Scroll bounds & indicators
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);
  const [thumbSizePct, setThumbSizePct] = useState(20);
  const [thumbOffsetPct, setThumbOffsetPct] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const [isSmooth, setIsSmooth] = useState(false);

  // Interaction refs
  const isPointerDownCanvasRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const isClickBlockedRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startScrollRef = useRef({ left: 0, top: 0 });
  const hasMovedRef = useRef(false);
  const velocityHistoryRef = useRef<VelocityPoint[]>([]);
  const momentumRafRef = useRef<number | null>(null);

  // Velocity stretch for fluid variant
  const [fluidStretch, setFluidStretch] = useState(1);
  const lastScrollTimeRef = useRef(Date.now());
  const lastScrollPosRef = useRef(0);
  const stretchRafRef = useRef<number | null>(null);

  const applyVelocityStretch = useCallback((currentPos: number) => {
    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTimeRef.current);
    const dPos = Math.abs(currentPos - lastScrollPosRef.current);
    const velocity = (dPos / dt) * 16; // Normalized px per frame

    lastScrollTimeRef.current = now;
    lastScrollPosRef.current = currentPos;

    if (velocity > 1.2) {
      const targetStretch = Math.min(1.8, 1 + velocity * 0.015);
      setFluidStretch(targetStretch);

      if (stretchRafRef.current !== null) {
        cancelAnimationFrame(stretchRafRef.current);
      }
      const decay = () => {
        setFluidStretch((prev) => {
          if (prev <= 1.02) return 1;
          const next = 1 + (prev - 1) * 0.84;
          stretchRafRef.current = requestAnimationFrame(decay);
          return next;
        });
      };
      stretchRafRef.current = requestAnimationFrame(decay);
    }
  }, []);

  // Circadian angle matching diurnal solar position (hydrated client-side to prevent SSR mismatch)
  const [sunAngle, setSunAngle] = useState(45);
  useEffect(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    setSunAngle(Math.round((minutes / 1440) * 360));
  }, []);

  const isHorizontal = orientation === 'horizontal' || orientation === 'both';
  const isVertical = orientation === 'vertical' || orientation === 'both';

  // Jump to specific landmark pip percentage
  const scrollToPct = useCallback((pct: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = orientation === 'vertical'
      ? Math.max(0, el.scrollHeight - el.clientHeight)
      : Math.max(0, el.scrollWidth - el.clientWidth);
    const target = (pct / 100) * maxScroll;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({
        [orientation === 'vertical' ? 'top' : 'left']: target,
        behavior: 'smooth',
      });
    } else {
      if (orientation === 'vertical') el.scrollTop = target;
      else el.scrollLeft = target;
    }
  }, [orientation]);

  // Compute scroll metrics and thumb position
  const updateScrollMetrics = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = el;
    const maxScrollX = Math.max(0, scrollWidth - clientWidth);
    const maxScrollY = Math.max(0, scrollHeight - clientHeight);

    const scrollable = orientation === 'vertical' ? maxScrollY > 1 : maxScrollX > 1;
    setIsScrollable(scrollable);

    const currentPos = orientation === 'vertical' ? scrollTop : scrollLeft;
    applyVelocityStretch(currentPos);

    if (orientation === 'vertical') {
      setCanScrollStart(scrollTop > 2);
      setCanScrollEnd(scrollTop < maxScrollY - 2);

      if (scrollable) {
        const heightPct = Math.max(Math.min((clientHeight / scrollHeight) * 100, 85), 15);
        const progress = maxScrollY > 0 ? scrollTop / maxScrollY : 0;
        setThumbSizePct(heightPct);
        setThumbOffsetPct(progress * (100 - heightPct));
        setScrollProgress(progress);
      } else {
        setThumbSizePct(0);
        setThumbOffsetPct(0);
        setScrollProgress(0);
      }
    } else {
      setCanScrollStart(scrollLeft > 2);
      setCanScrollEnd(scrollLeft < maxScrollX - 2);

      if (scrollable) {
        const widthPct = Math.max(Math.min((clientWidth / scrollWidth) * 100, 85), 15);
        const progress = maxScrollX > 0 ? scrollLeft / maxScrollX : 0;
        setThumbSizePct(widthPct);
        setThumbOffsetPct(progress * (100 - widthPct));
        setScrollProgress(progress);
      } else {
        setThumbSizePct(0);
        setThumbOffsetPct(0);
        setScrollProgress(0);
      }
    }

    if (onScrollProgress) {
      onScrollProgress({
        x: maxScrollX > 0 ? scrollLeft / maxScrollX : 0,
        y: maxScrollY > 0 ? scrollTop / maxScrollY : 0,
      });
    }
  }, [orientation, onScrollProgress]);

  // Cancel any running kinetic momentum
  const cancelMomentum = useCallback(() => {
    if (momentumRafRef.current !== null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  }, []);

  // Sync metrics on mount, resize, and DOM changes
  useEffect(() => {
    updateScrollMetrics();
    const el = scrollRef.current;
    if (!el) return;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateScrollMetrics();
      });
      ro.observe(el);
      if (el.firstElementChild) {
        ro.observe(el.firstElementChild);
      }
    }

    let mo: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => {
        updateScrollMetrics();
      });
      mo.observe(el, { childList: true, subtree: false });
    }

    const onWindowResize = () => updateScrollMetrics();
    window.addEventListener('resize', onWindowResize);

    // Mouse wheel normalization (translates deltaY to horizontal scroll)
    const onNativeWheel = (e: WheelEvent) => {
      if (orientation !== 'horizontal') return;

      const { scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;

      cancelMomentum();
      setIsSmooth(false);

      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      // Handle Firefox / line-based mousewheels (deltaMode 1: lines, 2: pages)
      if (e.deltaMode === 1) {
        delta *= 24;
      } else if (e.deltaMode === 2) {
        delta *= clientWidth;
      }

      const currentScroll = el.scrollLeft;
      const willScrollStart = delta < 0 && currentScroll > 0;
      const willScrollEnd = delta > 0 && currentScroll < maxScroll - 1;

      if (willScrollStart || willScrollEnd) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollLeft = Math.max(0, Math.min(maxScroll, currentScroll + delta));
        updateScrollMetrics();
      }
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });

    return () => {
      cancelMomentum();
      ro?.disconnect();
      mo?.disconnect();
      window.removeEventListener('resize', onWindowResize);
      el.removeEventListener('wheel', onNativeWheel);
    };
  }, [orientation, updateScrollMetrics, cancelMomentum]);

  // Pointer Canvas Panning Handlers (Drag to Scroll)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button and skip touch devices to let native momentum touch scrolling run
    if (e.button !== 0 || e.pointerType === 'touch' || !dragToScroll) return;

    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a, [role="button"], .gd-scrollarea-track')) {
      return;
    }

    // Stop propagation so parent scrollareas do not initiate canvas drag simultaneously
    e.stopPropagation();

    cancelMomentum();
    setIsSmooth(false);

    isPointerDownCanvasRef.current = true;
    hasMovedRef.current = false;
    activePointerIdRef.current = e.pointerId;
    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    startPointerRef.current = { x: clientX, y: clientY };
    startScrollRef.current = {
      left: scrollRef.current?.scrollLeft ?? 0,
      top: scrollRef.current?.scrollTop ?? 0,
    };

    velocityHistoryRef.current = [{ time: performance.now(), x: clientX, y: clientY }];

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // In tests or non-supporting environments, fails silently
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownCanvasRef.current || !scrollRef.current) return;

    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    const deltaX = clientX - startPointerRef.current.x;
    const deltaY = clientY - startPointerRef.current.y;

    if (!hasMovedRef.current && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
      hasMovedRef.current = true;
      setIsPanning(true);
    }

    if (hasMovedRef.current) {
      if (isHorizontal) {
        scrollRef.current.scrollLeft = startScrollRef.current.left - deltaX;
      }
      if (isVertical) {
        scrollRef.current.scrollTop = startScrollRef.current.top - deltaY;
      }
      updateScrollMetrics();

      // Record velocity
      const now = performance.now();
      velocityHistoryRef.current.push({ time: now, x: e.clientX, y: e.clientY });
      if (velocityHistoryRef.current.length > 5) {
        velocityHistoryRef.current.shift();
      }
    }
  };

  const endCanvasPanning = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownCanvasRef.current) return;

    isPointerDownCanvasRef.current = false;
    setIsPanning(false);

    try {
      if (activePointerIdRef.current !== null && e.currentTarget.hasPointerCapture(activePointerIdRef.current)) {
        e.currentTarget.releasePointerCapture(activePointerIdRef.current);
      }
    } catch {
      // Ignore capture release errors
    }
    activePointerIdRef.current = null;

    // Suppress accidental click if user was dragging
    if (hasMovedRef.current) {
      isClickBlockedRef.current = true;
      setTimeout(() => {
        isClickBlockedRef.current = false;
      }, 150);

      const blockClick = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        window.removeEventListener('click', blockClick, true);
      };
      window.addEventListener('click', blockClick, true);
      setTimeout(() => window.removeEventListener('click', blockClick, true), 120);

      // Kinetic momentum decay
      if (kineticMomentum && velocityHistoryRef.current.length >= 2) {
        const history = velocityHistoryRef.current;
        const last = history[history.length - 1];
        const prev = history[0];

        if (last && prev) {
          const dt = Math.max(1, last.time - prev.time);

          if (dt < 100) {
            let vx = (last.x - prev.x) / dt;
            let vy = (last.y - prev.y) / dt;
            const friction = 0.94;
            let lastTick = performance.now();

          const step = () => {
            if (!scrollRef.current) return;
            const now = performance.now();
            const elapsed = Math.min(now - lastTick, 32);
            lastTick = now;

            vx *= Math.pow(friction, elapsed / 16);
            vy *= Math.pow(friction, elapsed / 16);

            if (isHorizontal) {
              scrollRef.current.scrollLeft -= vx * elapsed;
            }
            if (isVertical) {
              scrollRef.current.scrollTop -= vy * elapsed;
            }
            updateScrollMetrics();

            if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
              momentumRafRef.current = requestAnimationFrame(step);
            } else {
              momentumRafRef.current = null;
            }
          };

          momentumRafRef.current = requestAnimationFrame(step);
        }
      }
    }
  }
};

  // Stepper handlers for classic variant
  const handleStepStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    cancelMomentum();
    setIsSmooth(true);
    if (orientation === 'vertical') {
      if (typeof el.scrollBy === 'function') {
        el.scrollBy({ top: -40, behavior: 'smooth' });
      } else {
        el.scrollTop -= 40;
      }
    } else {
      if (typeof el.scrollBy === 'function') {
        el.scrollBy({ left: -40, behavior: 'smooth' });
      } else {
        el.scrollLeft -= 40;
      }
    }
    updateScrollMetrics();
  };

  const handleStepEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    cancelMomentum();
    setIsSmooth(true);
    if (orientation === 'vertical') {
      if (typeof el.scrollBy === 'function') {
        el.scrollBy({ top: 40, behavior: 'smooth' });
      } else {
        el.scrollTop += 40;
      }
    } else {
      if (typeof el.scrollBy === 'function') {
        el.scrollBy({ left: 40, behavior: 'smooth' });
      } else {
        el.scrollLeft += 40;
      }
    }
    updateScrollMetrics();
  };

  // Direct Track Click Handler (jumps or pages with center alignment)
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click is on or inside the thumb, NEVER trigger track jump
    const target = e.target as HTMLElement;
    if (target.closest('.gd-scrollarea-thumb')) return;

    const track = railRef.current ?? trackRef.current;
    const el = scrollRef.current;
    if (!track || !el) return;
    cancelMomentum();
    setIsSmooth(true);

    const rect = track.getBoundingClientRect();
    const thumbEl = track.querySelector('.gd-scrollarea-thumb') as HTMLElement | null;

    if (orientation === 'vertical') {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      const thumbHeight = thumbEl ? thumbEl.getBoundingClientRect().height : Math.max(28, (thumbSizePct / 100) * rect.height);
      const travelDistance = Math.max(1, rect.height - thumbHeight);
      const clickY = e.clientY - rect.top;
      const targetOffset = Math.max(0, Math.min(travelDistance, clickY - thumbHeight / 2));
      el.scrollTo({ top: (targetOffset / travelDistance) * maxScroll, behavior: 'smooth' });
    } else {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const thumbWidth = thumbEl ? thumbEl.getBoundingClientRect().width : Math.max(28, (thumbSizePct / 100) * rect.width);
      const travelDistance = Math.max(1, rect.width - thumbWidth);
      const clickX = e.clientX - rect.left;
      const targetOffset = Math.max(0, Math.min(travelDistance, clickX - thumbWidth / 2));
      el.scrollTo({ left: (targetOffset / travelDistance) * maxScroll, behavior: 'smooth' });
    }
  };

  // Draggable Thumb Handlers (Unified pointer capture with window fallback for zero disconnect)
  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    cancelMomentum();
    setIsSmooth(false);
    setIsThumbDragging(true);

    const thumbEl = e.currentTarget;
    const track = railRef.current ?? trackRef.current;
    const el = scrollRef.current;
    if (!track || !el) return;

    try {
      thumbEl.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if pointer capture is unsupported or element disconnected
    }

    const startCoord = orientation === 'vertical' ? e.clientY : e.clientX;
    const initialScroll = orientation === 'vertical' ? el.scrollTop : el.scrollLeft;
    const thumbRect = thumbEl.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const thumbSize = orientation === 'vertical' ? thumbRect.height : thumbRect.width;
    const trackSize = orientation === 'vertical' ? trackRect.height : trackRect.width;
    const travelDistance = Math.max(1, trackSize - thumbSize);

    // Prevent text selection across the document during active drag
    const prevUserSelect = typeof document !== 'undefined' ? document.body.style.userSelect : '';
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = 'none';
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;

      const maxScroll = orientation === 'vertical'
        ? scrollEl.scrollHeight - scrollEl.clientHeight
        : scrollEl.scrollWidth - scrollEl.clientWidth;

      if (maxScroll <= 0 || travelDistance <= 0) return;

      const currentCoord = orientation === 'vertical' ? moveEvent.clientY : moveEvent.clientX;
      const delta = currentCoord - startCoord;
      const nextScroll = Math.max(0, Math.min(maxScroll, initialScroll + (delta / travelDistance) * maxScroll));

      if (orientation === 'vertical') {
        scrollEl.scrollTop = nextScroll;
      } else {
        scrollEl.scrollLeft = nextScroll;
      }
      updateScrollMetrics();
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setIsThumbDragging(false);
      try {
        if (thumbEl.hasPointerCapture(upEvent.pointerId)) {
          thumbEl.releasePointerCapture(upEvent.pointerId);
        }
      } catch {
        // Safe no-op
      }
      if (typeof document !== 'undefined') {
        document.body.style.userSelect = prevUserSelect;
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !isScrollable) return;

    cancelMomentum();
    setIsSmooth(true);
    const step = 80;

    if (orientation === 'vertical') {
      if (e.key === 'ArrowDown') {
        el.scrollTop += step;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        el.scrollTop -= step;
        e.preventDefault();
      } else if (e.key === 'Home') {
        el.scrollTop = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        el.scrollTop = el.scrollHeight;
        e.preventDefault();
      } else if (e.key === 'PageDown') {
        el.scrollTop += el.clientHeight * 0.8;
        e.preventDefault();
      } else if (e.key === 'PageUp') {
        el.scrollTop -= el.clientHeight * 0.8;
        e.preventDefault();
      }
    } else {
      if (e.key === 'ArrowRight') {
        el.scrollLeft += step;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        el.scrollLeft -= step;
        e.preventDefault();
      } else if (e.key === 'Home') {
        el.scrollLeft = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        el.scrollLeft = el.scrollWidth;
        e.preventDefault();
      } else if (e.key === 'PageDown') {
        el.scrollLeft += el.clientWidth * 0.8;
        e.preventDefault();
      } else if (e.key === 'PageUp') {
        el.scrollLeft -= el.clientWidth * 0.8;
        e.preventDefault();
      }
    }
  };

  const regionLabel = label || (orientation === 'vertical' ? 'Vertical scroll area' : 'Horizontal scroll area');

  return (
    <div
      {...rest}
      className={cx('gd-scrollarea', className)}
      data-orientation={orientation}
      data-variant={activeVariant}
      onClickCapture={(e) => {
        if (isClickBlockedRef.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      style={{
        ...style,
        ['--gd-scroll-stretch' as string]: fluidStretch,
        ['--gd-sun-angle' as string]: `${sunAngle}deg`,
      }}
    >
      {/* Start Edge Gradient Mask */}
      {showEdgeGradients && canScrollStart && (
        <div className="gd-scrollarea-mask-start" aria-hidden="true" />
      )}

      {/* Scrollable Viewport */}
      <div
        id={viewportId}
        ref={scrollRef}
        className="gd-scrollarea-viewport"
        data-orientation={orientation}
        data-panning={isPanning}
        data-smooth={isSmooth}
        onScroll={updateScrollMetrics}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={endCanvasPanning}
        onPointerCancel={endCanvasPanning}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label={regionLabel}
      >
        <div className="gd-scrollarea-content">{children}</div>
      </div>

      {/* End Edge Gradient Mask */}
      {showEdgeGradients && canScrollEnd && (
        <div className="gd-scrollarea-mask-end" aria-hidden="true" />
      )}

      {/* Hairline Track & Draggable Thumb (suppressed when variant="native") */}
      {(isScrollable || scrollbarVisibility === 'always' || activeVariant === 'classic') && activeVariant !== 'native' && (
        <div
          ref={trackRef}
          className="gd-scrollarea-track"
          data-axis={orientation === 'vertical' ? 'vertical' : 'horizontal'}
          data-visibility={scrollbarVisibility}
          data-active={isThumbDragging || isPanning}
        >
          {activeVariant === 'classic' && (
            <button
              type="button"
              className="gd-scrollarea-stepper"
              data-dir="start"
              aria-label="Scroll backward"
              tabIndex={-1}
              onClick={handleStepStart}
            >
              {orientation === 'vertical' ? '▲' : '◀'}
            </button>
          )}

          <div
            ref={railRef}
            className="gd-scrollarea-rail"
            onClick={handleTrackClick}
          >
            {pips && pips.length > 0 && (
              <div className="gd-scrollarea-pips" aria-hidden="true">
                {pips.map((pip) => (
                  <div
                    key={pip.id}
                    className="gd-scrollarea-pip"
                    style={
                      orientation === 'vertical'
                        ? { top: `${pip.offsetPct}%` }
                        : { left: `${pip.offsetPct}%` }
                    }
                    title={pip.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToPct(pip.offsetPct);
                    }}
                  />
                ))}
              </div>
            )}

            {(() => {
              const isPure = isPureTokenVariant(activeVariant);
              const thumbStyle = isPure
                ? orientation === 'vertical'
                  ? {
                      width: '36px',
                      height: '36px',
                      top: `calc(${scrollProgress * 100}% - ${scrollProgress * 36}px)`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }
                  : {
                      width: '36px',
                      height: '36px',
                      left: `calc(${scrollProgress * 100}% - ${scrollProgress * 36}px)`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }
                : orientation === 'vertical'
                  ? {
                      width: '100%',
                      height: `${thumbSizePct}%`,
                      top: `${thumbOffsetPct}%`,
                    }
                  : {
                      height: '100%',
                      width: `${thumbSizePct}%`,
                      left: `${thumbOffsetPct}%`,
                    };

              return (
                <div
                  className="gd-scrollarea-thumb"
                  data-tone={tone}
                  data-dragging={isThumbDragging}
                  data-pure-token={isPure ? 'true' : undefined}
                  onPointerDown={handleThumbPointerDown}
                  role="scrollbar"
                  aria-controls={viewportId}
                  aria-orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
                  aria-valuenow={Math.round(scrollProgress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={thumbStyle}
                >
                  {renderTalisman(activeVariant, orientation === 'horizontal' ? 'horizontal' : 'vertical')}
                </div>
              );
            })()}
          </div>

          {hudLabel && isThumbDragging && (
            <div
              className="gd-scrollarea-hud"
              aria-live="polite"
              style={
                orientation === 'vertical'
                  ? { top: `${scrollProgress * 100}%` }
                  : { left: `${scrollProgress * 100}%` }
              }
            >
              {hudLabel}
            </div>
          )}

          {activeVariant === 'classic' && (
            <button
              type="button"
              className="gd-scrollarea-stepper"
              data-dir="end"
              aria-label="Scroll forward"
              tabIndex={-1}
              onClick={handleStepEnd}
            >
              {orientation === 'vertical' ? '▼' : '▶'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
