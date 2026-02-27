import React, { useState } from 'react';
import { Flame, Trash2 } from 'lucide-react';

const FireJournal: React.FC = () => {
    const [note, setNote] = useState('');
    const [isBurning, setIsBurning] = useState(false);

    const handleBurn = () => {
        if (!note.trim()) return;
        setIsBurning(true);
        setTimeout(() => {
            setNote('');
            setIsBurning(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span>Fire Journal</span>
                </h3>
                <p className="text-gray-400 text-sm">Release your burdens. Write them down and let them burn.</p>
            </div>

            <div className="relative group">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's heavy on your heart? Write it here..."
                    className={`w-full h-48 bg-black/20 border border-gray-700/50 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none ${isBurning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100'
                        } duration-1000`}
                />

                {isBurning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <Flame className="w-16 h-16 text-orange-500 animate-bounce" />
                            <div className="absolute inset-0 bg-orange-500/20 blur-2xl animate-pulse rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => setNote('')}
                    disabled={!note || isBurning}
                    className="p-3 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
                <button
                    onClick={handleBurn}
                    disabled={!note || isBurning}
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-900/40 disabled:opacity-50 transition-all truncate"
                >
                    <span>Burn & Release</span>
                    <Flame className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FireJournal;
