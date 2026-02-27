import React, { useState } from 'react';
import { Lightbulb, Plus, Zap } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

interface WisdomSeed {
    id: string;
    text: string;
    reflection: string;
}

const WisdomSeeds: React.FC = () => {
    const [seeds, setSeeds] = useState<WisdomSeed[]>([]);
    const [input, setInput] = useState('');

    const plantSeed = () => {
        if (!input.trim()) return;
        setSeeds([{
            id: Date.now().toString(),
            text: input,
            reflection: 'Reflecting on this growth...'
        }, ...seeds]);
        setInput('');
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <SectionHeader
                title="Wisdom Seeds"
                subtitle="Plant thoughts that will grow into your philosophy."
                icon={Lightbulb}
                iconColor="text-yellow-400"
            />

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="New seed of thought..."
                    className="flex-1 bg-yellow-900/5 border border-yellow-900/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && plantSeed()}
                />
                <button
                    onClick={plantSeed}
                    disabled={!input.trim()}
                    className="p-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-yellow-900/40"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {seeds.map((seed) => (
                    <div
                        key={seed.id}
                        className="bg-[#1a1a2e]/60 border border-yellow-500/10 rounded-3xl p-6 flex flex-col space-y-4 animate-in slide-in-from-bottom duration-700"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Zap className="w-4 h-4 text-yellow-400" />
                            </div>
                            <p className="text-white font-bold leading-tight">{seed.text}</p>
                        </div>
                        <div className="border-t border-yellow-500/10 pt-4">
                            <p className="text-gray-400 text-xs italic leading-relaxed">{seed.reflection}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WisdomSeeds;
