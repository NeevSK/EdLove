/**
 * SoulLibrary.ts \u2014 Tr\u00FCbe-Art Soul Layer
 *
 * Single source of truth for all shader access \u2014 both WGSL (Tier 1/2) and SkSL (Tier 3).
 *
 * Exports:
 *   getSurfaceShader(name)  \u2014 complete WGSL string (noise prepended)
 *   getSkiaEffect(name)     \u2014 memoized Skia RuntimeEffect (SkSL compiled)
 *   getSurfaceNames()       \u2014 array of 8 canonical surface name strings
 *   soulLibrary             \u2014 singleton for backward-compat with old renderer imports
 */

import { Skia, type SkRuntimeEffect } from "@shopify/react-native-skia";
import { getSKSLSurface, getSKSLSurfaceNames } from "./sksl-shaders";

// \u2500\u2500 WGSL: Shared noise library (prepended to every surface shader) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const NOISE_WGSL: string = require("../../native/shaders/shared/noise.wgsl");

// \u2500\u2500 WGSL: Surface shader map \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const WGSL_SURFACE_SHADERS: Record<string, string> = {
	aurora: require("../../native/shaders/surfaces/aurora.wgsl"),
	silk: require("../../native/shaders/surfaces/silk.wgsl"),
	"young-leaf": require("../../native/shaders/surfaces/young-leaf.wgsl"),
	mist: require("../../native/shaders/surfaces/mist.wgsl"),
	waterfall: require("../../native/shaders/surfaces/waterfall.wgsl"),
	"evening-sky": require("../../native/shaders/surfaces/evening-sky.wgsl"),
	skymorphic: require("../../native/shaders/surfaces/skymorphic.wgsl"),
	"water-surface": require("../../native/shaders/surfaces/water-surface.wgsl"),
};

// Pre-assemble WGSL once at module load: noise.wgsl + surface
const ASSEMBLED_WGSL: Record<string, string> = Object.fromEntries(
	Object.entries(WGSL_SURFACE_SHADERS).map(([name, shader]) => [
		name,
		`${NOISE_WGSL}\n\n/* === ${name} surface === */\n${shader}`,
	]),
);

// \u2500\u2500 SkSL: Compiled RuntimeEffect cache \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const SKIA_EFFECT_CACHE: Map<string, SkRuntimeEffect> = new Map();

/**
 * Returns the complete WGSL source for a named surface (Tier 1/2).
 * noise.wgsl is pre-pended once at module load.
 */
export function getSurfaceShader(name: string): string | null {
	return ASSEMBLED_WGSL[name] ?? null;
}

/**
 * Returns a memoized Skia RuntimeEffect for a named surface (Tier 3).
 * Compiles the SkSL on first call; returns cached on subsequent calls.
 */
export function getSkiaEffect(name: string): SkRuntimeEffect | null {
	if (SKIA_EFFECT_CACHE.has(name)) {
		return SKIA_EFFECT_CACHE.get(name)!;
	}
	const sksl = getSKSLSurface(name);
	if (!sksl) {
		console.warn(
			`[Tr\u00FCbe-Art] [SoulLibrary] No SkSL shader for surface: ${name}`,
		);
		return null;
	}
	const effect = Skia.RuntimeEffect.Make(sksl);
	if (!effect) {
		console.error(
			`[Tr\u00FCbe-Art] [SoulLibrary] SkSL compile failed for surface: ${name}`,
		);
		return null;
	}
	SKIA_EFFECT_CACHE.set(name, effect);
	return effect;
}

/**
 * Pre-warm all Skia SkSL effects (call once at startup from TrubeProvider).
 * SkSL compilation is synchronous CPU-side.
 */
export function prewarmSkiaEffects(): { compiled: string[]; failed: string[] } {
	const compiled: string[] = [];
	const failed: string[] = [];
	for (const name of getSKSLSurfaceNames()) {
		const effect = getSkiaEffect(name);
		if (effect) compiled.push(name);
		else failed.push(name);
	}
	return { compiled, failed };
}

/**
 * Returns all surface names in the canonical library.
 */
export function getSurfaceNames(): string[] {
	return Object.keys(ASSEMBLED_WGSL);
}

export const SOUL_SURFACE_COUNT = Object.keys(ASSEMBLED_WGSL).length;

// \u2500\u2500 Singleton (backward-compat for existing renderer imports) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export const soulLibrary = {
	getSkiaEffect,
	getSurfaceShader,
	getSurfaceNames,
	prewarmSkiaEffects,
};
