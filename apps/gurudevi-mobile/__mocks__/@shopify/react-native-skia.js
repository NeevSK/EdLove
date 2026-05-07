// Manual mock for @shopify/react-native-skia (ESM + Skia C++ native build)
const React = require("react");
const ReactNative = require("react-native");
const View = (p) => React.createElement(ReactNative.View, p);
const noop = () => null;
module.exports = {
	Canvas: View,
	Rect: noop,
	Circle: noop,
	Path: noop,
	Line: noop,
	Fill: noop,
	Group: View,
	Paint: noop,
	RadialGradient: noop,
	LinearGradient: noop,
	Blur: noop,
	Shadow: noop,
	Image: noop,
	Text: noop,
	useImage: jest.fn(() => null),
	useFont: jest.fn(() => null),
	useCanvasRef: jest.fn(() => ({ current: null })),
	useTouchHandler: jest.fn(() => jest.fn()),
	Skia: { Paint: jest.fn(), Path: jest.fn() },
};
