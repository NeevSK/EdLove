import type { DomainFeature } from "@repo/core/types";

export const COMMUNITY_REGISTRY: Record<string, DomainFeature> = {
	hearth: {
		id: "hearth",
		surfaceId: "hearth",
		workspaceId: "community-sanctuary",
		capabilityKey: "CommunityFeed",
		ownerPackage: "community",
		defaultZone: "work",
		defaultOrder: 50,
		label: "The Hearth",
		description: "The central gathering place for community updates",
		citizenshipRequired: 0, // Wanderers can see public hearths
		mobileSupport: true,
		webSupport: true,
	},
	circles: {
		id: "circles",
		surfaceId: "joined-circles",
		workspaceId: "community-sanctuary",
		capabilityKey: "CommunityGroups",
		ownerPackage: "community",
		defaultZone: "today",
		defaultOrder: 20,
		label: "Circles of Trust",
		description: "Private groups and interest-based circles",
		citizenshipRequired: 1, // 2nd Class (Cloud storage required for social)
		mobileSupport: true,
		webSupport: true,
	},
	messages: {
		id: "messages",
		surfaceId: "context-messages",
		workspaceId: "community-sanctuary",
		capabilityKey: "DirectMessages",
		ownerPackage: "community",
		defaultZone: "outlook",
		defaultOrder: 120,
		label: "Direct Messages",
		description: "Secure one-to-one and small group communication",
		citizenshipRequired: 1, // Requires identity binding
		mobileSupport: true,
		webSupport: true,
	},
	trust_network: {
		id: "trust",
		surfaceId: "trust",
		workspaceId: "community-sanctuary",
		capabilityKey: "TrustNetwork",
		ownerPackage: "community",
		defaultZone: "today",
		defaultOrder: 30,
		label: "Trust Network",
		description: "Reputation and vouching system",
		citizenshipRequired: 2, // 1st Class (Institutional/Vouched only)
		isPro: true,
		webSupport: true,
	},
};
