// Manual mock for @sentry/react-native (ESM + native SDK)
module.exports = {
	init: jest.fn(),
	captureException: jest.fn(),
	captureMessage: jest.fn(),
	addBreadcrumb: jest.fn(),
	setUser: jest.fn(),
	setTag: jest.fn(),
	setContext: jest.fn(),
	withScope: jest.fn((fn) => fn({ setTag: jest.fn() })),
	wrap: jest.fn((C) => C),
	ReactNativeTracing: jest.fn(),
	ReactNavigationInstrumentation: jest.fn(),
};
