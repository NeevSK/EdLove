import React from 'react';
import { Plus, ScanLine } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core';
import { Box, Button, ButtonText, Theme } from '@repo/ui';

export function TeacherPrimaryActions({ onCreateClassroom }: { onCreateClassroom: () => void }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <FeatureGuard action="create" subject="Classroom">
                <Button 
                    action="primary"
                    onPress={onCreateClassroom}
                    sx={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 8, 
                        backgroundColor: 'var(--sanctuary-saffron)',
                        borderRadius: Theme.corners.comfortable
                    }}
                >
                    <Plus size={18} color="white" />
                    <ButtonText sx={{ color: 'white' }}>Create Classroom</ButtonText>
                </Button>
            </FeatureGuard>
            <FeatureGuard action="read" subject="Classroom">
                <Button 
                    variant="outline" 
                    action="secondary"
                    sx={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 8,
                        borderRadius: Theme.corners.comfortable
                    }}
                >
                    <ScanLine size={18} />
                    <ButtonText>Scan QR</ButtonText>
                </Button>
            </FeatureGuard>
        </Box>
    );
}
