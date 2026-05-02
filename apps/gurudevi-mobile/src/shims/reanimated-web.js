/* eslint-disable */
/**
 * Self-Healing Web Shim for react-native-reanimated
 *
 * Uses the Universal Bridge (CJS) to prevent crashes on missing properties like .experiment
 * by allowing the Proxy to fulfill any named import at runtime.
 */
const { useRef } = require("react");
const bridge = require("./universal-bridge");

const useSharedValue = (initialValue) => {
	const ref = useRef(initialValue);
	return {
		get value() {
			return ref.current;
		},
		set value(v) {
			ref.current = v;
		},
	};
};

const useAnimatedStyle = (updater) => {
	return updater();
};

const useAnimatedProps = (updater) => {
	return updater();
};

const useDerivedValue = (updater) => {
	return { value: updater() };
};

const Easing = {
	linear: (t) => t,
	ease: (t) => t,
	quad: (t) => t,
	cubic: (t) => t,
	poly: () => (t) => t,
	sin: (t) => t,
	circle: (t) => t,
	exp: (t) => t,
	elastic: () => (t) => t,
	back: () => (t) => t,
	bounce: (t) => t,
	bezier: () => (t) => t,
	in: (f) => f,
	out: (f) => f,
	inOut: (f) => f,
};

const Animated = {
	View: "div",
	Text: "span",
	ScrollView: "div",
	Image: "img",
	createAnimatedComponent: (Component) => Component,
};

// Create the self-healing bridge with explicitly defined base mocks
const reanimatedShim = bridge("react-native-reanimated", {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedProps,
	useDerivedValue,
	useAnimatedScrollHandler: () => () => {},
	useAnimatedGestureHandler: () => () => {},
	withTiming: (toValue, _userConfig, callback) => {
		if (callback) callback(true);
		return toValue;
	},
	withSpring: (toValue, _userConfig, callback) => {
		if (callback) callback(true);
		return toValue;
	},
	withRepeat: (animation) => animation,
	withSequence: (...animations) => animations[0],
	withDelay: (_delay, animation) => animation,
	runOnJS: (fn) => fn,
	runOnUI: (fn) => fn,
	makeMutable: (value) => ({ value }),
	interpolate: (_value, _input, output) => output[0],
	Extrapolate: { CLAMP: "clamp", IDENTITY: "identity", EXTEND: "extend" },
	Animated,
	Easing,
	// The experiment prop will now be caught by the Proxy at runtime!
});

// Final robust Proxy-based export for reanimated-web.js
const handler = {
	get(target, prop) {
		if (prop === "__esModule") return true;
		if (prop === "default") return module.exports;
		if (prop in target) return target[prop];
		// catch-all: return a no-op proxy for ANYTHING including 'experiment'
		return new Proxy(() => {}, {
			get(_, _p) {
				return () => {};
			},
			apply() {
				return undefined;
			},
		});
	},
};

module.exports = new Proxy(reanimatedShim, handler);
module.exports.__esModule = true;
module.exports.default = module.exports;
module.exports.experiment = {}; // explicit  belt AND suspenders
