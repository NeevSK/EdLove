import { useTracking } from "@repo/core/hooks";
import { FeatureGuard, usePermissions } from "@repo/core/logic";

import { useEffect } from "react";
import {
	AdminSelfView,
	FounderSelfView,
	GuardianSelfView,
	PrincipalSelfView,
	StudentSelfView,
	TeacherSelfView,
} from "./self";

/**
 * SelfScreen  declarative entry point for the user's sanctuary.
 * Capability-driven (POA) instead of registry-intent based.
 */
export default function SelfScreen() {
	const { discoverFeature } = useTracking();
	const { can, context } = usePermissions();

	useEffect(() => {
		void discoverFeature("section_self");
	}, [discoverFeature]);

	return (
		<FeatureGuard feature="isSelfWorkspaceEnabled">
			{(() => {
				if (can("manage", "FounderDashboard")) {
					return <FounderSelfView />;
				}

				if (can("manage", "AdminDashboard")) {
					return <AdminSelfView />;
				}

				if (can("manage", "PrincipalDashboard")) {
					return <PrincipalSelfView />;
				}

				if (can("manage", "TeacherDashboard")) {
					return <TeacherSelfView />;
				}

				if (
					context.activeBond?.capacity === "guardian" ||
					context.activeBond?.capacity === "parent"
				) {
					return <GuardianSelfView />;
				}

				if (can("manage", "StudentDashboard")) {
					return <StudentSelfView />;
				}

				return <StudentSelfView />;
			})()}
		</FeatureGuard>
	);
}
