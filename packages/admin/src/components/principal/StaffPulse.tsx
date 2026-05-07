import { StaffPresencePulse } from "@repo/people";
import type React from "react";

interface StaffPulseProps {
	userId: string;
	schoolId: string;
}

export const StaffPulse: React.FC<StaffPulseProps> = ({ userId, schoolId }) => {
	return <StaffPresencePulse userId={userId} schoolId={schoolId} />;
};

export default StaffPulse;
