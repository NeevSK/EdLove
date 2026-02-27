import React, { useState } from 'react';
import { Lightbulb, Send, BookOpen } from 'lucide-react';

interface Seed {
    id: string;
    thought: string;
}

const WisdomSeeds: React.FC = () => {
    const [seeds, setSeeds] = useState<Seed[]>([]);
    const [input, setInput] = useState('');

    const sowSeed = () => {
        if (!input.trim()) return;
        setSeeds([{ id: Date.now().toString(), thought: input }, ...seeds]);
        setInput('');
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    <span>Wisdom Seeds</span>
                </h3>
                <p className="text-gray-400 text-sm">Plant a thought of wisdom to reflect on later.</p>
            </div>

            <div className="flex space-x-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="A seed of wisdom..."
                    className="flex-1 bg-black/20 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all resize-none h-20"
                />
                <button
                    onClick={sowSeed}
                    disabled={!input.trim()}
                    className="p-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl disabled:opacity-50 transition-all flex items-center"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {seeds.map((seed) => (
                    <div
                        key={seed.id}
                        className="p-6 bg-[#16213e]/40 border-l-4 border-yellow-500 rounded-r-2xl flex flex-col space-y-2 animate-in slide-in-from-left-2 duration-500"
                    >
                        <BookOpen className="w-4 h-4 text-yellow-500 opacity-50" />
                        <p className="text-white text-md font-serif italic italic font-medium leading-relaxed">
                            "{seed.thought}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WisdomSeeds;
