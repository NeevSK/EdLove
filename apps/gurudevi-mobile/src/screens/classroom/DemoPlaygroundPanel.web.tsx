/**
 * DemoPlaygroundPanel.web.tsx
 *
 * Thin wrapper for the Classroom Demo UI.
 */

import { DemoPlaygroundPanel as PackageDemoPlaygroundPanel } from "@repo/classroom";
import ErrorBoundary from "@repo/ui/components/ErrorBoundary";

const DemoPlaygroundPanel = (props: Record<string, unknown>) => (
	<ErrorBoundary name="Playground Panel">
		{/* biome-ignore lint/suspicious/noExplicitAny: props are passed through to package component */}
		<PackageDemoPlaygroundPanel {...(props as any)} />
	</ErrorBoundary>
);

export default DemoPlaygroundPanel;
