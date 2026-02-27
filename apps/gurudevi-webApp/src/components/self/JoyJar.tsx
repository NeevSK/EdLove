import React, { useState } from 'react';
import { Sparkles, Plus, Star } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

interface JoyMoment {
    id: string;
    text: string;
    date: string;
}

const JoyJar: React.FC = () => {
    const [moments, setMoments] = useState<JoyMoment[]>([]);
    const [input, setInput] = useState('');

    const addMoment = () => {
        if (!input.trim()) return;
        const newMoment = {
            id: Date.now().toString(),
            text: input,
            date: new Date().toLocaleDateString(),
        };
        setMoments([newMoment, ...moments]);
        setInput('');
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <SectionHeader
                title="Joy Jar"
                subtitle="Capture the small sparks of light in your journey."
                icon={Sparkles}
            />

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Capture a spark..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && addMoment()}
                />
                <button
                    onClick={addMoment}
                    disabled={!input.trim()}
                    className="p-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-orange-900/40"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {moments.map((moment) => (
                    <div
                        key={moment.id}
                        className="bg-orange-400/5 border border-orange-400/10 rounded-2xl p-4 flex items-start space-x-4 animate-in slide-in-from-right duration-500"
                    >
                        <Star className="w-5 h-5 text-orange-400 mt-1 shrink-0" />
                        <div className="flex flex-col">
                            <p className="text-white text-sm font-medium leading-relaxed">{moment.text}</p>
                            <span className="text-[10px] text-orange-400/60 font-bold uppercase tracking-widest mt-2">{moment.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JoyJar;
