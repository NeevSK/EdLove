import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, FileText, CalendarCheck, NotebookPen } from 'lucide-react-native';
import { PrincipalView } from './types';

interface CommandCenterProps {
    onNavigate: (view: PrincipalView) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const actions = [
        { icon: Users, label: t('principal.actions.hierarchy') || 'Hierarchy', color: 'var(--lotus)', view: 'hierarchy' as PrincipalView },
        { icon: FileText, label: t('principal.actions.invites') || 'Invites', color: 'var(--moss)', view: 'invites' as PrincipalView },
        { icon: CalendarCheck, label: t('principal.actions.timetable') || 'Timetable', color: 'var(--water)', isAgentic: true, view: 'main' as PrincipalView },
        { icon: NotebookPen, label: t('principal.actions.notes') || 'Logbook', color: 'var(--sanctuary-saffron)', view: 'log' as PrincipalView },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>
                Command Center 🏛️
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => !action.isAgentic && onNavigate(action.view)}
                        disabled={action.isAgentic}
                        className="sanctuary-card"
                        style={{ 
                            padding: '16px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: action.isAgentic ? 'not-allowed' : 'pointer', 
                            transition: 'transform 0.2s, background 0.2s', 
                            border: '1px solid var(--border)', 
                            background: 'var(--background-alt)',
                            opacity: action.isAgentic ? 0.6 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ color: action.color, background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '12px' }}>
                            <action.icon size={20} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{action.label}</span>
                        {action.isAgentic && <span style={{ fontSize: '10px', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Coming Soon</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};
