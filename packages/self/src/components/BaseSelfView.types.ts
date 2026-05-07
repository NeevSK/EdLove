import type { TemporalScale } from "@repo/core/store";
import type React from "react";

export interface SelfViewFeature {
	id: string;
	label: string;
	content: React.ReactNode;
	historyContent?: React.ReactNode;
	icon?: string;
	category?: string;
	summary?: string;
	historySummary?: string;
	supportedScales?: TemporalScale[];
	domainColor?: string;
	domainId?: string;
	energyVibe?: [string, string];
	timing?: {
		preferredPhase?: "morning" | "afternoon" | "night";
	};
}

export interface SelfViewDomain {
	id: string;
	title: string;
	accentColor: string;
	features?: SelfViewFeature[];
	content?: React.ReactNode;
	historyContent?: React.ReactNode;
	description?: string;
	supportedScales?: TemporalScale[];
}

export interface BaseSelfViewProps {
	perspective: "student" | "teacher" | "principal" | "guardian" | "founder" | "admin" | "wanderer";
	title?: string;
	description?: string;
	domains: SelfViewDomain[];
	sideBar?: React.ReactNode;
	reminders?: React.ReactNode;
	morningRitual?: React.ReactNode;
	nightRitual?: React.ReactNode;
	voiceJournal?: React.ReactNode;
}
