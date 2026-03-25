import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, CalendarOff } from 'lucide-react-native';

interface CalendarEvent {
    id: string;
    title: string;
    type: string;
    start_date: string;
    end_date?: string;
}

interface InstitutionalCalendarProps {
    events: CalendarEvent[];
}

export const InstitutionalCalendar: React.FC<InstitutionalCalendarProps> = ({ events }) => {
    const { t } = useTranslation();

    const getEventColor = (type: string) => {
        switch (type) {
            case 'term_start': return 'var(--lotus)';
            case 'exam': return 'var(--ember)';
            case 'holiday': return 'var(--water)';
            default: return 'var(--ink-ghost)';
        }
    };

    return (
        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--water)', padding: '10px', borderRadius: '12px' }}>
                    <CalendarCheck size={20} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Institutional Calendar</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-ghost)' }}>Events and key dates</p>
                </div>
            </div>

            {events.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '14px' }}>No upcoming events scheduled.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {events.map(event => (
                        <div key={event.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'var(--background-alt)' }}>
                            <div style={{ minWidth: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>{new Date(event.start_date).toLocaleString('default', { month: 'short' })}</span>
                                <span style={{ fontSize: '20px', fontWeight: '900' }}>{new Date(event.start_date).getDate()}</span>
                            </div>
                            <div style={{ width: '2px', height: '30px', background: getEventColor(event.type) }} />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800' }}>{event.title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{event.type.replace('_', ' ')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
