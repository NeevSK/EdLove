import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions, useStore } from '@repo/core';

export interface WebScreenHeaderProps {
    title?: React.ReactNode;
    note?: string;
    timeText?: string;
    actions?: React.ReactNode;
    showPersonalizedGreeting?: boolean;
}

/**
 * WebScreenHeader - Standardized greeting section for Web screens.
 * Uses CSS classes defined in SanctuaryGlobalStyles.
 */
export const WebScreenHeader: React.FC<WebScreenHeaderProps> = ({
    title,
    note,
    timeText,
    actions,
    showPersonalizedGreeting
}) => {
    const { t } = useTranslation();
    const { context, can } = usePermissions();
    const { roles } = context;
    const { user } = useStore();

    // Determine greeting based on time of day (DRY from GlobalHeader)
    const getGreetingDetails = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: t('goodMorning'), emoji: '\uD83C\uDF05' };
        if (hour < 18) return { text: t('goodAfternoon'), emoji: '\u2600\uFE0F' };
        return { text: t('goodEvening'), emoji: '\uD83C\uDFEE' };
    };

    const { text: greetingText, emoji } = getGreetingDetails();

    // Determine personalized greeting if requested
    let displayTimeText = timeText || greetingText;
    if (showPersonalizedGreeting) {
        const userName = (user as any)?.user_metadata?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || '';
        const roleLabel = roles[0] ? roles[0].charAt(0).toUpperCase() + roles[0].slice(1) : '';
        
        if (can('manage', 'TeacherDashboard') || can('manage', 'PrincipalDashboard')) {
            displayTimeText = `${greetingText}, ${roleLabel}`;
        } else {
            displayTimeText = `${greetingText}, ${userName}`;
        }
    }

    return (
        <header 
            className="greeting" 
            role="banner"
            style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            flexWrap: 'wrap', 
            gap: '16px' 
        }}
            <div aria-live="polite" aria-atomic="true"
                <div className="greeting-time" aria-label={`${displayTimeText} ${emoji}`}
                    {displayTimeText} {emoji}
                </div
                <h1 className="greeting-main">{title}</h1
                {note && <p className="greeting-note">{note}</p>}
            </div
            {actions && (
                <nav aria-label="Header Actions" style={{ display: 'flex', gap: '10px', paddingBottom: '4px' }}
                    {actions}
                </nav
            )}
        </header
    );
};
