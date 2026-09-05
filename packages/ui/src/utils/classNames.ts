import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Compose NativeWind class names with deterministic last-wins conflict resolution.
 *  Uses standard tailwind-merge (v3) which handles Tailwind v4 conflicts correctly.
 *  Phase tokens are resolved naturally by standard conflict groups. */
export function cn(...classNames: ClassValue[]): string {
  return twMerge(clsx(classNames));
}
