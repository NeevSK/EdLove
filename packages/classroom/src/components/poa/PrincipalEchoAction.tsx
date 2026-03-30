import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react-native';

export function PrincipalEchoAction() {
    const { t } = useTranslation();
    return (
        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--ember)', color: 'var(--ember)' }}            <MessageCircle size={18} /            {t('teacher.actions.principalEcho') || 'Principal Echo'}
        </button    );
}
