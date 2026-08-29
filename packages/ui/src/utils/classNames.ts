/** Compose NativeWind class names while keeping conditional styles readable. */
export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}
