import React from 'react';
import { FeatureGuard } from '@repo/core';
import { Box, Text, HStack, Icon, hapticLight } from '@repo/ui';
import { Plus, QrCode, MessageSquare, History } from 'lucide-react-native';

interface ActionProps {
    onCreateClassroom?: () => void;
}

export const TeacherCreateClassroomAction: React.FC<ActionProps> = ({ onCreateClassroom }) => (
    <FeatureGuard action="create" subject="Classroom">
        <Box 
            as="button" 
            onClick={() => { hapticLight(); onCreateClassroom?.(); }}
            className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuarySaffron shadow-sm active:opacity-85"
        >
            <Icon as={Plus} size="sm" className="text-sacredWhite" />
            <Text className="text-sacredWhite font-black uppercase text-[10px] tracking-[0.2em]">Create Sanctuary</Text>
        </Box>
    </FeatureGuard>
);

export const TeacherScanQRAction: React.FC = () => (
    <FeatureGuard action="manage" subject="Attendance">
        <Box 
            as="button" 
            onClick={hapticLight}
            className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
        >
            <Icon as={QrCode} size="sm" className="text-sanctuary-text" />
            <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">Scan Resonance</Text>
        </Box>
    </FeatureGuard>
);

export const TeacherPrincipalEchoAction: React.FC = () => (
    <FeatureGuard action="read" subject="Announcement">
        <Box 
            as="button" 
            onClick={hapticLight}
            className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
        >
            <Icon as={MessageSquare} size="sm" className="text-sanctuary-text" />
            <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">Principal's Echo</Text>
        </Box>
    </FeatureGuard>
);

export const TeacherMyEchoesAction: React.FC = () => (
    <FeatureGuard action="manage" subject="Announcement">
        <Box 
            as="button" 
            onClick={hapticLight}
            className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
        >
            <Icon as={History} size="sm" className="text-sanctuary-text" />
            <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">My Echoes</Text>
        </Box>
    </FeatureGuard>
);
