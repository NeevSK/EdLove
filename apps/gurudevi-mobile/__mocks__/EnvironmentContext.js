// Manual mock for EnvironmentContext  provides a working context without native deps.
const React = require("react");

const defaultEnv = {
	theme: "light",
	isDark: false,
	colors: {
		background: "#fff",
		surface: "#f8f8f8",
		surfaceElevated: "#f0f0f0",
		text: "#1a1a1a",
		textSecondary: "#666",
		textTertiary: "#999",
		primary: "#D4AF37",
		action: "#D4AF37",
		border: "#eee",
		error: "#ff4444",
	},
	temporalPhase: "morning",
	deviceTier: "standard",
	networkQuality: "good",
	isOnline: true,
	language: "en",
};

const EnvironmentContext = React.createContext(defaultEnv);

function EnvironmentProvider({ children }) {
	return React.createElement(
		EnvironmentContext.Provider,
		{ value: defaultEnv },
		children,
	);
}

function useEnvironment() {
	return React.useContext(EnvironmentContext);
}

function getTemporalPhase() {
	return "morning";
}
function shouldUseDarkTheme() {
	return false;
}

module.exports = {
	EnvironmentContext,
	EnvironmentProvider,
	useEnvironment,
	getTemporalPhase,
	shouldUseDarkTheme,
};
