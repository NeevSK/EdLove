import React from 'react';
import { Sparkles } from 'lucide-react';

const SanctuaryIntroduction: React.FC = () => {
    return (
        <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-top duration-1000">
            <div className="flex items-center justify-center space-x-2 text-orange-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Deep Resonance</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Your Inner Sanctuary</h2>
            <p className="text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                A sacred space for teacher wellbeing and professional transcendence.
            </p>
        </div>
    );
};

export default SanctuaryIntroduction;
