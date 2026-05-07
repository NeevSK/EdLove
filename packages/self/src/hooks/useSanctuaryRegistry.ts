import { usePermissions } from "@repo/core/logic";
import { SANCTUARY_DOMAINS, type SelfDomain } from "../constants/selfRegistry";
import React from "react";

/**
 * Hook to resolve available Sanctuary domains based on user traits and bonds.
 * This is the heart of the ReBAC-driven capability discovery.
 */
export function useSanctuaryRegistry() {
	const { context } = usePermissions();
	const traits = context.traits || [];
	const role = context.role ?? context.active_bond?.capacity ?? null;

	const availableDomains = React.useMemo(() => {
		return Object.values(SANCTUARY_DOMAINS).filter((domain) => {
			// If no requirement, it's a base domain (Pulse, Journey, etc.)
			if (!domain.traitRequirement) return true;

			// Check for role-based requirement
			if (domain.traitRequirement.startsWith("role:")) {
				const requiredRole = domain.traitRequirement.split(":")[1];
				return role === requiredRole;
			}

			// Check for specific trait requirement
			return traits.includes(domain.traitRequirement);
		});
	}, [role, traits]);

	return {
		domains: availableDomains,
		isAnonymous: context.is_anonymous,
	};
}
