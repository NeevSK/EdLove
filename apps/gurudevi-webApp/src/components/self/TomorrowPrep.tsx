import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, Circle } from 'lucide-react';

interface PrepItem {
    id: string;
    text: string;
    completed: boolean;
}

const TomorrowPrep: React.FC = () => {
    const [items, setItems] = useState<PrepItem[]>([]);
    const [input, setInput] = useState('');

    const addItem = () => {
        if (!input.trim()) return;
        setItems([...items, { id: Date.now().toString(), text: input, completed: false }]);
        setInput('');
    };

    const toggleItem = (id: string) => {
        setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    <span>Tomorrow's Prep</span>
                </h3>
                <p className="text-gray-400 text-sm">Organize your thoughts for a smoother tomorrow.</p>
            </div>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="New prep item..."
                    className="flex-1 bg-black/20 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
                <button
                    onClick={addItem}
                    disabled={!input.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-900/40"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center space-x-3 p-4 rounded-xl border transition-all ${item.completed
                                ? 'bg-blue-500/10 border-blue-500/20 text-gray-500'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                    >
                        {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                        ) : (
                            <Circle className="w-5 h-5 opacity-30" />
                        )}
                        <span className={`text-sm font-medium ${item.completed ? 'line-through' : ''}`}>
                            {item.text}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TomorrowPrep;
