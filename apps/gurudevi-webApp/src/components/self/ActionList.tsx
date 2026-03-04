import React from 'react';
import PulseActionItem from './PulseActionItem';

const ACTIONS = [
    { title: 'Morning Flow', time: '07:30 AM', status: 'completed' },
    { title: 'Mid-Day Resonance', time: '12:45 PM', status: 'pending' },
    { title: 'Evening Wind-down', time: '08:00 PM', status: 'pending' },
];

const ActionList: React.FC = () => {
    return (
        <section className="space-y-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest px-1">Today's Pulse</h3>
            <div className="space-y-3">
                {ACTIONS.map((action, index) => (
                    <PulseActionItem
                        key={index}
                        title={action.title}
                        time={action.time}
                        status={action.status as any}
                    />
                ))}
            </div>
        </section>
    );
};

export default ActionList;
