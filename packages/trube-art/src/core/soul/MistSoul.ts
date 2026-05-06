import { tsl } from "./tsl";

export const MIST_SOUL = (() => {
	const uv = tsl.env.uv();
	const entropy = tsl.env.entropy();
	const time = tsl.mul(
		tsl.env.time(),
		tsl.add(tsl.float(1.0), tsl.mul(entropy, tsl.float(0.012))),
	);

	// 1. Domain Warp for organic fluid motion (Turbid Medium)
	const warpedUV = tsl.warp(tsl.mul(uv, tsl.float(2.0)), tsl.float(0.5));

	// 2. Base Noise for Mist density
	const movement = tsl.vec2(time, tsl.mul(time, tsl.float(0.33)));
	const noise = tsl.fbm(tsl.add(warpedUV, movement), 5);

	// 3. Goethe Color Theory: Color Temperature as Primary Variable
	// Shadow area (~4000K, Warm/Dusty) to Highlight area (~9000K, Cool/Atmospheric)
	const temp = tsl.mix(tsl.float(4500), tsl.float(9500), noise);
	const atmosphericColor = tsl.kelvin(temp);

	// 4. Intensity Modulation
	const finalColor = tsl.mul(atmosphericColor, tsl.env.intensity());

	return finalColor;
})();
