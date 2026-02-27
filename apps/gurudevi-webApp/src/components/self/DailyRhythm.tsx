import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const RHYTHMS = [
    { id: 'morning_breath', label: 'Morning Breath', time: '07:00 AM' },
    { id: 'gratitude_check', label: 'Gratitude Check', time: '10:00 AM' },
    { id: 'mindful_walk', label: 'Mindful Walk', time: '01:00 PM' },
    { id: 'wind_down', label: 'Wind Down Ritual', time: '09:00 PM' },
];

const DailyRhythm: React.FC = () => {
    const [completed, setCompleted] = React.useState<string[]>([]);

    const toggleTask = (id: string) => {
        setCompleted(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Daily Rhythm</h3>
                <p className="text-gray-400 text-sm">Align your day with peaceful habits.</p>
            </div>

            <div className="space-y-3">
                {RHYTHMS.map((rhythm) => (
                    <button
                        key={rhythm.id}
                        onClick={() => toggleTask(rhythm.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${completed.includes(rhythm.id)
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex flex-col items-start space-y-1">
                            <span className={`font-semibold ${completed.includes(rhythm.id) ? 'line-through opacity-50' : ''}`}>
                                {rhythm.label}
                            </span>
                            <span className="text-[10px] opacity-70 uppercase tracking-wider">{rhythm.time}</span>
                        </div>

                        {completed.includes(rhythm.id) ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <Circle className="w-5 h-5 opacity-30" />
                        )}
                    </button>
                ))}
            </div>

            <div className="pt-4 border-t border-gray-700/30">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium px-1">
                    <span>{completed.length} of {RHYTHMS.length} Completed</span>
                    <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-700"
                            style={{ width: `${(completed.length / RHYTHMS.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyRhythm;
