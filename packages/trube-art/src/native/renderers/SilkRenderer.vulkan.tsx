import { SILK_SOUL } from "../../core/soul/SilkSoul";
import type { TrubeRendererProps } from "../renderers/types";
import { NativeSubstrateRenderer } from "./NativeSubstrateRenderer";

export function SilkRendererVulkan(props: TrubeRendererProps) {
	return <NativeSubstrateRenderer {...props} soul={SILK_SOUL} />;
}
