// WelcomeScreen Tests \u2014 grounded in actual component behaviour
import WelcomeScreen from "@repo/ui/screens/WelcomeScreen";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

const mockSignInAnonymously = jest.fn();
jest.mock("@repo/core/api", () => ({
	authAPI: { signInAnonymously: () => mockSignInAnonymously() },
	handleAPIError: jest.fn(),
	supabase: { auth: { getUser: jest.fn() } },
}));
// AuthScreen is rendered inline when Login is pressed \u2014 provide a stub
jest.mock("../../screens/AuthScreen", () => {
	const React = require("react");
	return () => React.createElement("View", { testID: "auth-screen" });
});
jest.mock("../../utils/LanguageUtils", () => ({
	LanguageUtils: { setLanguage: jest.fn().mockResolvedValue(undefined) },
}));
describe("WelcomeScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it("renders the app title and guest CTA", async () => {
		const { getByText } = await render(<WelcomeScreen />);
		// Title is hardcoded, not a translation key
		expect(getByText("Gurudevi")).toBeTruthy();
		// CTA uses the actual key (our t() mock returns the key)
		expect(getByText("welcome.exploreAsGuest")).toBeTruthy();
	});
	it("calls authAPI.signInAnonymously when guest CTA is pressed", async () => {
		mockSignInAnonymously.mockResolvedValue({
			data: { session: {} },
			error: null,
		});
		const mockOnGuest = jest.fn();
		const { getByText } = await render(<WelcomeScreen onGuest={mockOnGuest} />);
		fireEvent.press(getByText("welcome.exploreAsGuest"));
		await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
	});
	it("shows auth screen when Login button is pressed", async () => {
		const { getByText, getByTestId } = await render(<WelcomeScreen />);
		fireEvent.press(getByText("welcome.login"));
		await waitFor(() => expect(getByTestId("auth-screen")).toBeTruthy());
	});
});
