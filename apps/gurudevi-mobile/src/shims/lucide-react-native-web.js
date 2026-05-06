/* eslint-disable */
/**
 * Lucide React Native Shim for Web
 *
 * Provides a self-healing proxy for lucide-react-native icons.
 * This prevents crashes when an icon is imported but the package is not correctly resolved.
 */
const _React = require("react");
const _bridge = require("./universal-bridge");

// Generic placeholder icon if the proxy fails or needs a base
const GenericIcon = (props) => {
	const { size = 24, color = "currentColor", strokeWidth = 2, ...rest } = props;
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...rest}
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="12" />
			<line x1="12" y1="16" x2="12.01" y2="16" />
		</svg>
	);
};

// Explicitly defined icons for performance/correctness
const MOCKED_ICONS = {
	default: GenericIcon,
	User: GenericIcon,
	School: GenericIcon,
	Heart: GenericIcon,
	Users: GenericIcon,
	Library: GenericIcon,
	Bell: GenericIcon,
	X: GenericIcon, // Added X as it's a common cause of crashes in TabNavigator
};

// Create a specialized proxy that is itself a component (a function)
const IconProxy = new Proxy(GenericIcon, {
	get: (target, prop) => {
		if (prop === "__esModule") return true;

		// Handle common React/Babel interop properties
		if (prop === "default") return GenericIcon;
		if (prop === "$$typeof") return undefined;
		if (prop === "displayName") return "LucideIconShim";

		if (typeof prop === "symbol") return target[prop];

		// If the icon is explicitly mocked in our list, return it.
		if (MOCKED_ICONS[prop]) return MOCKED_ICONS[prop];

		// If the property exists on the function itself (like 'prototype'), return it.
		if (prop in target) return target[prop];

		// SELF-HEALING: Return the GenericIcon component for ANY missing icon request.
		return GenericIcon;
	},
});

// Support both CJS and ESM interop
module.exports = IconProxy;
module.exports.default = IconProxy;
module.exports.__esModule = true;
