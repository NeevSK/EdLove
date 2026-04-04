import React from 'react';
import { FeatureGuard } from '@repo/core';
import { Box, Text } from '@repo/ui';
import { Plus, QrCode, MessageSquare, History } from 'lucide-react-native';

interface ActionProps {
    onCreateClassroom?: () => void;
}

export const TeacherCreateClassroomAction: React.FC<ActionProps> = ({ onCreateClassroom }) => (
    <FeatureGuard action="create" subject="Classroom">
        <Box 
            as="button" 
            onClick={onCreateClassroom}
            sx={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                padding: '8px 16px', 
                borderRadius: 8, 
                backgroundColor: '$primary',
                color: 'white'
            }}
        >
            <Plus size={16} /> <Text>Create Sanctuary</Text>
        </Box>
    </FeatureGuard>
);

export const TeacherScanQRAction: React.FC = () => (
    <FeatureGuard action="manage" subject="Attendance">
        <Box 
            as="button" 
            sx={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                padding: '8px 16px', 
                borderRadius: 8, 
                backgroundColor: '$surface',
                borderWidth: 1,
                borderColor: '$border'
            }}
        >
            <QrCode size={16} /> <Text>Scan Resonance</Text>
        </Box>
    </FeatureGuard>
);

export const TeacherPrincipalEchoAction: React.FC = () => (
    <FeatureGuard action="read" subject="Announcement">
        <Box 
            as="button" 
            sx={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                padding: '8px 16px', 
                borderRadius: 8, 
                backgroundColor: '$surface',
                borderWidth: 1,
                borderColor: '$border'
            }}
        >
            <MessageSquare size={16} /> <Text>Principal's Echo</Text>
        </Box>
    </FeatureGuard>
);

export const TeacherMyEchoesAction: React.FC = () => (
    <FeatureGuard action="manage" subject="Announcement">
        <Box 
            as="button" 
            sx={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                padding: '8px 16px', 
                borderRadius: 8, 
                backgroundColor: '$surface',
                borderWidth: 1,
                borderColor: '$border'
            }}
        >
            <History size={16} /> <Text>My Echoes</Text>
        </Box>
    </FeatureGuard>
);
