/* eslint-disable */
/**
 * Lucide React Native Shim for Web
 *
 * Provides a self-healing, intelligent proxy for lucide-react-native icons.
 * This approach is highly resilient as it automatically maps ANY icon name
 * to its web-equivalent in 'lucide-react' without manual mapping.
 */
const _React = require("react");

// Try to load the real lucide-react package
let LucideWeb = null;
try {
	LucideWeb = require("lucide-react");
} catch (e) {
	// Silent fallback to maintain a clean console as requested
}

/**
 * Lotus Fallback Icon
 * Instead of a warning '!', we use the brand-aligned Lotus emoji.
 */
const LotusFallback = (props) => {
	const { size = 24, ...rest } = props;
	return (
		<span
			style={{
				fontSize: `${size}px`,
				lineHeight: 1,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: size,
				height: size,
			}}
			{...rest}
		>
			🪷
		</span>
	);
};

/**
 * The Intelligent Proxy
 * This is the "Brain" of the shim. It intercepts ALL property access on the module.
 * If you import { Heart } or { UserIcon } from 'lucide-react-native',
 * this proxy automatically resolves them.
 */
const IconProxy = new Proxy(LotusFallback, {
	get: (target, prop) => {
		// 1. Handle Module/React Interop
		if (prop === "__esModule") return true;
		if (prop === "default") return LucideWeb ? (LucideWeb.default || LucideWeb) : LotusFallback;
		if (prop === "$$typeof") return undefined;
		if (prop === "displayName") return "LucideIconShim";
		if (typeof prop === "symbol") return target[prop];

		// 2. Automatic Mapping
		// Since lucide-react and lucide-react-native share naming conventions (PascalCase),
		// we can resolve any icon dynamically.
		if (LucideWeb) {
			// Try the exact name (e.g. 'Heart')
			if (LucideWeb[prop]) return LucideWeb[prop];

			// Try adding 'Icon' suffix if missing (e.g. 'HeartIcon' -> 'Heart')
			const cleanName = prop.replace(/Icon$/, "");
			if (LucideWeb[cleanName]) return LucideWeb[cleanName];
			
			// Try removing 'Icon' suffix if present (e.g. 'Heart' -> 'HeartIcon')
			const iconName = `${prop}Icon`;
			if (LucideWeb[iconName]) return LucideWeb[iconName];
		}

		// 3. Resilience Fallback
		// If the icon isn't found in the library, we return the brand-aligned Lotus
		// instead of a warning symbol or crashing.
		return LotusFallback;
	},
});

// Export the proxy as the module itself
module.exports = IconProxy;
module.exports.default = IconProxy;
module.exports.__esModule = true;



