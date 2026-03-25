import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ClipboardList } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core';

export function TeacherEchoActions() {
    const { t } = useTranslation();
    
    return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <FeatureGuard action="read" subject="School">
                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--ember)', color: 'var(--ember)' }}>
                    <MessageCircle size={18} />
                    {t('teacher.actions.principalEcho') || 'Principal Echo'}
                </button>
            </FeatureGuard>
            <FeatureGuard action="read" subject="School">
                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={18} />
                    My Echoes
                </button>
            </FeatureGuard>
        </div>
    );
}
