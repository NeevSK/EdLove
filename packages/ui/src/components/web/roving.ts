import type { KeyboardEvent } from 'react';

const STEP: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Arrow keys, Home and End for a set of options with one tab stop (tabs,
 * segments, radios drawn as buttons): moves to the next enabled option and
 * selects it, wrapping at the ends. Returns the value chosen, or null.
 */
export function rovingNext<V extends string>(
  event: KeyboardEvent,
  options: readonly { value: V; disabled?: boolean }[],
  current: V,
): V | null {
  const enabled = options.filter((o) => !o.disabled);
  if (enabled.length === 0) return null;
  const at = enabled.findIndex((o) => o.value === current);
  let next: { value: V } | undefined;
  if (event.key === 'Home') next = enabled[0];
  else if (event.key === 'End') next = enabled[enabled.length - 1];
  else if (STEP[event.key]) next = enabled[(at + (STEP[event.key] ?? 0) + enabled.length) % enabled.length];
  if (!next) return null;
  event.preventDefault();
  return next.value;
}
