import { tsl } from "./tsl";

export const YOUNG_LEAF_SOUL = (() => {
	const uv = tsl.env.uv();
	const entropy = tsl.env.entropy();
	const time = tsl.mul(
		tsl.env.time(),
		tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.008))),
	);

	// 1. Domain warping for organic "leaf" structure
	const warpedUV = tsl.warp(uv, tsl.float(0.8));
	const noise = tsl.fbm(tsl.add(warpedUV, tsl.vec2(time, tsl.float(0))), 4);

	// 2. Procedural Veins
	const x = tsl.member(uv, "x", "float");
	const y = tsl.member(uv, "y", "float");

	const vein1 = tsl.abs(
		tsl.sub(
			x,
			tsl.add(
				tsl.float(0.18),
				tsl.mul(tsl.float(0.02), tsl.sin(tsl.mul(y, tsl.float(10.0)))),
			),
		),
	);
	const vein1Width = tsl.smoothstep(tsl.float(0.01), tsl.float(0.0), vein1);

	// 3. Subsurface scattering (Goethe's Deeds of Light)
	const _scattering = tsl.smoothstep(tsl.float(0.3), tsl.float(0.8), noise);

	// 4. Color Temperature Shift (Young Leaf: 3000K to 6500K)
	const temp = tsl.mix(tsl.float(3000), tsl.float(6500), noise);
	const leafColor = tsl.kelvin(temp);

	// 5. Veins integration
	const finalColor = tsl.mix(
		leafColor,
		tsl.env.highlight(),
		tsl.mul(vein1Width, tsl.float(0.2)),
	);

	return tsl.mul(finalColor, tsl.env.intensity());
})();
