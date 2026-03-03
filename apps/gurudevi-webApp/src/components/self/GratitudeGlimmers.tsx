import React, { useState } from 'react';
import { Heart, Plus, Sparkles } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

interface Glimmer {
    id: string;
    text: string;
}

const GratitudeGlimmers: React.FC = () => {
    const [glimmers, setGlimmers] = useState<Glimmer[]>([]);
    const [input, setInput] = useState('');

    const addGlimmer = () => {
        if (!input.trim()) return;
        setGlimmers([{ id: Date.now().toString(), text: input }, ...glimmers]);
        setInput('');
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <SectionHeader
                title="Gratitude Glimmers"
                subtitle="Notice the subtle brilliance in the ordinary."
                icon={Heart}
            />

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="I am grateful for..."
                    className="flex-1 bg-pink-900/5 border border-pink-900/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-all italic"
                    onKeyPress={(e) => e.key === 'Enter' && addGlimmer()}
                />
                <button
                    onClick={addGlimmer}
                    disabled={!input.trim()}
                    className="p-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-pink-900/40"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {glimmers.map((glimmer) => (
                    <div
                        key={glimmer.id}
                        className="group relative bg-[#16213e]/40 p-5 rounded-2xl border border-pink-900/10 hover:border-pink-500/30 transition-all animate-in zoom-in duration-500"
                    >
                        <div className="absolute top-2 right-2 text-pink-500/20 group-hover:text-pink-500 transition-colors">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-white text-sm font-medium leading-relaxed italic">"{glimmer.text}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GratitudeGlimmers;
