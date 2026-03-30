import React from 'react';
import { FeatureGuard } from '@repo/core';
import { Box } from '@repo/ui';
import { Plus, QrCode, MessageSquare, History } from 'lucide-react-native';

interface ActionProps {
    onCreateClassroom?: () => void;
}

export const TeacherCreateClassroomAction: React.FC<ActionProps> = ({ onCreateClassroom }) => (
    <FeatureGuard action="create" subject="Classroom"        <Box 
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
                    <Plus size={16} /> Create Sanctuary
        </Box    </FeatureGuard);

export const TeacherScanQRAction: React.FC = () => (
    <FeatureGuard action="manage" subject="Attendance"        <Box 
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
                    <QrCode size={16} /> Scan Resonance
        </Box    </FeatureGuard);

export const TeacherPrincipalEchoAction: React.FC = () => (
    <FeatureGuard action="read" subject="Announcement"        <Box 
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
                    <MessageSquare size={16} /> Principal's Echo
        </Box    </FeatureGuard);

export const TeacherMyEchoesAction: React.FC = () => (
    <FeatureGuard action="manage" subject="Announcement"        <Box 
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
                    <History size={16} /> My Echoes
        </Box    </FeatureGuard);
