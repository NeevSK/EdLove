import { useMemo } from 'react';
import { useVerger } from './vergerStore';

type Handler<E> = ((event: E) => void) | undefined;

/**
 * Scroll handlers that tell the bound verger a list is scrolling, so quality-lowering changes wait
 * until it settles (the vision's invariant 7). Each wraps the caller's own handler, which runs
 * first and unchanged. A drag that ends without momentum reports nothing: the scroll lapses after
 * config `scrollQuietMs`.
 */
export function useScrollPresence<E>(own: {
  readonly onScrollBeginDrag?: Handler<E>;
  readonly onMomentumScrollBegin?: Handler<E>;
  readonly onMomentumScrollEnd?: Handler<E>;
}) {
  const verger = useVerger();
  const { onScrollBeginDrag, onMomentumScrollBegin, onMomentumScrollEnd } = own;
  return useMemo(() => {
    // The shells' clock (`performance.now()`), so scroll events order with every other event.
    const send = (active: boolean) =>
      verger?.dispatch({ type: 'scroll', at: performance.now(), active });
    return {
      onScrollBeginDrag: (event: E) => {
        onScrollBeginDrag?.(event);
        send(true);
      },
      onMomentumScrollBegin: (event: E) => {
        onMomentumScrollBegin?.(event);
        send(true);
      },
      onMomentumScrollEnd: (event: E) => {
        onMomentumScrollEnd?.(event);
        send(false);
      },
    };
  }, [verger, onScrollBeginDrag, onMomentumScrollBegin, onMomentumScrollEnd]);
}
