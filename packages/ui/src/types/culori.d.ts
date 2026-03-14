declare module 'culori' {
  export interface Color {
    mode: string;
    [key: string]: any;
  }

  export function parse(color: string): Color | undefined;
  export function formatHex(color: Color): string;
  export function formatRgb(color: Color): string;
  export function converter(mode: string): (color: Color) => any;
}
