import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ClipboardList } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core';
import { Box, Button, ButtonText, Theme } from '@repo/ui';

export function TeacherEchoActions() {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <FeatureGuard action="read" subject="School">
                <Button 
                    variant="outline" 
                    action="secondary"
                    sx={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 8, 
                        borderColor: 'var(--ember)',
                        borderRadius: Theme.corners.comfortable
                    }}
                >
                    <MessageCircle size={18} color="var(--ember)" />
                    <ButtonText sx={{ color: 'var(--ember)' }}>
                        {t('teacher.actions.principalEcho') || 'Principal Echo'}
                    </ButtonText>
                </Button>
            </FeatureGuard>
            <FeatureGuard action="read" subject="School">
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
                    <ClipboardList size={18} />
                    <ButtonText>My Echoes</ButtonText>
                </Button>
            </FeatureGuard>
        </Box>
    );
}
