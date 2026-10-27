/**
 * Native builds embed every world font at build time (the expo-font plugin in
 * app.json), so there is nothing to load. The web build uses
 * worldFontFiles.web.ts instead.
 */
export const WORLD_FONT_FILES: Readonly<Record<string, number>> = {};
