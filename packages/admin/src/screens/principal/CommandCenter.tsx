import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, FileText, CalendarCheck, NotebookPen } from 'lucide-react-native';
import type { PrincipalWorkspaceView } from '../../principal/workspace';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';

interface CommandCenterProps {
    onNavigate: (view: PrincipalWorkspaceView) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const actions = [
        { icon: Users, label: t('principal.ia.actions.hierarchy') || t('principal.actions.hierarchy') || 'School Structure', color: 'var(--lotus)', featureId: 'hierarchy', view: 'hierarchy' as PrincipalWorkspaceView },
        { icon: FileText, label: t('principal.ia.actions.invites') || t('principal.actions.invites') || 'Role Invites', color: 'var(--moss)', featureId: 'invites', view: 'invites' as PrincipalWorkspaceView },
        { icon: CalendarCheck, label: t('principal.ia.actions.timetable') || 'Timetable Planning', color: 'var(--water)', featureId: 'timetable', isAgentic: true, view: 'main' as PrincipalWorkspaceView },
        { icon: NotebookPen, label: t('principal.ia.actions.logbook') || t('principal.actions.notes') || 'Leadership Logbook', color: 'var(--sanctuary-saffron)', featureId: 'log', view: 'log' as PrincipalWorkspaceView },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>
                Command Center \uD83C\uDFDB\uFE0F
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {actions.map((action, i) => (
                    <button>
                        key={i}
                        onClick={() => !action.isAgentic && onNavigate(action.view)}
                        disabled={action.isAgentic}
                        title={getPrincipalFeatureScopeMeta(action.featureId) ? t(getPrincipalFeatureScopeMeta(action.featureId)!.scopeHelpTextKey) : ''}
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
                    
                        <div style={{ color: action.color, background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '12px' }}>
                            <action.icon size={20} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{action.label}</span                        >{getPrincipalFeatureScopeMeta(action.featureId) && (
                            <span>
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.4px',
                                    color: 'var(--ink-ghost)',
                                    background: 'var(--background)',
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                }}
                                                            {t(getPrincipalFeatureScopeMeta(action.featureId)!.scopeBadgeLabelKey)}
                            </span                        >)}
                        {action.isAgentic && <span style={{ fontSize: '10px', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Coming Soon</span>}
                    </button                >))}
            </div>
        </div>
    );
};

export type { CommandCenterProps };
