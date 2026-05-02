import { EVENING_SKY_SOUL } from "../../core/soul/EveningSkySoul";
import type { TrubeRendererProps } from "../renderers/types";
import { NativeSubstrateRenderer } from "./NativeSubstrateRenderer";

export function EveningSkyRendererVulkan(props: TrubeRendererProps) {
	return <NativeSubstrateRenderer {...props} soul={EVENING_SKY_SOUL} />;
}
