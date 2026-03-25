import React from 'react';
import { BookOpen, MessageSquare, Star, Layout, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const StudentStudySuite = () => {
    const navigation = useNavigation<any>();

    const items = [
        { label: 'Library', icon: BookOpen, color: 'var(--amber-glow)', onClick: () => navigation.navigate('Main', { screen: 'Library' }) },
        { label: 'Community', icon: MessageSquare, color: 'var(--gurudevi-blue)', onClick: () => navigation.navigate('Main', { screen: 'Community' }) },
        { label: 'Rewards', icon: Star, color: 'var(--sanctuary-saffron)', onClick: () => { } },
        { label: 'Timetable', icon: Layout, color: 'var(--moss)', onClick: () => navigation.navigate('Timetable', {}) },
        { label: 'Self Reflection', icon: TrendingUp, color: 'var(--water)', onClick: () => navigation.navigate('Main', { screen: 'Self' }) },
    ];

    return (
        <div className="sanctuary-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Study Suite</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, i) => (
                    <div 
                        key={i} 
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer' }} 
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--background-alt)')} 
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')} 
                        onClick={item.onClick}
                    >
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <item.icon size={16} color={item.color} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.label}</span>
                        <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.2 }} />
                    </div>
                ))}
            </div>
        </div>
    );
};
