import path from "path";
import fs from "fs";
import { ROOT_DIR } from "./constants.js";

/**
 * --- Alchemist's Transmutation: Path Sovereignty ---
 * Normalizes package aliases (@repo/*, @app/*) to absolute filesystem paths.
 */
export function normalizeTarget(target: string): string {
  const clean = target.replace(/^['"]|['"]$/g, ""); // Remove accidental quotes
  
  // 1. Full Aliases (@repo/ui -> packages/ui/src)
  if (clean.startsWith("@repo/")) {
    const pkg = clean.replace("@repo/", "");
    return path.join(ROOT_DIR, "packages", pkg, "src");
  }
  
  // 2. App Aliases (@app/web -> apps/web/src)
  if (clean.startsWith("@app/")) {
    const app = clean.replace("@app/", "");
    return path.join(ROOT_DIR, "apps", app, "src");
  }

  // 3. Absolute or relative fallbacks
  return path.isAbsolute(clean) ? clean : path.join(ROOT_DIR, clean);
}

/**
 * The "Hunter" Logic: Scouts for the report in ordered and unordered locations.
 */
export function findSurgicalReport(filename: string, packageShortName: string): string {
  const candidates = [
    path.join(ROOT_DIR, "reports", filename),          // 1. Global reports (ORDERED - PRIMARY)
    path.join(ROOT_DIR, "packages", packageShortName, filename), // 2. Package root
    path.join(ROOT_DIR, filename),                     // 3. Root (LURKING/STALE - FALLBACK)
    path.join(ROOT_DIR, "packages", packageShortName, "reports", filename), // Package reports
    path.join(ROOT_DIR, "apps", packageShortName, filename),     // App root
    path.join(ROOT_DIR, "apps", packageShortName, "reports", filename), // App reports
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.error(`>>> Discovery: Found report at ${p}`);
      return fs.readFileSync(p, "utf-8");
    }
  }

  return "Discovery failed: Surgical report could not be found in any candidate location.";
}

export function readReport(filename: string): string {
  const p = path.join(ROOT_DIR, "reports", filename);
  if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
  
  // Fallback search for general reports
  const fallback = path.join(ROOT_DIR, filename);
  return fs.existsSync(fallback) ? fs.readFileSync(fallback, "utf-8") : "Report not found.";
}
