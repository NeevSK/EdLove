import { Platform } from "react-native";
import { NitroModules } from "react-native-nitro-modules";
import type { TrubeBackend } from "../core/types";
import { SkiaDriver } from "./SkiaDriver";
import type { TrubeGPUDriver } from "./TrubeDriver.nitro";
import { WebGPUDriver } from "./WebGPUDriver";

/**
 * DriverManager: Orchestrates the Triple-Tier Rendering Hierarchy.
 */
class DriverManager {
	private nativeDriver: TrubeGPUDriver | null = null;
	private webgpuDriver: WebGPUDriver | null = null;
	private skiaDriver: SkiaDriver | null = null;
	private globalFailover: boolean = false;
	private prewarmed: boolean = false;
	private onFailoverListener: ((reason: string) => void) | null = null;

	constructor() {
		this.initialize();
	}

	public setOnFailoverListener(listener: (reason: string) => void) {
		this.onFailoverListener = listener;
	}

	public triggerGlobalFailover(reason: string) {
		if (this.globalFailover) return;
		this.globalFailover = true;
		console.warn(
			`[Tr\u00FCbe-Art] [FAILOVER] Global failover activated: ${reason}`,
		);
		this.onFailoverListener?.(reason);
	}

	public isFailoverActive(): boolean {
		return this.globalFailover;
	}

	private initialize() {
		// 1. Attempt to load Tier 1 (Capture C++ via Nitro)
		try {
			this.nativeDriver =
				NitroModules.createHybridObject<TrubeGPUDriver>("TrubeGPUDriver");
			console.log("[Tr\u00FCbe-Art] [Tier 1] Native Driver Linked.");
		} catch (_e) {
			console.log("[Tr\u00FCbe-Art] [Tier 1] Native Driver not available.");
		}

		// 2. Initialize Tier 3 (Skia) immediately as it's the rock-solid fallback
		this.skiaDriver = new SkiaDriver();
	}

	public async prewarm() {
		if (this.prewarmed) return;

		console.log("[Tr\u00FCbe-Art] Initializing Global Pre-warm Sequence...");

		const {
			getSurfaceNames,
			getSurfaceShader,
		} = require("../core/soul/SoulLibrary");
		const bestBackend = this.getBestBackend();
		const t0 = Date.now();

		if (bestBackend === "native-vulkan" || bestBackend === "native-metal") {
			// Tier 1: compile real WGSL via Nitro \u2192 TrubeCore.prewarmSurfaceAsync()
			if (this.nativeDriver) {
				const promises = getSurfaceNames().map(async (name: string) => {
					const wgsl = getSurfaceShader(name);
					if (wgsl) {
						console.log(
							`[Tr\u00FCbe-Art] [Prewarm] [Async] Starting ${name}...`,
						);
						const ok = await this.nativeDriver!.prewarmSurfaceAsync(name, wgsl);
						if (!ok)
							console.error(
								`[Tr\u00FCbe-Art] [Prewarm] GPU compile failed: ${name}`,
							);
						return ok;
					}
					return true;
				});
				await Promise.all(promises);
			}
		} else if (bestBackend === "webgpu") {
			// Tier 2: WebGPU JS path
			const driver = this.getWebGPUDriver();
			for (const name of getSurfaceNames()) {
				const wgsl = getSurfaceShader(name);
				if (wgsl) await driver.prewarm(name, wgsl);
			}
		}

		// Always pre-warm Skia as it's the ultimate fallback
		this.skiaDriver?.prewarm();

		this.prewarmed = true;
		console.log(
			`[Tr\u00FCbe-Art] Global Pre-warm Complete in ${Date.now() - t0}ms.`,
		);
	}

	public isPrewarmed(): boolean {
		return this.prewarmed;
	}

	public releaseResources(surfaceName: string) {
		console.log(
			`[Tr\u00FCbe-Art] [Lifecycle] Releasing resources for: ${surfaceName}`,
		);
		// Tier 1 (Native C++): resources are managed by RAII inside TrubeCore.
		// No explicit release call needed \u2014 SurfaceSession RAII handles it.
		// Tier 2 (WebGPU)
		if (this.webgpuDriver) {
			this.webgpuDriver.release(surfaceName);
		}
	}

	/**
	 * Returns the best available backend for the current environment.
	 * Enforces the "2026 Mandate" Hierarchy:
	 * 1. Tier 1: Native C++ (Nitro) / RenderEffect (API 31+)
	 * 2. Tier 2: WebGPU (Anyhow Bridge)
	 * 3. Tier 3: Skia (High-Fidelity Fallback / API 29+)
	 */
	public getBestBackend(): TrubeBackend {
		if (this.globalFailover) return "skia-runtime-effect";

		const isAndroid = Platform.OS === "android";
		const apiLevel = isAndroid ? (Platform.Version as number) : 31;

		// Rule 1: Enforce Architectural Floor (< API 29)
		if (isAndroid && apiLevel < 29) {
			return "compatibility-static";
		}

		// Attempt Tier 1 (Native / Nitro) \u2014 isEngineReady() is the real check
		if (this.nativeDriver?.isEngineReady()) {
			console.log("[Tr\u00FCbe-Art] [Tier 1] Dispatching Native Path.");
			return "native-vulkan";
		}

		// Attempt Tier 2 (WebGPU)
		if (this.getWebGPUDriver().isSupported) {
			console.log("[Tr\u00FCbe-Art] [Tier 2] Dispatching WebGPU Path.");
			return "webgpu";
		}

		// Default to Tier 3 (Skia)
		console.log("[Tr\u00FCbe-Art] [Tier 3] Dispatching Skia Path.");
		return "skia-runtime-effect";
	}

	public getNativeDriver(): TrubeGPUDriver | null {
		return this.nativeDriver;
	}

	public getWebGPUDriver(): WebGPUDriver {
		if (!this.webgpuDriver) {
			this.webgpuDriver = new WebGPUDriver();
			this.webgpuDriver.onDeviceLost = (reason) =>
				this.triggerGlobalFailover(reason);
		}
		return this.webgpuDriver;
	}

	public getSkiaDriver(): SkiaDriver {
		return this.skiaDriver!;
	}
}

export const driverManager = new DriverManager();
