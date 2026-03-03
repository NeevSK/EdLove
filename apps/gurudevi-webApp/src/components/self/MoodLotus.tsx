import React, { useState } from 'react';
import { Flower, Sun, Shield, Wind, Flame, Cloud } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const PETALS = [
    { id: 'joy', color: 'bg-yellow-400', label: 'Joy', icon: Sun },
    { id: 'peace', color: 'bg-green-400', label: 'Peace', icon: Shield },
    { id: 'anxiety', color: 'bg-blue-400', label: 'Anxiety', icon: Wind },
    { id: 'anger', color: 'bg-red-400', label: 'Anger', icon: Flame },
    { id: 'sadness', color: 'bg-purple-400', label: 'Sadness', icon: Cloud },
];

const MoodLotus: React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-700">
            <SectionHeader
                title="Mood Lotus"
                subtitle="Check in with your inner weather. How are you feeling?"
                icon={Flower}
            />

            <div className="relative w-64 h-64 mt-4">
                {/* Mood Lotus Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-24 h-24 rounded-full transition-all duration-1000 blur-xl ${selected ? PETALS.find(p => p.id === selected)?.color : 'bg-orange-400/20'}`} />
                </div>

                {PETALS.map((petal, index) => {
                    const angle = (index * 360) / PETALS.length;
                    const isActive = selected === petal.id;

                    return (
                        <button
                            key={petal.id}
                            onClick={() => setSelected(petal.id)}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-24 rounded-[40%_40%_50%_50%] transition-all duration-500 hover:scale-110 shadow-lg ${isActive ? `${petal.color} scale-110 -translate-y-6 z-10` : 'bg-gray-800/40 border border-gray-700/50'
                                }`}
                            style={{
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, ${isActive ? '-40px' : '-50px'}) rotate(${-angle}deg)`,
                            }}
                        >
                            <petal.icon className={`w-6 h-6 mx-auto ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        </button>
                    );
                })}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-[#1a1a2e] rounded-full border border-gray-700/50 flex items-center justify-center shadow-inner">
                        <Flower className={`w-6 h-6 ${selected ? PETALS.find(p => p.id === selected)?.color.replace('bg-', 'text-') : 'text-gray-600'}`} />
                    </div>
                </div>
            </div>

            <div className="text-center min-h-[40px]">
                {selected && (
                    <p className="text-white font-black uppercase tracking-widest animate-in slide-in-from-bottom duration-500">
                        {selected} Resonance
                    </p>
                )}
            </div>
        </div>
    );
};

export default MoodLotus;
