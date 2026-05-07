/**
 * useGPUPrewarm.ts \u2014 Startup Pre-warm Hook
 * Tr\u00FCbe-Art v1.0 \u00B7 2026 Production Ready
 *
 * One-time startup hook. Must be called at app root (via TrubeProvider).
 * Compiles all 8 surface WGSL shaders via the Nitro bridge.
 * Expected total cost: ~200\u2013400ms, amortized once at launch.
 *
 * "Pipeline pre-warm: Once at startup (~300ms). Per-frame cost: Near zero."
 * \u2014 Architecture v0.3, \u00A74.2 The Critical Pre-warm Rule
 */

import { useEffect, useState } from "react";
import { driverManager } from "../native/DriverManager";
import { getSurfaceNames } from "./soul/SoulLibrary";

export type PrewarmStatus =
	| "idle"
	| "warming"
	| "ready"
	| "partial"
	| "unavailable";

export interface PrewarmResult {
	status: PrewarmStatus;
	compiledSurfaces: string[];
	failedSurfaces: string[];
	totalMs: number;
}

export function useGPUPrewarm(): PrewarmResult {
	const [result, setResult] = useState<PrewarmResult>({
		status: driverManager.isPrewarmed() ? "ready" : "idle",
		compiledSurfaces: driverManager.isPrewarmed() ? getSurfaceNames() : [],
		failedSurfaces: [],
		totalMs: 0,
	});

	useEffect(() => {
		let cancelled = false;

		async function runPrewarm() {
			if (driverManager.isPrewarmed()) {
				if (!cancelled) {
					setResult({
						status: "ready",
						compiledSurfaces: getSurfaceNames(),
						failedSurfaces: [],
						totalMs: 0,
					});
				}
				return;
			}

			const t0 = Date.now();
			const bestBackend = driverManager.getBestBackend();

			if (bestBackend === "compatibility-static") {
				if (!cancelled) {
					setResult({
						status: "unavailable",
						compiledSurfaces: [],
						failedSurfaces: getSurfaceNames(),
						totalMs: Date.now() - t0,
					});
				}
				return;
			}

			setResult((prev) => ({ ...prev, status: "warming" }));

			try {
				await driverManager.prewarm();

				if (!cancelled) {
					setResult({
						status: "ready",
						compiledSurfaces: getSurfaceNames(),
						failedSurfaces: [],
						totalMs: Date.now() - t0,
					});
				}
			} catch (_e) {
				if (!cancelled) {
					setResult({
						status: "unavailable",
						compiledSurfaces: [],
						failedSurfaces: getSurfaceNames(),
						totalMs: Date.now() - t0,
					});
				}
			}
		}

		runPrewarm();
		return () => {
			cancelled = true;
		};
	}, []);

	return result;
}
