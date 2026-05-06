import type { TrubeStageLayer, TrubeStageSpec } from "./types";

export function stage(
	layers: TrubeStageLayer[],
	background?: string,
): TrubeStageSpec {
	return {
		kind: "trube-stage",
		background,
		layers,
	};
}
