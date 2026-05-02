import { resolvePhaseTokens } from "../packages/ui/src/theme/Theme.ts";
import { checkAccessibility } from "../packages/ui/src/utils/a11yUtils.ts";

const args = process.argv.slice(2);
const fg = args[0];
const bg = args[1];

if (fg && bg) {
	const result = checkAccessibility(fg, bg);
	console.log(JSON.stringify(result, null, 2));
} else {
	// Basic audit of a phase
	const phase = args[0] || "morning";
	const isDark = args[1] === "dark";
	const tokens = resolvePhaseTokens(phase, isDark);

	const report = {
		phase,
		isDark,
		check: "Accent on BG",
		results: [
			{
				name: "On World",
				...checkAccessibility(tokens.text.onWorld, tokens.scene.world.bg),
			},
			{
				name: "On Surface",
				...checkAccessibility(tokens.text.onSurface, tokens.scene.surface.bg),
			},
			{
				name: "On Accent",
				...checkAccessibility(tokens.text.onAccent, tokens.accent.action),
			},
		],
	};
	console.log(JSON.stringify(report, null, 2));
}
