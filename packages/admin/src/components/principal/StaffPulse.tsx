import React from 'react';
import { StaffPresencePulse } from '@repo/people';

interface StaffPulseProps {
    userId: string;
    schoolId: string;
}

export const StaffPulse: React.FC<StaffPulseProps> = ({ userId, schoolId }) => {
    return <StaffPresencePulse userId={userId} schoolId={schoolId} />;
};

export default StaffPulse;
