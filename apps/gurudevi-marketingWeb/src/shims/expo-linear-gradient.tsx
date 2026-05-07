import React, {
	type CSSProperties,
	type ForwardedRef,
	type PropsWithChildren,
} from "react";

type ShimProps = PropsWithChildren<{
	className?: string;
	style?: CSSProperties;
}>;

export type LinearGradientProps = ShimProps & Record<string, unknown>;

export function LinearGradient({
	children,
	className,
	style,
	ref,
	...rest
}: LinearGradientProps & { ref?: ForwardedRef<HTMLDivElement> }) {
	return React.createElement(
		"div",
		{ ...rest, ref, className, style },
		children,
	);
}

LinearGradient.displayName = "LinearGradient";

export default LinearGradient;
