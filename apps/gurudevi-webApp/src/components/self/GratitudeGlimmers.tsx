import React, { useState } from 'react';
import { Heart, Send, Sparkle } from 'lucide-react';

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
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Heart className="w-6 h-6 text-pink-500" />
                    <span>Gratitude Glimmers</span>
                </h3>
                <p className="text-gray-400 text-sm">Find the light in small moments.</p>
            </div>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="I am grateful for..."
                    className="flex-1 bg-black/20 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-all"
                />
                <button
                    onClick={addGlimmer}
                    disabled={!input.trim()}
                    className="p-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl disabled:opacity-50 transition-all"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {glimmers.map((glimmer) => (
                    <div
                        key={glimmer.id}
                        className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl flex items-center space-x-3 group animate-in zoom-in-95 duration-500"
                    >
                        <Sparkle className="w-4 h-4 text-pink-400 opacity-50 group-hover:scale-125 transition-transform" />
                        <span className="text-white text-sm font-medium">{glimmer.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GratitudeGlimmers;
