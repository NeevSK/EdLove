/**
 * InviteCodeEntry.tsx
 *
 * Thin wrapper for the Invite Code entry UI.
 */

import { InviteCodeEntry as PackageInviteCodeEntry } from "@repo/community";
import ErrorBoundary from "@repo/ui/components/ErrorBoundary";

const InviteCodeWrapper = (props: Record<string, unknown>) => (
	<ErrorBoundary name="Enter Invitation Code">
		{/* biome-ignore lint/suspicious/noExplicitAny: props are passed through to package component */}
		<PackageInviteCodeEntry {...(props as any)} />
	</ErrorBoundary>
);

export default InviteCodeWrapper;
