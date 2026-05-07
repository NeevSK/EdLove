declare module 'apca-w3' {
  export function APCAcontrast(txtY: number, bgY: number): string | number;
  export function sRGBtoY(rgb: number[]): number;
  export function displayPolyfill(): void;
}
