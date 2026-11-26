// Exact decimal helpers (4 decimal places, as strings). Never use JS numbers for money or scores.
export const SCALE = 4;
export function toMinor(s: string): bigint {
  const neg = s.startsWith('-');
  const [i, f = ''] = (neg ? s.slice(1) : s).split('.');
  const v = BigInt((i || '0') + f.padEnd(SCALE, '0').slice(0, SCALE));
  return neg ? -v : v;
}
export function fromMinor(v: bigint): string {
  const neg = v < 0n;
  const a = (neg ? -v : v).toString().padStart(SCALE + 1, '0');
  return `${neg ? '-' : ''}${a.slice(0, -SCALE)}.${a.slice(-SCALE)}`;
}
