/// <reference types="apca-w3" //// <reference types="culori" /
declare module "apca-w3" {
	export function APCAcontrast(txtY: number, bgY: number): string | number;
	export function sRGBtoY(rgb: number[]): number;
	export function displayPolyfill(): void;
}

declare module "culori" {
	export interface Color {
		mode: string;
		[key: string]: any;
	}

	export function parse(color: string): Color | undefined;
	export function formatHex(color: Color): string;
	export function formatRgb(color: Color): string;
	export function converter(mode: string): (color: Color) => any;
}
