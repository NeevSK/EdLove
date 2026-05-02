/** Native stub — Metro resolves WebSkeleton.web.tsx on web builds. */
import type React from "react";

export const WebSkeleton: React.FC<{
	width?: string | number;
	height?: string | number;
	borderRadius?: string | number;
	variant?: "rect" | "circle" | "text";
	className?: string;
	style?: React.CSSProperties;
}> = () => null;

export default WebSkeleton;
