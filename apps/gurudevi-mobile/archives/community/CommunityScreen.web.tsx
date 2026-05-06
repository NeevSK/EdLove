import { CommunityScreenWeb } from "@repo/community";
import { ErrorBoundary } from "@repo/ui";

/**
 * Architecturally Elegant Thin Wrapper for The Commons (Community)
 * Centralizes the social and mission logic within the @repo/community package.
 */
export default function AppCommunityScreen() {
	return (
		<ErrorBoundary
			name="CommunityScreen"
			fallback={
				<div style={{ padding: 40, textAlign: "center" }}>
					Failed to load The Commons. Please refresh.
				</div>
			}
		>
			<CommunityScreenWeb />
		</ErrorBoundary>
	);
}
