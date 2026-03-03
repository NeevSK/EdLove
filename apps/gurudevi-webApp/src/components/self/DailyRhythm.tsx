import React, { useState } from 'react';
import { Repeat, CheckCircle, Circle } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const INITIAL_HABITS = [
    { id: 'meditation', label: 'Meditation', completed: false },
    { id: 'hydration', label: 'Stay Hydrated', completed: false },
    { id: 'exercise', label: 'Morning Movement', completed: false },
    { id: 'gratitude', label: 'Express Gratitude', completed: false },
];

const DailyRhythm: React.FC = () => {
    const [habits, setHabits] = useState(INITIAL_HABITS);

    const toggleHabit = (id: string) => {
        setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    };

    return (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
            <SectionHeader
                title="Daily Rhythm"
                subtitle="Small daily cycles lead to great lifetime transcendence."
                icon={Repeat}
            />

            <div className="grid grid-cols-1 gap-3">
                {habits.map((habit) => (
                    <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all duration-300 ${habit.completed
                                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 opacity-60'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                    >
                        {habit.completed ? (
                            <CheckCircle className="w-6 h-6" />
                        ) : (
                            <Circle className="w-6 h-6 opacity-30" />
                        )}
                        <span className={`font-medium ${habit.completed ? 'line-through' : ''}`}>{habit.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-orange-400/5 rounded-2xl p-6 text-center border border-orange-400/10">
                <p className="text-2xl font-black text-orange-400">{habits.filter(h => h.completed).length}/{habits.length}</p>
                <p className="text-[10px] text-orange-400/60 uppercase font-black tracking-widest">Alignment Achieved</p>
            </div>
        </div>
    );
};

export default DailyRhythm;
