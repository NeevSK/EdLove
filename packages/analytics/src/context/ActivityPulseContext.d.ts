import type React from "react";
interface ActivityPulseState {
	pulse: number;
	lastEventTime: number;
	intensity: number;
}
interface ActivityPulseContextType {
	state: ActivityPulseState;
	registerPulse: (strength?: number) => void;
}
export declare const ActivityPulseProvider: React.FC<{
	children: React.ReactNode;
}>;
export declare const useActivityPulse: () => ActivityPulseContextType;
//# sourceMappingURL=ActivityPulseContext.d.ts.map
