import React, { useState } from 'react';
import { Moon, Sparkles, CheckCircle, Circle } from 'lucide-react';

const EVENING_RITUALS = [
    { id: 'screen_off', label: 'Screens Off', duration: '30m before' },
    { id: 'reflection', label: 'Journaling', duration: '10m' },
    { id: 'breathing', label: 'Deep Breathing', duration: '5m' },
    { id: 'reading', label: 'Read a Book', duration: '15m' },
];

const WindDown: React.FC = () => {
    const [completed, setCompleted] = useState<string[]>([]);

    const toggleRitual = (id: string) => {
        setCompleted(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Moon className="w-6 h-6 text-purple-400" />
                    <span>Wind Down</span>
                </h3>
                <p className="text-gray-400 text-sm">Prepare your body and mind for restorative rest.</p>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 flex flex-col items-center space-y-4">
                <Moon className="w-12 h-12 text-purple-500 animate-pulse" />
                <div className="text-center">
                    <p className="text-white font-bold">Evening Ritual Progress</p>
                    <p className="text-purple-400 text-xs uppercase tracking-widest font-bold">
                        {completed.length} of {EVENING_RITUALS.length} Done
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {EVENING_RITUALS.map((ritual) => (
                    <button
                        key={ritual.id}
                        onClick={() => toggleRitual(ritual.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${completed.includes(ritual.id)
                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex flex-col items-start">
                            <span className={`font-semibold ${completed.includes(ritual.id) ? 'line-through opacity-50' : ''}`}>
                                {ritual.label}
                            </span>
                            <span className="text-[10px] opacity-70 uppercase">{ritual.duration}</span>
                        </div>

                        {completed.includes(ritual.id) ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <Circle className="w-5 h-5 opacity-30" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WindDown;
