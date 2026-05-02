/** Native stub — Metro resolves SanctuaryTabBar.web.tsx on web builds. */
import type React from "react";

export interface SanctuaryTab<T extends string = string> {
	id: T;
	icon: React.ComponentType<{ size?: number; color?: string }>;
	label: string;
	activeColor?: string;
	activeTextColor?: string;
}

export function SanctuaryTabBar<T extends string>(_props: {
	tabs: SanctuaryTab<T>[];
	activeId: T;
	onSelect: (id: T) => void;
	style?: React.CSSProperties;
}) {
	return null;
}
