import {
  type CSSProperties,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { getToasts, subscribeToasts, type ToastItem, toast } from '../../shared/toasts';
import { Button } from '../Button/Button';
import { WaitingSign } from '../WaitingSign/WaitingSign';

const none = () => [] as const;

/** Same stack as native: how much each older toast peeks, the gap fanned out, how many show. */
const PEEK = 10;
const GAP = 8;
const DEPTH_SHOWN = 3;
const SWIPE_DISTANCE = 72;

const urgent = (item: ToastItem) => item.important || item.tone === 'danger';

interface Placed {
  item: ToastItem;
  style: CSSProperties;
  behind: boolean;
}

function Toast({
  item,
  style,
  behind,
  measure,
}: Placed & { measure: (id: number, height: number) => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const node = useRef<HTMLDivElement | null>(null);

  // Reports its height as it changes, so the stack can place the toasts above it.
  useLayoutEffect(() => {
    const el = node.current;
    if (!el) return;
    measure(item.id, el.offsetHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure(item.id, el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, measure]);

  // A toast that changes while it is up gives a small nudge, so the change is seen.
  const seen = useRef(item.revision);
  useEffect(() => {
    if (item.revision === seen.current) return;
    seen.current = item.revision;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    node.current?.animate?.(
      [{ translate: '0 0' }, { translate: '-3px 0' }, { translate: '3px 0' }, { translate: '0 0' }],
      { duration: 200, composite: 'add' },
    );
  }, [item.revision]);

  // Touch and pen swipe sideways to let a toast go; a mouse uses the button or Escape.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!item.dismissible || event.pointerType === 'mouse') return;
    start.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (start.current !== null) setDx(event.clientX - start.current);
  };
  const onPointerEnd = () => {
    if (start.current === null) return;
    start.current = null;
    if (Math.abs(dx) > SWIPE_DISTANCE) toast.dismiss(item.id);
    else setDx(0);
  };

  const banner = item.size === 'banner';
  return (
    <div
      ref={node}
      className={banner ? 'gd-toast gd-toast-banner' : 'gd-toast'}
      data-tone={item.tone}
      data-size={item.size}
      data-behind={behind || undefined}
      data-swiping={dx !== 0 || undefined}
      aria-hidden={behind || undefined}
      inert={behind || undefined}
      style={{ ...style, ...(dx ? { transform: `translateX(${dx}px)`, opacity: 1 - Math.min(1, Math.abs(dx) / 240) } : null) }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerEnter={() => toast.pause(item.id)}
      onPointerLeave={() => toast.resume(item.id)}
    >
      <div className="gd-toast-line">
        {item.pending ? <WaitingSign size={18} /> : null}
        <p className="gd-text" data-kind={item.size === 'pill' ? 'label' : 'body'}>
          {item.message}
        </p>
        {item.count > 1 ? (
          <span className="gd-toast-count" aria-label={`${item.count} times`}>
            {`×${item.count}`}
          </span>
        ) : null}
        {item.action ? (
          <Button label={item.action.label} variant="quiet" size="sm" onClick={() => toast.act(item.id)} />
        ) : null}
        {item.dismissible && item.size !== 'pill' ? (
          <button type="button" className="gd-toast-dismiss" aria-label="Dismiss" onClick={() => toast.dismiss(item.id)}>
            {'×'}
          </button>
        ) : null}
      </div>
      {item.description && item.size !== 'pill' ? (
        <p className="gd-text gd-toast-description" data-kind="caption">
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Where toasts appear. Place it once in the layout. The two live regions are always in the page
 * (so screen readers announce what is added to them): polite for news, assertive for failures and
 * anything marked important. Visually they are one: banners across the top, everything else in a
 * stack above the bottom edge, the newest in front. Hovering or focusing the stack fans it out and
 * stops the clock; Escape lets the newest go; a touch swipe sideways dismisses. The clock also stops
 * while the tab is hidden.
 */
export function ToastHost() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, none);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [fanned, setFanned] = useState(false);
  const measure = useCallback(
    (id: number, h: number) => setHeights((all) => (all[id] === h ? all : { ...all, [id]: h })),
    [],
  );

  useEffect(() => {
    const onVisibility = () => (document.hidden ? toast.pause() : toast.resume());
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!fanned) return;
    toast.pause();
    return () => toast.resume();
  }, [fanned]);

  const banners = items.filter((i) => i.size === 'banner');
  const stack = items.filter((i) => i.size !== 'banner').reverse();
  const gathered = !fanned && stack.length > 1;
  const height = (id: number) => heights[id] || 56;

  const placed = new Map<number, Placed>();
  let top = 0;
  for (const item of banners) {
    placed.set(item.id, { item, behind: false, style: { '--gd-y': `${top}px` } as CSSProperties });
    top += height(item.id) + GAP;
  }
  let below = 0;
  stack.forEach((item, depth) => {
    const y = gathered ? depth * PEEK : below;
    below += height(item.id) + GAP;
    const back = gathered ? depth : 0;
    placed.set(item.id, {
      item,
      behind: back > 0,
      style: {
        '--gd-y': `${-y}px`,
        '--gd-scale': 1 - back * 0.05,
        '--gd-fade': back >= DEPTH_SHOWN ? 0 : 1 - back * 0.22,
        zIndex: 100 - depth,
      } as CSSProperties,
    });
  });
  const stackHeight = gathered
    ? height(stack[0]?.id ?? -1) + PEEK * Math.min(stack.length - 1, DEPTH_SHOWN - 1)
    : Math.max(0, below - GAP);

  const regions = [
    { list: items.filter((i) => !urgent(i)), role: 'status', live: 'polite' as const },
    { list: items.filter(urgent), role: 'alert', live: 'assertive' as const },
  ];

  return (
    <div
      className="gd-toasts"
      data-fanned={fanned || undefined}
      style={{ height: stackHeight }}
      onMouseEnter={() => stack.length > 1 && setFanned(true)}
      onMouseLeave={() => setFanned(false)}
      onFocus={() => stack.length > 1 && setFanned(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFanned(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        const newest = stack.find((i) => i.dismissible) ?? banners.find((i) => i.dismissible);
        if (newest) toast.dismiss(newest.id);
      }}
    >
      {regions.map(({ list, role, live }) => (
        <div key={role} role={role} aria-live={live} className="gd-toast-region">
          {list.map((item) => {
            const place = placed.get(item.id);
            return place ? <Toast key={item.id} {...place} measure={measure} /> : null;
          })}
        </div>
      ))}
    </div>
  );
}
