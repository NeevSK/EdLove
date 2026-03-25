function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeHex(hex: string): string {
  const value = hex.trim().replace('#', '');
  if (value.length === 3) {
    return value
      .split('')
      .map((part) => `${part}${part}`)
      .join('');
  }

  return value.slice(0, 6);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex);

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

export function mix(hexA: string, hexB: string, amount: number): string {
  const channelsA = hexToRgb(hexA);
  const channelsB = hexToRgb(hexB);
  const t = clamp(amount, 0, 1);

  return `#${channelsA
    .map((value, index) => {
      const target = channelsB[index] ?? value;
      return clampChannel(value + (target - value) * t).toString(16).padStart(2, '0');
    })
    .join('')}`;
}
